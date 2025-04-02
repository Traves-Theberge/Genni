// Initialize storage when extension is installed or updated
chrome.runtime.onInstalled.addListener(details => {
  console.log("Extension installed or updated", details.reason);
  
  // Check if API key is set
  chrome.storage.sync.get(['openai_api_key', 'gemini_api_key'], result => {
    console.log("API keys exist:", {
      openai: !!result.openai_api_key,
      gemini: !!result.gemini_api_key
    });
  });
});

chrome.commands.onCommand.addListener((command) => {
  if (command === "_execute_action") {
    console.log("Command executed:", command);
    
    // First query for the currently active tab
    chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
      if (tabs.length > 0) {
        const activeTab = tabs[0];
        
        // First ask the content script which element has focus
        chrome.tabs.sendMessage(activeTab.id, {action: "trackFocus"}, (response) => {
          // Record if we found a focused input for later use
          let hasFocusedInput = response && response.isInput;
          
          console.log("Focus data:", response);
          
          // Store this information for the popup
          chrome.storage.local.set({ 
            lastFocusedElementInfo: response || {hasFocus: false} 
          });
          
          // Then capture the screenshot
          chrome.tabs.captureVisibleTab({ format: 'png' }, (screenshotUrl) => {
            console.log("Screenshot captured");
            
            chrome.storage.local.set({ 
              screenshot: screenshotUrl,
              capturedAt: new Date().toISOString(),
              tabId: activeTab.id,
              hasFocusedInput: hasFocusedInput
            }, () => {
              console.log("Screenshot and focus data saved to storage");
              
              // Open the popup
              chrome.action.openPopup();
            });
          });
        });
      }
    });
  }
});

// Listen for keyboard shortcuts
chrome.commands.onCommand.addListener((command) => {
  console.log('Command triggered:', command);
  
  if (command === "open_menu") {
    // Forward the shortcut action to any open extension pages
    chrome.runtime.sendMessage({action: "triggerShortcut"});
    
    // Open the extension popup
    chrome.action.openPopup();
  }
});

// Listen for storage changes for debugging
chrome.storage.onChanged.addListener((changes, namespace) => {
  for (let key in changes) {
    console.log(`Storage key "${key}" in namespace "${namespace}" changed:`, {
      oldValue: changes[key].oldValue ? "exists" : "undefined",
      newValue: changes[key].newValue ? "exists" : "undefined"
    });
  }
});

// Log when the background script loads
console.log("Background script loaded");
