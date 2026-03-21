# DDR Song Client (OutFox Manager)

A powerful web-based client and manager for Dance Dance Revolution (DDR) simfiles, specifically designed for **Project OutFox** and other StepMania-based simulators.

## Features

- **🔍 Search & Discover**: Search for thousands of simfiles directly from [Zenius-I-Vanisher](https://zenius-i-vanisher.com/) within the app.
- **📊 Song Insights**: View detailed information before downloading, including BPM, audio/banner/background quality ratings, and YouTube previews.
- **📥 Direct Downloads**: Download and install simfiles directly into your Project OutFox songs directory. The app handles downloading, extraction, and folder organization automatically.
- **📂 Collection Management**: Create, delete, and organize your song collections (folders) with ease.
- **✏️ Metadata Editor**: Edit song titles, subtitles, artists, and genres directly through the web interface.
- **🚚 Song Organizer**: Move songs between different collections or delete them when they're no longer needed.
- **⚡ Real-time Progress**: Monitor download and extraction progress through a built-in notification system.

## Tech Stack

- **Frontend**: React (v19), Vite, Tailwind CSS, Zustand (State Management), React Router.
- **Backend**: Node.js, Express, Cheerio (Web Scraping), Decompress.
- **Validation**: Zod (Schema Validation), React Hook Form.

## Prerequisites

- **Node.js**: v25.8.1 or higher (as specified in `.nvmrc` or `package.json`).
- **Project OutFox**: Currently supports macOS and Linux installations.
  - **macOS**: Looks for OutFox in `/Applications/OutFox/`.
  - **Linux**: Looks for OutFox in `~/.project-outfox`.

## Getting Started

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/DDR-Song-Client.git
   cd DDR-Song-Client
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

### Running the Application

1. **Start the Backend Server**:
   ```bash
   npm run server
   ```
   The server will run on `http://localhost:3000`.

2. **Start the Frontend (Development Mode)**:
   ```bash
   npm run dev
   ```
   The client will typically be available at `http://localhost:5173`.

### Building for Production

To build both the client and server:
```bash
npm run build
```

## How it Works

The application acts as a bridge between online simfile repositories and your local OutFox installation. It uses a Node.js Express server to:
1. Proxy and scrape search results from Zenius-I-Vanisher.
2. Direct-download ZIP files to your OutFox `Songs` directory.
3. Automatically unzip and clean up temporary files.
4. Provide a REST API for the React frontend to manage the local filesystem.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT
