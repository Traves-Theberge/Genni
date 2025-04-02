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
      console.log("On X.com/Twitter - trying specialized X handling");
      
      // IMPROVED: More specific targeting for X.com's latest interface
      const xInputSelectors = [
        // Primary compose box selector (most reliable)
        "div[data-testid='tweetTextarea_0'][role='textbox']",
        // Reply box selector
        "div[data-testid='tweetTextarea_0'][aria-label*='Reply']",
        // Quote tweet
        "div[data-testid='tweetTextarea_0'][aria-label*='Quote']",
        // Generic textbox with specific X attributes
        "div[role='textbox'][data-contents='true']",
        // Contenteditable divs with data attributes specific to X
        "div[contenteditable='true'][data-block='true']",
        // The most specific placeholder for tweet composition
        "div[data-placeholder='What is happening?!']",
        // The most specific placeholder for replies
        "div[data-placeholder*='Reply']",
      ];
      
      // First try the more specific X selectors
      for (const selector of xInputSelectors) {
        const elements = document.querySelectorAll(selector);
        console.log(`Found ${elements.length} X-specific elements matching selector: ${selector}`);
        
        if (elements.length > 0) {
          // Use the most visible element if there are multiple matches
          for (const element of elements) {
            const style = window.getComputedStyle(element);
            const rect = element.getBoundingClientRect();
            
            // Check if element is visible and in the viewport
            if (style.display !== 'none' && 
                style.visibility !== 'hidden' && 
                style.opacity !== '0' && 
                element.offsetParent !== null &&
                rect.height > 20 && // Must have reasonable height
                rect.bottom > 0 && 
                rect.top < window.innerHeight) {
                
              console.log("Found X input element with selector:", selector);
              replyBox = element;
              matchedSelector = "x-specific-" + selector;
              break;
            }
          }
        }
        
        if (replyBox) break;
      }
      
      // Fallback to standard approach if specific selectors failed
      if (!replyBox) {
        // Try to find all contenteditable divs
        const allContentEditableDivs = document.querySelectorAll('div[contenteditable="true"]');
        console.log(`Found ${allContentEditableDivs.length} contenteditable divs on X.com`);
        
        // Try to find divs with role=textbox
        const allRoleTextboxDivs = document.querySelectorAll('div[role="textbox"]');
        console.log(`Found ${allRoleTextboxDivs.length} role=textbox divs on X.com`);
        
        // Check visible elements - prioritize elements in the more central/bottom area of the screen
        // which is where X usually has its compose boxes
        const candidates = [...allContentEditableDivs, ...allRoleTextboxDivs];
        const scoredCandidates = candidates.map(element => {
          const rect = element.getBoundingClientRect();
          const style = window.getComputedStyle(element);
          
          // Skip invisible elements
          if (style.display === 'none' || 
              style.visibility === 'hidden' || 
              style.opacity === '0' ||
              element.offsetParent === null) {
            return { element, score: -1 };
          }
          
          // Calculate position score - prefer elements in lower half of screen
          const verticalPositionScore = rect.top / window.innerHeight; // 0 = top, ~1 = bottom
          const positionScore = verticalPositionScore * 5; // Weight position more
          
          // Size score - prefer larger elements which are likely compose boxes
          const sizeScore = (rect.width * rect.height) / 10000;
          
          // Prefer empty or nearly empty elements (likely unused compose boxes)
          const contentScore = (element.textContent?.trim().length || 0) < 10 ? 3 : 0;
          
          // Extra points for elements with specific X-related attributes
          const attributeScore = element.getAttribute('data-testid')?.includes('tweet') ? 5 : 0;
          
          const totalScore = positionScore + sizeScore + contentScore + attributeScore;
          return { element, score: totalScore };
        });
        
        // Sort by score descending and take the best candidate
        scoredCandidates.sort((a, b) => b.score - a.score);
        const bestCandidate = scoredCandidates.find(c => c.score > 0);
        
        if (bestCandidate) {
          replyBox = bestCandidate.element;
          matchedSelector = "x-scored-candidate";
          console.log("Selected X.com input by score:", bestCandidate.score);
        }
      }
      
      // Last resort: try finding parent elements of placeholders
      if (!replyBox) {
        // Find placeholder elements that might indicate where the input is
        const placeholders = document.querySelectorAll('[placeholder], [data-placeholder]');
        for (const placeholder of placeholders) {
          if (placeholder.getAttribute('placeholder')?.includes('Post') ||
              placeholder.getAttribute('placeholder')?.includes('Tweet') ||
              placeholder.getAttribute('placeholder')?.includes('Reply') ||
              placeholder.getAttribute('data-placeholder')?.includes('Post') ||
              placeholder.getAttribute('data-placeholder')?.includes('Tweet') ||
              placeholder.getAttribute('data-placeholder')?.includes('Reply') ||
              placeholder.getAttribute('aria-label')?.includes('Post') ||
              placeholder.getAttribute('aria-label')?.includes('Tweet') ||
              placeholder.getAttribute('aria-label')?.includes('Reply')) {
            console.log("Found X.com placeholder element:", placeholder);
            
            // Check the element itself
            if (placeholder.isContentEditable) {
              replyBox = placeholder;
              matchedSelector = "x-placeholder";
              break;
            }
            
            // Check parent hierarchy up to 3 levels
            let parent = placeholder.parentElement;
            let level = 0;
            while (parent && level < 3) {
              if (parent.isContentEditable || parent.getAttribute('role') === 'textbox') {
                replyBox = parent;
                matchedSelector = `x-placeholder-parent-${level}`;
                break;
              }
              parent = parent.parentElement;
              level++;
            }
            
            if (replyBox) break;
            
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
            
            if (replyBox) break;
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
            // IMPROVED: Special handling for X.com with more specific approach
            if (isTwitterOrX) {
              console.log("Using improved X.com insertion method");
              
              // Take a safer approach with X's React-based interface
              try {
                // Focus first to ensure proper event handling
                replyBox.focus();
                
                // Use a safer approach - accumulate text content first
                const currentText = replyBox.textContent || '';
                
                // Check if we shouldn't insert (already there)
                if (currentText.includes(request.reply)) {
                  console.log("Text already present, skipping X.com insertion");
                  sendResponse({ success: true, message: "Text already present" });
                  return true;
                }
                
                // Use execCommand which is better supported by X.com
                document.execCommand('insertText', false, request.reply);
                
                // Fire a minimal set of events to trigger X's state updates
                replyBox.dispatchEvent(new Event('input', { bubbles: true }));
                
                // Verify insertion
                if (replyBox.textContent.includes(request.reply)) {
                  console.log("X.com insertion successful via execCommand");
                  inserted = true;
                } else {
                  // Fallback to direct content manipulation as a last resort
                  replyBox.textContent = request.reply;
                  console.log("X.com insertion using direct textContent");
                  inserted = true;
                }
                
                // If insertion was successful
                if (inserted) {
                  sendResponse({ success: true });
                  return true;
                }
              } catch (xError) {
                console.error("X.com specific insertion failed:", xError);
              }
            }
            
            // For non-X sites or if X-specific handling failed
            
            // Method 1: Direct text insertion for empty fields
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
            
            // Method 2: execCommand insertText (most compatible)
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
