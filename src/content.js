chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log("Content script received message:", request.action);
  
  if (request.action === "insertReply") {
    console.log("Attempting to insert reply...");
    
    // Check if the reply is already in the request to prevent duplication
    if (request.reply.includes(request.reply.substring(0, 20) + request.reply.substring(0, 20))) {
      console.warn("Detected duplicated content, trimming...");
      // Find the first unique occurrence and use only that
      const firstPart = request.reply.substring(0, 100); // Use a reasonable chunk
      let originalText = "";
      
      // Find where the duplication starts
      for (let i = 10; i < firstPart.length; i++) {
        if (request.reply.indexOf(firstPart.substring(0, i)) === 0 && 
            request.reply.indexOf(firstPart.substring(0, i), i) > 0) {
          originalText = request.reply.substring(0, request.reply.indexOf(firstPart.substring(0, i), i));
          console.log("Trimmed to original text:", originalText);
          request.reply = originalText;
          break;
        }
      }
      
      // If pattern detection failed, limit to first reasonable chunk
      if (!originalText) {
        request.reply = request.reply.substring(0, 300);
        console.log("Truncated to first 300 chars");
      }
    }
    
    // More comprehensive list of selectors for input fields
    const selectors = [
      // Chat and messaging inputs
      ".msg-form__contenteditable",
      "[aria-label='Message Body']",
      "[aria-label='Message body']",
      "[aria-label='Message']",
      "[aria-label='Type a message']",
      "[data-testid='tweetTextarea_0']", // Twitter/X
      "[placeholder='Send a message']",
      "[placeholder*='Type a message']",
      "[placeholder*='message']",
      "[placeholder*='Message']",
      // Generic input types
      "[role='textbox']",
      "[contenteditable='true']",
      "[data-text='true']",
      ".public-DraftEditor-content", // React Draft.js editor
      // Fallbacks
      "textarea[name='message']",
      "textarea[placeholder*='message']",
      "textarea[placeholder*='Message']",
      "textarea",
      "input[type='text']"
    ];

    // Try to find an appropriate input field
    let replyBox = null;
    let matchedSelector = "";
    
    for (const selector of selectors) {
      const elements = document.querySelectorAll(selector);
      console.log(`Found ${elements.length} elements matching selector: ${selector}`);
      
      for (const element of elements) {
        // Check if the element is visible
        if (element.offsetParent !== null && 
            element.disabled !== true && 
            !element.readOnly && 
            !element.hasAttribute("readonly") &&
            (element.nodeName !== "TEXTAREA" || !element.hasAttribute("disabled"))) {
          
          // Check for element visibility more thoroughly
          const style = window.getComputedStyle(element);
          if (style.display !== 'none' && style.visibility !== 'hidden' && style.opacity !== '0') {
            replyBox = element;
            matchedSelector = selector;
            console.log("Found usable input element:", element.tagName, selector);
            break;
          }
        }
      }
      
      if (replyBox) break;
    }

    if (replyBox) {
      try {
        console.log(`Using element matched by selector: ${matchedSelector}`);
        replyBox.focus();
        
        if (replyBox.tagName === "TEXTAREA" || replyBox.tagName === "INPUT") {
          // For standard input elements
          const start = replyBox.selectionStart || 0;
          const end = replyBox.selectionEnd || 0;
          const text = replyBox.value;
          replyBox.value = text.substring(0, start) + request.reply + text.substring(end);
          replyBox.selectionStart = replyBox.selectionEnd = start + request.reply.length;
          
          // Dispatch input event to trigger any listeners
          replyBox.dispatchEvent(new Event('input', { bubbles: true }));
          replyBox.dispatchEvent(new Event('change', { bubbles: true }));
          
          console.log("Reply inserted into input element successfully");
          sendResponse({ success: true });
        } else {
          // For contenteditable elements - use only ONE insertion method
          let inserted = false;
          
          try {
            // Method 1: Direct text insertion
            if (!inserted) {
              const currentText = replyBox.textContent || replyBox.innerText || '';
              
              // Check for potential duplication
              if (currentText.includes(request.reply)) {
                console.warn("Text already present in target element, skipping insertion");
                sendResponse({ success: true, message: "Text already present" });
                inserted = true;
              } else {
                // Try direct setting of content if element is empty
                if (!currentText.trim()) {
                  replyBox.textContent = request.reply;
                  console.log("Direct content assignment successful");
                  inserted = true;
                }
              }
            }
            
            // Method 2: execCommand insertText
            if (!inserted) {
              replyBox.focus();
              // Only try this once
              if (document.execCommand('insertText', false, request.reply)) {
                console.log("Reply inserted via execCommand");
                inserted = true;
              }
            }
            
            // Method 3: Selection-based insertion (last resort)
            if (!inserted) {
              const selection = window.getSelection();
              if (selection.rangeCount > 0) {
                const range = selection.getRangeAt(0);
                // Clear any existing selection in the element
                range.selectNodeContents(replyBox);
                range.collapse(true); // Collapse to start
                
                const textNode = document.createTextNode(request.reply);
                range.insertNode(textNode);
                
                // Move selection after insert
                range.setStartAfter(textNode);
                range.setEndAfter(textNode);
                selection.removeAllRanges();
                selection.addRange(range);
                console.log("Reply inserted via text node insertion");
                inserted = true;
              }
            }
            
            if (inserted) {
              sendResponse({ success: true });
            } else {
              sendResponse({ success: false, error: "No insertion method worked" });
            }
          } catch (e) {
            console.error("Error inserting text:", e);
            sendResponse({ success: false, error: e.toString() });
          }
        }
      } catch (error) {
        console.error("Error during reply insertion:", error);
        sendResponse({ success: false, error: error.toString() });
      }
    } else {
      console.error("No compatible input field found on this page");
      const visibleInputs = document.querySelectorAll('input, textarea');
      console.log(`Found ${visibleInputs.length} generic input elements on page`);
      sendResponse({ success: false, error: "No compatible input field found" });
    }
    return true;
  }
  return true;
});
  