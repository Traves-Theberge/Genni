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

## Development Workflow
```bash
# Start development server
npm run dev

# Load extension in browser
1. Open chrome://extensions
2. Enable Developer mode
3. Load unpacked -> select 'src' directory
```

### 2. Making Changes
- Follow the coding style guide
- Update tests for new features
- Document API changes
- Test across supported platforms

## Component Development

### Background Service (background.js)
```javascript
// Listen for commands
chrome.commands.onCommand.addListener((command) => {
  if (command === "_execute_action") {
    // Handle command
  }
});

// Handle installation
chrome.runtime.onInstalled.addListener((details) => {
  // Setup code
});
```

### Content Script (content.js)
```javascript
// Platform detection
const getPlatform = () => {
  const url = window.location.href;
  // Platform detection logic
};

// Reply insertion
const insertReply = (text) => {
  const element = findInputElement();
  // Insertion logic
};
```

### Popup Interface
```javascript
// Screenshot capture
const captureScreen = async () => {
  try {
    const screenshot = await chrome.tabs.captureVisibleTab();
    // Process screenshot
  } catch (error) {
    handleError(error);
  }
};

// API communication
const generateReply = async (screenshot) => {
  // API call implementation
};
```

## API Integration

### OpenAI Vision API
```javascript
const callVisionAPI = async (screenshot) => {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'user',
          content: [{
            type: 'image_url',
            image_url: { url: screenshot }
          }]
        }
      ]
    })
  });
  return await response.json();
};
```

## Storage Management

### Chrome Storage
```javascript
// Save settings
const saveSettings = async (settings) => {
  await chrome.storage.sync.set(settings);
};

// Load settings
const loadSettings = async () => {
  return await chrome.storage.sync.get([
    'openai_api_key',
    'model',
    'systemPrompt'
  ]);
};
```

## Error Handling

### Custom Error Classes
```javascript
class APIError extends Error {
  constructor(message, status) {
    super(message);
    this.name = 'APIError';
    this.status = status;
  }
}

class CaptureError extends Error {
  constructor(message) {
    super(message);
    this.name = 'CaptureError';
  }
}
```

## Platform Support

### Adding New Platforms
1. Update content.js selectors
2. Add platform-specific logic
3. Test insertion methods
4. Update documentation

### Platform Integration Example
```javascript
const platforms = {
  linkedin: {
    selector: '.msg-form__contenteditable',
    insertMethod: 'direct'
  },
  gmail: {
    selector: '[aria-label="Message Body"]',
    insertMethod: 'rich-text'
  }
};
```

### Distribution Package
- Minified code
- Optimized assets
- Source maps (optional)
- Documentation

## Contributing Guidelines

### Code Style
- Use ESLint configuration
- Follow naming conventions
- Comment complex logic
- Write unit tests

### Pull Request Process
1. Fork repository
2. Create feature branch
3. Make changes
4. Run tests
5. Submit PR

### Documentation
- Update README.md
- Add JSDoc comments
- Update API documentation
- Include examples

## Security Best Practices

### API Key Handling
- Never commit API keys
- Use secure storage
- Implement key rotation
- Validate keys server-side

### Data Security
- Minimize data collection
- Use HTTPS only
- Implement CSP
- Regular security audits

## Performance Optimization

### Best Practices
- Lazy load components
- Optimize images
- Cache API responses
- Debounce events

### Memory Management
- Clear unused data
- Monitor memory usage
- Implement cleanup
- Use weak references

## Debugging Tips

### Chrome DevTools
- Background page debugging
- Content script inspection
- Network monitoring
- Storage examination

### Common Issues
- Permission errors
- API rate limits
- DOM mutations
- Storage quotas

## Release Process

### Version Control
1. Update version in manifest.json
2. Update changelog
3. Tag release
4. Create release notes

### Distribution
1. Build production package
2. Test in clean environment
3. Submit to stores
4. Monitor rollout 