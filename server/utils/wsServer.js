/**
 * Απλοποιημένη υλοποίηση του y-websocket server
 * Βασισμένη στο y-websocket/bin/utils.js αλλά χωρίς εξαρτήσεις από leveldb/mongodb
 */

import * as Y from 'yjs';
import * as syncProtocol from 'y-protocols/sync';
import * as awarenessProtocol from 'y-protocols/awareness';
import * as encoding from 'lib0/encoding';
import * as decoding from 'lib0/decoding';
import * as map from 'lib0/map';
import { storeUpdate } from '../utils/documentStore.js';

// Σταθερές για τύπους μηνυμάτων
const messageSync = 0;
const messageAwareness = 1;

// Χάρτης εγγράφων
const docs = new Map();

/**
 * Ενημερώνει όλες τις συνδέσεις για ενημερώσεις στο έγγραφο
 * @param {Uint8Array} update - Τα δεδομένα ενημέρωσης
 * @param {any} origin - Η προέλευση της ενημέρωσης
 * @param {Y.Doc} doc - Το έγγραφο
 */
const updateHandler = (update, origin, doc) => {
  console.log(`Document updated: ${doc.name}, origin: ${origin?.userId || 'unknown'}`);
  
  // Αποθήκευση της ενημέρωσης στο σύστημα αρχείων
  if (doc.name) {
    storeUpdate(doc.name, update, origin);
  }

  // Δημιουργία μηνύματος για αποστολή στους clients
  const encoder = encoding.createEncoder();
  encoding.writeVarUint(encoder, messageSync);
  syncProtocol.writeUpdate(encoder, update);
  const message = encoding.toUint8Array(encoder);

  // Αποστολή σε όλες τις συνδέσεις
  doc.conns.forEach((_, conn) => {
    send(doc, conn, message);
  });
};

/**
 * Αποστέλλει ένα μήνυμα σε μια σύνδεση
 */
const send = (doc, conn, message) => {
  if (conn.readyState !== 1) { // Έλεγχος αν η σύνδεση είναι ανοιχτή
    console.log(`Connection not open, closing connection for document: ${doc.name}`);
    closeConn(doc, conn);
    return;
  }

  try {
    conn.send(message, (err) => {
      if (err) {
        console.error(`Error sending message: ${err.message}`);
        closeConn(doc, conn);
      }
    });
  } catch (e) {
    console.error(`Exception sending message: ${e.message}`);
    closeConn(doc, conn);
  }
};

/**
 * Κλείνει μια σύνδεση και καθαρίζει τις σχετικές καταστάσεις
 */
const closeConn = (doc, conn) => {
  if (doc.conns.has(conn)) {
    console.log(`Closing connection for document: ${doc.name}`);
    const controlledIds = doc.conns.get(conn);
    doc.conns.delete(conn);

    // Αφαίρεση των καταστάσεων awareness του χρήστη
    awarenessProtocol.removeAwarenessStates(
      doc.awareness,
      Array.from(controlledIds),
      null
    );

    // Αν δεν υπάρχουν άλλες συνδέσεις, καθαρισμός πόρων
    if (doc.conns.size === 0) {
      console.log(`No more connections for document: ${doc.name}`);
      // Τα έγγραφα παραμένουν στη μνήμη για επαναχρησιμοποίηση
      // αλλά θα μπορούσαμε να τα αφαιρέσουμε εάν θέλουμε να εξοικονομήσουμε μνήμη
      // docs.delete(doc.name);
      // doc.destroy();
    }
  }

  // Κλείσιμο της σύνδεσης αν δεν είναι ήδη κλειστή
  if (conn.readyState !== 3) { // 3 = CLOSED
    try {
      conn.close();
    } catch (e) {
      console.error(`Error closing connection: ${e.message}`);
    }
  }
};

/**
 * Επεξεργάζεται τα εισερχόμενα μηνύματα από τις συνδέσεις WebSocket
 */
const messageListener = (conn, doc, message) => {
  try {
    const decoder = decoding.createDecoder(message);
    const encoder = encoding.createEncoder();
    const messageType = decoding.readVarUint(decoder);

    switch (messageType) {
      case messageSync: {
        encoding.writeVarUint(encoder, messageSync);
        syncProtocol.readSyncMessage(decoder, encoder, doc, null);
        
        // Αποστολή απάντησης αν υπάρχει
        if (encoding.length(encoder) > 1) {
          send(doc, conn, encoding.toUint8Array(encoder));
        }
        break;
      }
      case messageAwareness: {
        // Εφαρμογή ενημερώσεων awareness
        awarenessProtocol.applyAwarenessUpdate(
          doc.awareness,
          decoding.readVarUint8Array(decoder),
          conn
        );
        break;
      }
      default:
        console.warn(`Unknown message type: ${messageType}`);
    }
  } catch (err) {
    console.error('Σφάλμα επεξεργασίας μηνύματος WebSocket:', err);
  }
};

