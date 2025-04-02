# Genni - AI Response Generator

Genni is a Chrome extension that uses AI to generate professional responses based on screenshots. It's perfect for quickly composing replies to emails, messages, or any text content visible on your screen.

## Features

- **Screenshot-Based Responses**: Capture your screen and get AI-generated responses based on the content
- **Multiple AI Providers**: Choose between OpenAI or Google Gemini
- **Customizable**: Adjust temperature settings and system prompts to control response style
- **Keyboard Shortcut**: Quickly activate Genni with Ctrl+Shift+Q
- **Privacy-Focused**: Your API keys are stored locally in your browser

## Installation

1. Download or clone this repository
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" in the top-right corner
4. Click "Load unpacked" and select the Genni directory
5. The extension is now installed and ready to use!

## Setup

1. Click the Genni icon in your Chrome toolbar to open the popup
2. Go to Settings (⚙️) to configure your API keys
3. Choose your preferred AI provider:
   - **OpenAI**: Requires an API key from [OpenAI Platform](https://platform.openai.com/)
   - **Google Gemini**: Requires an API key from [Google AI Studio](https://aistudio.google.com/)
4. Save your settings

## Usage

### Method 1: Keyboard Shortcut
1. Press `Ctrl+Shift+Q` to capture the current page and open the Genni menu
2. Wait for the AI to analyze the screenshot and generate a response
3. Copy the generated text or make edits as needed

### Method 2: Extension Button
1. Click the Genni icon in your Chrome toolbar
2. The extension will capture the current page and generate a response
3. Copy or customize the response to your needs

## Customization

### System Prompt
The system prompt guides the AI's response style. You can modify it in the Settings page to better suit your communication needs.

### Temperature
Adjust the temperature slider to control how creative the AI responses should be:
- Lower values (0.1-0.3): More consistent, conservative responses
- Medium values (0.4-0.7): Balanced creativity and consistency
- Higher values (0.8-1.0): More varied, creative responses

## Troubleshooting

### Keyboard Shortcut Not Working
- Make sure no other extensions are using the same keyboard shortcut
- Try restarting Chrome
- Verify the extension is enabled
- Check Chrome's keyboard shortcut settings at `chrome://extensions/shortcuts`

### API Key Issues
- Confirm your API key is correctly entered without extra spaces
- Verify your API key is active and has sufficient credits
- Use the "Test API Key" button to check key validity

## Privacy & Data

Genni processes screenshots using the AI provider you choose. Screenshots are temporarily stored in your browser's local storage and are not sent to any server other than the AI provider's API endpoint.

Your API keys are stored in Chrome's secure storage and are only used to authenticate with your chosen AI provider.

## Support & Feedback

For support, feature requests, or bug reports, please [open an issue](https://github.com/Traves-Theberge/genni/issues) or contact the developer.

---

Made with ❤️ by Traves Theberge
