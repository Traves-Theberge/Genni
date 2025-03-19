// Initialize storage when extension is installed or updated
chrome.runtime.onInstalled.addListener(details => {
  console.log("Extension installed or updated", details.reason);
  
  // Check if API key is set
  chrome.storage.sync.get(['openai_api_key'], result => {
    console.log("API key exists:", !!result.openai_api_key);
  });
});

chrome.commands.onCommand.addListener((command) => {
  if (command === "_execute_action") {
    console.log("Command executed:", command);
    
    chrome.tabs.captureVisibleTab({ format: 'png' }, (screenshotUrl) => {
      console.log("Screenshot captured");
      
      chrome.storage.local.set({ screenshot: screenshotUrl }, () => {
        console.log("Screenshot saved to storage");
        
        // Open the popup instead of creating a new window
        chrome.action.openPopup();
      });
    });
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