/**
 * Επιστρέφει ένα Y.Doc από το όνομά του, δημιουργώντας το αν δεν υπάρχει
 */
const getYDoc = (docName, gc = true) => {
  console.log(`Getting document: ${docName}, exists: ${docs.has(docName)}`);
  
  return map.setIfUndefined(docs, docName, () => {
    console.log(`Creating new document: ${docName}`);
    
    // Δημιουργία νέου εγγράφου
    const doc = new Y.Doc({ gc });
    doc.name = docName;
    
    // Δημιουργία χάρτη συνδέσεων
    doc.conns = new Map();
    
    // Ρύθμιση του Awareness
    doc.awareness = new awarenessProtocol.Awareness(doc);
    
    // Προσθήκη χειριστή ενημερώσεων
    doc.on('update', updateHandler);
    
    // Ρύθμιση χειριστή για ενημερώσεις awareness
    doc.awareness.on('update', ({ added, updated, removed }) => {
      const changedClients = added.concat(updated, removed);
      
      // Ενημέρωση συνδέσεων που ελέγχουν τα IDs
      if (removed.length > 0) {
        doc.conns.forEach((controlledIds, conn) => {
          removed.forEach(clientID => {
            controlledIds.delete(clientID);
          });
        });
      }
      
      if (added.length > 0 || updated.length > 0) {
        doc.conns.forEach((controlledIds, conn) => {
          added.forEach(clientID => {
            controlledIds.add(clientID);
          });
        });
      }
      
      // Αποστολή ενημέρωσης σε όλες τις συνδέσεις
      const encoder = encoding.createEncoder();
      encoding.writeVarUint(encoder, messageAwareness);
      encoding.writeVarUint8Array(
        encoder,
        awarenessProtocol.encodeAwarenessUpdate(doc.awareness, changedClients)
      );
      
      const buff = encoding.toUint8Array(encoder);
      doc.conns.forEach((_, c) => {
        send(doc, c, buff);
      });
    });
    
    return doc;
  });
};

/**
 * Ρυθμίζει μια σύνδεση WebSocket για ένα συγκεκριμένο έγγραφο
 */
export const setupWSConnection = (ws, req, { docName = req.url.slice(1).split('?')[0], gc = true } = {}) => {
  console.log(`Accepting WebSocket connection for document: ${docName}`);
  
  // Ρύθμιση του τύπου δεδομένων σε δυαδικά
  ws.binaryType = 'arraybuffer';
  
  // Προσθήκη χειριστών σφαλμάτων
  ws.on('error', (err) => {
    console.error(`WebSocket error for document ${docName}:`, err);
  });
  
  // Λήψη του εγγράφου
  const doc = getYDoc(docName, gc);
  
  // Αρχικοποίηση του συνόλου ελεγχόμενων IDs για αυτήν τη σύνδεση
  doc.conns.set(ws, new Set());
  console.log(`Connection established, total connections for ${docName}: ${doc.conns.size}`);
  
  // Ρύθμιση χειριστή μηνυμάτων
  ws.on('message', (message) => {
    messageListener(ws, doc, new Uint8Array(message));
  });
  
  // Ρύθμιση χειριστή κλεισίματος
  ws.on('close', () => {
    console.log(`WebSocket closed for document: ${docName}`);
    closeConn(doc, ws);
  });
  
  // Αρχική συγχρονισμός - βήμα 1
  const encoder = encoding.createEncoder();
  encoding.writeVarUint(encoder, messageSync);
  syncProtocol.writeSyncStep1(encoder, doc);
  send(doc, ws, encoding.toUint8Array(encoder));
  
  // Αποστολή των τρεχουσών καταστάσεων awareness
  const awarenessStates = doc.awareness.getStates();
  if (awarenessStates.size > 0) {
    console.log(`Sending initial awareness states (${awarenessStates.size}) for document: ${docName}`);
    const encoder = encoding.createEncoder();
    encoding.writeVarUint(encoder, messageAwareness);
    encoding.writeVarUint8Array(
      encoder,
      awarenessProtocol.encodeAwarenessUpdate(doc.awareness, Array.from(awarenessStates.keys()))
    );
    send(doc, ws, encoding.toUint8Array(encoder));
  }
};