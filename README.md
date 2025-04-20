# Article Editor

A modern web-based article editor that allows users to create, edit, and export articles with rich media content. The application features a drag-and-drop interface, real-time preview, and draft management system.

## Features

- **Rich Content Editor**: Create articles with various content types including:
  - Headlines
  - Subheaders
  - Body text
  - Quotes
  - Images
  - Videos
  - Multi-column layouts

- **Media Support**:
  - Upload and manage images and videos
  - Automatic media file organization
  - Base64 encoding for media storage

- **Draft Management**:
  - Save multiple drafts with custom names
  - Load previous drafts
  - Delete drafts
  - Automatic draft sorting by date
  - Persistent storage using IndexedDB

- **Export Functionality**:
  - Export articles as HTML with media files
  - Automatic ZIP file generation
  - Proper media file organization in exported package

## Technical Stack

- **Frontend Framework**: React
- **State Management**: React Hooks
- **Storage**: IndexedDB for draft management
- **File Handling**: JSZip for ZIP file creation
- **File Saving**: file-saver for client-side file downloads

## Project Structure

```
src/
├── components/
│   ├── ArticleToolbar.tsx      # Main toolbar with save/load/export functionality
│   ├── ContentPreview.tsx      # Article preview component
│   ├── DragAndDrop.tsx         # Drag and drop interface
│   ├── MediaUploader.tsx       # Media file upload component
│   └── RichTextEditor.tsx      # Text editing component
├── App.tsx                     # Main application component
└── index.tsx                   # Application entry point
```

## Setup and Installation

1. Clone the repository:
   ```bash
   git clone [repository-url]
   cd [project-directory]
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm start
   ```

4. Open your browser and navigate to `http://localhost:3000`

## Usage Guide

### Creating an Article

1. Start by adding components using the drag-and-drop interface
2. Use the toolbar to add different types of content:
   - Text components (headlines, subheaders, body text)
   - Media components (images, videos)
   - Layout components (columns, containers)

### Managing Media Files

1. Click the media upload button to add images or videos
2. Media files are automatically processed and stored
3. Files are organized in the exported package under the `media` directory

### Working with Drafts

1. **Saving a Draft**:
   - Click "Save as Draft" in the toolbar
   - Enter a name for your draft
   - Click Save to store the current state

2. **Loading a Draft**:
   - Click the "Load Draft" dropdown
   - Select the draft you want to load
   - The article will be restored to the saved state

3. **Deleting a Draft**:
   - Select the draft from the dropdown
   - Click the delete button
   - Confirm the deletion

### Exporting Articles

1. Click "Download HTML" in the toolbar
2. A ZIP file will be generated containing:
   - `index.html`: The main article file
   - `media/`: Directory containing all media files
3. The exported package is ready to be deployed or shared

## Draft Storage Details

The application uses IndexedDB for draft storage with the following structure:

- **Database Name**: `article_drafts`
- **Store Name**: `drafts`
- **Draft Structure**:
  ```typescript
  interface Draft {
    id: string;        // Timestamp-based unique identifier
    name: string;      // User-provided draft name
    date: string;      // Creation date
    components: Component[]; // Article components
  }
  ```

## Error Handling

The application includes comprehensive error handling for:
- Media file uploads
- Draft operations (save, load, delete)
- Export operations
- User input validation

Error messages are displayed in a user-friendly format and can be dismissed.

## Browser Compatibility

The application is compatible with modern browsers that support:
- IndexedDB
- File API
- Drag and Drop API
- ES6+ JavaScript features

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

[Add your license information here]

## Support

For support, please [add your support contact information]
