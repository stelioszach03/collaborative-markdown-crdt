/**
 * @module utils
 */

export const isCallbackSet = false;

/**
 * @param {Uint8Array} update
 * @param {any} origin
 * @param {WSSharedDoc} doc
 */
export const callbackHandler = (update, origin, doc) => {
  if (isCallbackSet) {
    // Execute the callback
    console.log('Callback handler executed');
  }
};