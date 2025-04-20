# Article Editor

A modern web-based article editor that allows you to create, edit, and manage articles with a rich set of components.

## Features

- **Drag-and-Drop Interface**: Easily add and arrange components
- **Rich Text Components**: Headlines, subheaders, body text, and quotes
- **Media Support**: Add images and videos
- **Layout Components**: Single column, two columns, and containers
- **Draft Management**: Save and load multiple drafts
- **Preview Functionality**: Preview your article before downloading
- **HTML Export**: Download your article as a complete HTML package

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```

## Usage

### Adding Components
1. Drag components from the sidebar to the editor
2. Click on text components to edit content
3. Use the style panel to customize appearance

### Managing Media
1. Click on image/video components to upload files
2. Media files are automatically stored and managed
3. Preview media directly in the editor

### Draft Management
1. Click "Save as Draft" to save your current work
2. Enter a name for your draft
3. Use the dropdown to load previously saved drafts
4. Delete drafts you no longer need

### Previewing Articles
1. Click the "Preview" button in the toolbar
2. A modal will open showing how your article will look
3. The preview includes all components, styles, and media
4. Close the preview by clicking the X button or outside the modal

### Exporting Articles
1. Click "Download HTML" to export your article
2. The export includes:
   - HTML file with all content
   - Media folder with all images and videos
   - Proper styling and layout

## Component Types

### Text Components
- **Headline**: Large heading text
- **Subheader**: Medium-sized heading
- **Body Text**: Regular paragraph text
- **Quote**: Styled blockquote

### Media Components
- **Image**: Upload and display images
- **Video**: Upload and embed videos

### Layout Components
- **Single Column**: Vertical content layout
- **Two Columns**: Side-by-side content layout
- **Container**: Group and style multiple components

## Technical Details

- Built with React and TypeScript
- Uses IndexedDB for draft storage
- Implements drag-and-drop with react-dnd
- Responsive design for all screen sizes

## Browser Support

- Chrome (recommended)
- Firefox
- Safari
- Edge

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License.

## Support

For support, please [add your support contact information]
