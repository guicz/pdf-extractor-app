# PDF Extractor Web Application

A modern web application for extracting, analyzing, and processing PDF documents using the PDF Extractor API.

## Features

- **Document Management**:
  - Upload PDF documents with drag and drop interface
  - Secure file storage with session-based UUIDs
  - Document listing and management

- **Content Extraction**:
  - Integration with PDF Extractor API
  - Support for OCR via API options
  - Visualization of extracted content

- **Prompt Management**:
  - Library of preset prompts for common analyses
  - Custom prompt creation and storage
  - Session-based prompt storage

- **Content Analysis**:
  - Process extracted content with AI models
  - Support for multiple LLM models (Claude Sonnet 3.7, OpenAI o3-mini)
  - Real-time analysis processing

- **Result Visualization**:
  - Three-panel view (original document, extracted content, analysis)
  - PDF document viewer with pagination and zoom
  - Syntax highlighting for structured content

- **Export Options**:
  - Export analysis results in multiple formats
  - Markdown, plain text, and HTML exports
  - Custom filename generation

## Technical Stack

- **Frontend**: Next.js 14+, React 18, TailwindCSS with DaisyUI
- **State Management**: React Context and Hooks
- **API Integration**: Axios
- **PDF Handling**: react-pdf for viewing
- **Storage**: Server-side file system with UUID organization

## Getting Started

### Prerequisites

- Node.js 20.x or higher
- PDF Extractor API running (see separate documentation)

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd pdf-extractor-app
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create necessary directories:
   ```bash
   mkdir -p uploads prompts
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

5. The application will be available at http://localhost:55000

## API Integration

The application integrates with the PDF Extractor API running at http://localhost:56002. Make sure the API is running before using the extraction features.

- **Authentication**: Set `PDF_EXTRACTOR_API_KEY` in the server environment (or an untracked `.env.local` for development). PM2 reads this variable from its launching environment. The server proxies add the Bearer token; the browser never receives it. Requests fail without a configured key, while builds do not require one.
- **Exposed credentials**: Revoke and replace any previously committed key before deployment. Removing it from the current files does not revoke it or remove it from Git history.
- **Endpoints**: The application uses a proxy to communicate with the API

## Session Management

- Sessions are maintained using both client and server-side storage
- Files are organized by session UUID on the server
- Cookie-based session tracking ensures consistent user experience

## Project Structure

```
pdf-extractor-app/
├── public/          # Static assets
├── src/
│   ├── app/         # Next.js app router
│   ├── components/  # React components
│   └── lib/         # Utility functions and API clients
├── uploads/         # Server-side file storage (session-based)
└── prompts/         # Prompt storage (presets and user prompts)
```

## License

This project is licensed under the MIT License - see the LICENSE file for details.
