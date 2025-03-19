# Genni Development Guide

## Quick Start

### Prerequisites
- Node.js (Latest LTS)
- Chrome or Edge browser
- OpenAI API key
- Git

### Setup
```bash
# Clone repository
git clone https://github.com/yourusername/Genni.git
cd Genni

```

### Installation
1. Install Genni:
   - Clone or download the repository
   - Click "Load unpacked" in your browser
   - Select the `src` directory from the downloaded files

2. Enable Developer Mode in your browser:
   - Edge: Go to `edge://extensions`
   - Chrome: Go to `chrome://extensions`
   - Toggle "Developer mode" switch in the top right

3. Configure the Extension:
   - Click the Genni icon in your browser toolbar
   - Open Settings and enter your OpenAI API key
   - Save your settings

## Project Structure

```
src/
├── manifest.json       # Extension configuration
├── background.js      # Service worker
├── content.js         # Page interaction script
├── popup/            
├── popup.html    # Main UI
├── popup.css     # UI styling
├── popup.js      # Core logic
├── options/
├── options.html  # Settings UI
├── options.css   # Settings styling
├── options.js    # Settings logic
└── assets/           # Static resources
```

### Making Changes
- Follow the coding style guide
- Update tests for new features
- Document API changes
- Test across supported platforms
