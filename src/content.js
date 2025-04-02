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
    
    // Track the active element when the user invokes the extension
    let activeElement = document.activeElement;
    console.log("Current active element when inserting:", activeElement ? activeElement.tagName : "None");
    
    // Check if there's a text selection within a contenteditable area
    const selection = window.getSelection();
    let selectionContainer = null;
    
    if (selection && !selection.isCollapsed && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      const container = range.commonAncestorContainer;
      
      // Check if the container or its parent is a valid input field
      if (isValidInputField(container)) {
        selectionContainer = container;
      } else if (container.parentElement && isValidInputField(container.parentElement)) {
        selectionContainer = container.parentElement;
      }
      
      if (selectionContainer) {
        console.log("Found selection container:", selectionContainer.tagName);
      }
    }
    
    // Function to check if an element is a valid input field
    function isValidInputField(element) {
      if (!element || !element.tagName) return false;
      
      const tagName = element.tagName.toLowerCase();
      const isInput = tagName === 'input' && (element.type === 'text' || element.type === 'search');
      const isTextArea = tagName === 'textarea';
      const isContentEditable = element.isContentEditable || 
                               (element.getAttribute && element.getAttribute('contenteditable') === 'true');
      const isVisible = element.offsetParent !== null && 
                       !element.disabled && 
                       !element.readOnly && 
                       !element.hasAttribute("readonly");
                       
      return (isInput || isTextArea || isContentEditable) && isVisible;
    }

    // Check if we're on X.com (Twitter)
    const isTwitterOrX = window.location.hostname.includes('twitter.com') || 
                         window.location.hostname.includes('x.com');
    
    // First try to use the element with active selection or focus
    let replyBox = selectionContainer || (isValidInputField(activeElement) ? activeElement : null);
    let matchedSelector = replyBox ? "direct-focus" : "";
    
    // If no suitable element found through selection/focus, try selectors as fallback
    if (!replyBox) {
      // More comprehensive list of selectors for input fields
      const selectors = [
        // X.com (Twitter) specific selectors - new interface
        "[data-testid='tweetTextarea_0']",
        "[data-testid='tweetTextInput_0']",
        "[data-text='true']",
        "div[role='textbox'][aria-multiline='true']",
        "div[role='textbox'][data-testid='tweetTextarea_0']",
        "div[contenteditable='true'][aria-multiline='true']",
        // Chat and messaging inputs
        ".msg-form__contenteditable",
        "[aria-label='Message Body']",
        "[aria-label='Message body']",
        "[aria-label='Message']",
        "[aria-label='Type a message']",
        "[placeholder='Send a message']",
        "[placeholder*='Type a message']",
        "[placeholder*='message']",
        "[placeholder*='Message']",
        // Rich text editors
        ".public-DraftEditor-content", // React Draft.js editor
        ".ql-editor", // Quill editor
        ".ProseMirror", // ProseMirror editor
        ".tox-edit-area__iframe", // TinyMCE
        "[role='textbox']",
        // Generic input types
        "[contenteditable='true']",
        // Fallbacks
        "textarea[name='message']",
        "textarea[placeholder*='message']",
        "textarea[placeholder*='Message']",
        "textarea:not([disabled]):not([readonly])",
        "input[type='text']:not([disabled]):not([readonly])"
      ];

      // Try to find an appropriate input field
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
    }

    // Special handling for Twitter/X.com
    if (isTwitterOrX && !replyBox) {
      console.log("On X.com/Twitter - trying special methods");
      
      // Try to find all contenteditable divs
      const allContentEditableDivs = document.querySelectorAll('div[contenteditable="true"]');
      console.log(`Found ${allContentEditableDivs.length} contenteditable divs on X.com`);
      
      // Try to find divs with role=textbox
      const allRoleTextboxDivs = document.querySelectorAll('div[role="textbox"]');
      console.log(`Found ${allRoleTextboxDivs.length} role=textbox divs on X.com`);
      
      // Check visible elements
      for (const element of [...allContentEditableDivs, ...allRoleTextboxDivs]) {
        const style = window.getComputedStyle(element);
        if (style.display !== 'none' && style.visibility !== 'hidden' && style.opacity !== '0' && 
            element.offsetParent !== null) {
          console.log("Found potential X.com input field:", element);
          replyBox = element;
          matchedSelector = "x-special";
          break;
        }
      }
      
      // If still not found, look at what's around the placeholder
      if (!replyBox) {
        // Find placeholder elements that might indicate where the input is
        const placeholders = document.querySelectorAll('[placeholder], [data-placeholder]');
        for (const placeholder of placeholders) {
          if (placeholder.textContent.includes('Post') || 
              placeholder.getAttribute('placeholder')?.includes('Post') ||
              placeholder.getAttribute('data-placeholder')?.includes('Post')) {
            console.log("Found X.com placeholder element:", placeholder);
            
            // Check the element itself
            if (placeholder.isContentEditable) {
              replyBox = placeholder;
              matchedSelector = "x-placeholder";
              break;
            }
            
            // Check parent
            const parent = placeholder.parentElement;
            if (parent && parent.isContentEditable) {
              replyBox = parent;
              matchedSelector = "x-placeholder-parent";
              break;
            }
            
            // Check siblings
            const siblings = placeholder.parentElement?.children;
            if (siblings) {
              for (const sibling of siblings) {
                if (sibling !== placeholder && 
                    (sibling.isContentEditable || 
                     sibling.getAttribute('role') === 'textbox')) {
                  replyBox = sibling;
                  matchedSelector = "x-placeholder-sibling";
                  break;
                }
              }
            }
          }
        }
      }
    }

    // Handle iframes - websites like Gmail use iframes for composition
    if (!replyBox) {
      const iframes = document.querySelectorAll('iframe');
      console.log(`Found ${iframes.length} iframes, attempting to access their content...`);
      
      for (const iframe of iframes) {
        try {
          // Only proceed if we can access the iframe content (same-origin policy)
          const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
          
          // Try to find focused element in iframe
          const iframeFocused = iframeDoc.activeElement;
          if (isValidInputField(iframeFocused)) {
            replyBox = iframeFocused;
            matchedSelector = "iframe-focused-element";
            console.log("Found focused input element in iframe:", iframeFocused.tagName);
            break;
          }
          
          // Try standard input selectors within iframe
          for (const tag of ['textarea', 'div[contenteditable="true"]', 'body[contenteditable="true"]']) {
            const elements = iframeDoc.querySelectorAll(tag);
            if (elements.length > 0) {
              for (const element of elements) {
                if (element.offsetParent !== null && !element.disabled && !element.readOnly) {
                  replyBox = element;
                  matchedSelector = `iframe-${tag}`;
                  console.log("Found input element in iframe:", element.tagName);
                  break;
                }
              }
            }
            if (replyBox) break;
          }
        } catch (e) {
          console.log("Cannot access iframe content due to same-origin policy:", e);
        }
        
        if (replyBox) break;
      }
    }

    if (replyBox) {
      try {
        console.log(`Using element matched by: ${matchedSelector}`);
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
            
            // Special handling for X.com
            if (!inserted && isTwitterOrX) {
              console.log("Using special X.com insertion method");
              // Try setting innerHTML 
              const currentHTML = replyBox.innerHTML;
              if (!currentHTML || currentHTML === '<br>' || currentHTML === '<br/>') {
                replyBox.innerHTML = request.reply;
                inserted = true;
                console.log("X.com innerHTML insertion successful");
              } else {
                // Try direct typing simulation
                replyBox.focus();
                document.execCommand('selectAll', false, null);
                document.execCommand('insertText', false, request.reply);
                inserted = true;
                console.log("X.com simulated typing insertion");
              }
              
              // Trigger input events to make sure X.com registers the change
              replyBox.dispatchEvent(new Event('input', { bubbles: true }));
              replyBox.dispatchEvent(new Event('change', { bubbles: true }));
              
              // Also fire more specific events that Twitter might be listening for
              ['keydown', 'keyup', 'keypress'].forEach(eventType => {
                replyBox.dispatchEvent(new KeyboardEvent(eventType, { bubbles: true }));
              });
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
      
      // Log more details about the page to assist debugging
      const isOnTwitter = window.location.hostname.includes('twitter.com') || window.location.hostname.includes('x.com');
      console.log("Page info - URL:", window.location.href);
      console.log("Is on X/Twitter:", isOnTwitter);
      
      // List potential input candidates that might have been missed
      const potentialCandidates = [
        'div[role="textbox"]', 
        'div[contenteditable="true"]',
        '[data-testid*="tweet"]',
        '[aria-label*="post"]',
        '[aria-label*="tweet"]',
        '[aria-label*="reply"]'
      ];
      
      for (const selector of potentialCandidates) {
        const elements = document.querySelectorAll(selector);
        if (elements.length > 0) {
          console.log(`Found ${elements.length} potential input elements matching ${selector} that were not selected:`, elements);
        }
      }
      
      const visibleInputs = document.querySelectorAll('input, textarea, [contenteditable="true"]');
      console.log(`Found ${visibleInputs.length} generic input elements on page`);
      sendResponse({ success: false, error: "No compatible input field found" });
    }
    return true;
  } else if (request.action === "trackFocus") {
    // This message allows popup to ask which element has focus before opening
    const activeElement = document.activeElement;
    const tagName = activeElement ? activeElement.tagName : "none";
    const isInput = activeElement && (
      activeElement.tagName === "INPUT" || 
      activeElement.tagName === "TEXTAREA" || 
      activeElement.isContentEditable
    );
    
    console.log("Current focus:", tagName, isInput);
    sendResponse({ 
      hasFocus: !!activeElement,
      element: tagName,
      isInput: isInput
    });
    return true;
  }
  return true;
});

// Store the last focused element
let lastFocusedInput = null;

// Track focus events on potential input fields
document.addEventListener('focusin', (event) => {
  const target = event.target;
  
  // Check if this is a potential input field
  if (target.tagName === 'INPUT' || 
      target.tagName === 'TEXTAREA' || 
      target.isContentEditable || 
      target.getAttribute('contenteditable') === 'true' ||
      target.role === 'textbox') {
    
    lastFocusedInput = target;
    console.log("Focus detected on input element:", target.tagName);
  }
}, true);
