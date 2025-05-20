#!/bin/bash

# Output file
OUTPUT_FILE="project_code.md"

# Clear the output file if it exists
> "$OUTPUT_FILE"

# Function to add a file to the output
add_file() {
    local file="$1"
    
    # Skip if file doesn't exist
    if [ ! -f "$file" ]; then
        echo "Skipping non-existent file: $file"
        return
    fi
    
    # Get file extension
    ext="${file##*.}"
    
    # Add file header
    echo -e "\n\n# File: ${file}\n" >> "$OUTPUT_FILE"
    echo '```'${ext} >> "$OUTPUT_FILE"
    
    # Add file content
    cat "$file" >> "$OUTPUT_FILE"
    
    # Close code block
    echo '```' >> "$OUTPUT_FILE"
    echo -e "\n" >> "$OUTPUT_FILE"
}

# Add project header
echo "# Collaborative Markdown Editor - Project Code" >> "$OUTPUT_FILE"
echo -e "\nThis file contains all the code from the project, organized by file.\n" >> "$OUTPUT_FILE"

# Add timestamp
echo "Generated on: $(date)" >> "$OUTPUT_FILE"

# Add each file explicitly based on the provided directory structure
add_file "client/index.html"
add_file "client/package.json"
add_file "client/src/App.jsx"
add_file "client/src/components/Editor/Editor.jsx"
add_file "client/src/components/Editor/EditorToolbar.jsx"
add_file "client/src/components/Editor/MarkdownPreview.jsx"
add_file "client/src/components/Editor/UserCursor.jsx"
add_file "client/src/components/UI/Analytics/AnalyticsPanel.jsx"
add_file "client/src/components/UI/Header.jsx"
add_file "client/src/components/UI/Sidebar.jsx"
add_file "client/src/components/UI/ThemeToggle.jsx"
add_file "client/src/components/UI/UserPresence.jsx"
add_file "client/src/components/Visualizations/CollaborationMap.jsx"
add_file "client/src/components/Visualizations/EditHistory.jsx"
add_file "client/src/context/DocumentContext.jsx"
add_file "client/src/context/ThemeContext.jsx"
add_file "client/src/hooks/useCRDT.js"
add_file "client/src/hooks/useMarkdown.js"
add_file "client/src/hooks/useWebSocket.js"
add_file "client/src/index.css"
add_file "client/src/main.jsx"
add_file "client/src/utils/crdt.js"
add_file "client/src/utils/markdown.js"
add_file "client/tailwind.config.js"
add_file "client/vite.config.js"
add_file "docker/client.Dockerfile"
add_file "docker/nginx.conf"
add_file "docker/server.Dockerfile"
add_file "docker-compose.yml"
add_file "README.md"
add_file "server/controllers/analyticsController.js"
add_file "server/controllers/documentController.js"
add_file "server/index.js"
add_file "server/models/Document.js"
add_file "server/package.json"
add_file "server/routes/documentRoutes.js"
add_file "server/socket/socketHandler.js"
add_file "server/utils/crdtMerge.js"
add_file "server/utils/documentStore.js"

echo "Project code has been exported to $OUTPUT_FILE"