document.addEventListener("DOMContentLoaded", () => {
    const screenshotPreview = document.getElementById('screenshotPreview');
    const generateBtn = document.getElementById('generate');
    const insertBtn = document.getElementById('insertReply');
    const copyBtn = document.getElementById('copy');
    const aiReply = document.getElementById('aiReply');
    const optionsBtn = document.getElementById('optionsBtn');
    const toast = document.getElementById('toast');
    
    console.log("Popup opened - Initializing extension");
    
    // Adjust popup size based on content if needed
    function adjustPopupSize() {
        const contentHeight = document.body.scrollHeight;
        const viewportHeight = window.innerHeight;
        
        if (contentHeight > viewportHeight) {
            // If content is taller than viewport, ensure buttons are visible
            document.body.style.height = `${contentHeight}px`;
            console.log(`Adjusted popup height to ${contentHeight}px to fit content`);
        }
    }
    
    // Run size adjustment after content loads
    setTimeout(adjustPopupSize, 100);
    
    // Add a screenshot button if it doesn't exist yet
    let screenshotBtn = document.getElementById('takeScreenshot');
    if (!screenshotBtn) {
      screenshotBtn = document.createElement('button');
      screenshotBtn.id = 'takeScreenshot';
      screenshotBtn.textContent = 'Capture Screenshot 📷';
      screenshotBtn.setAttribute('aria-label', 'Take a screenshot of the current tab');
      
      // Insert the screenshot button at the beginning of the buttons container
      const buttonsContainer = document.querySelector('.buttons');
      if (buttonsContainer.firstChild) {
        buttonsContainer.insertBefore(screenshotBtn, buttonsContainer.firstChild);
      } else {
        buttonsContainer.appendChild(screenshotBtn);
      }
    }
  
    // Immediately check for API key on popup load
    checkApiKey();
  
    let hasScreenshot = false;
    // Load screenshot once at startup
    loadScreenshot();
    // Load previous reply if any
    loadPreviousReply();
    
    // Save reply text when it changes
    aiReply.addEventListener('input', () => {
      chrome.storage.local.set({ savedReply: aiReply.value });
      // Adjust popup size when textarea content changes
      setTimeout(adjustPopupSize, 100);
    });
    
    // Function to show toast notifications
    function showToast(message, duration = 2000) {
      toast.textContent = message;
      toast.classList.add('show');
      
      setTimeout(() => {
        toast.classList.remove('show');
      }, duration);
    }
    
    // Function to handle loading state for buttons
    function setLoading(button, isLoading, originalText) {
      if (isLoading) {
        button.classList.add('loading');
        button.disabled = true;
        if (originalText) button.textContent = originalText;
      } else {
        button.classList.remove('loading');
        button.disabled = false;
        if (originalText) button.textContent = originalText;
      }
    }
    
    function loadPreviousReply() {
      chrome.storage.local.get(['savedReply'], ({ savedReply }) => {
        if (savedReply) {
          aiReply.value = savedReply;
        }
      });
    }
    
    function loadScreenshot() {
      chrome.storage.local.get(['screenshot'], ({ screenshot }) => {
        console.log("Checking for existing screenshot:", !!screenshot);
        
        if (screenshot) {
          screenshotPreview.src = screenshot;
          hasScreenshot = true;
        } else {
          // If no screenshot, show a placeholder and message
          screenshotPreview.style.display = 'none';
          
          const screenshotContainer = document.getElementById('screenshot-container');
          if (screenshotContainer) {
            const placeholderMsg = document.createElement('div');
            placeholderMsg.className = 'placeholder-message';
            placeholderMsg.textContent = 'No screenshot. Click "Capture Screenshot" below.';
            screenshotContainer.insertBefore(placeholderMsg, screenshotPreview);
          }
        }
        
        // Run size adjustment after screenshot loads
        setTimeout(adjustPopupSize, 100);
      });
    }
    
    // Take screenshot button click handler
    screenshotBtn.onclick = () => {
      setLoading(screenshotBtn, true, 'Capturing...');
      
      chrome.tabs.captureVisibleTab({ format: 'png' }, (screenshotUrl) => {
        if (chrome.runtime.lastError) {
          console.error("Screenshot error:", chrome.runtime.lastError);
          aiReply.value = "Error taking screenshot. Make sure you have tab permissions.";
          setLoading(screenshotBtn, false, 'Capture Screenshot 📷');
          showToast('Error taking screenshot', 3000);
          return;
        }
        
        chrome.storage.local.set({ screenshot: screenshotUrl }, () => {
          console.log("Screenshot saved to storage");
          
          // Remove placeholder if it exists
          const placeholderMsg = document.querySelector('.placeholder-message');
          if (placeholderMsg) {
            placeholderMsg.remove();
          }
          
          // Show and update screenshot
          screenshotPreview.style.display = 'block';
          screenshotPreview.src = screenshotUrl;
          hasScreenshot = true;
          
          // Auto-focus the generate button
          generateBtn.focus();
          setLoading(screenshotBtn, false, 'Capture Screenshot 📷');
          showToast('Screenshot captured!');
          
          // Adjust popup size after screenshot loads
          setTimeout(adjustPopupSize, 100);
        });
      });
    };

    // Function to check API key
    function checkApiKey() {
      console.log("Checking API key...");
      
      // Try both sync and local storage to see if the key exists anywhere
      chrome.storage.sync.get(['openai_api_key'], (syncResult) => {
        // Don't log the actual key value for security
        console.log("Sync storage API key exists:", !!syncResult.openai_api_key);
        console.log("Sync storage API key begins with:", syncResult.openai_api_key ? syncResult.openai_api_key.substring(0, 5) + "..." : "N/A");
        
        chrome.storage.local.get(['openai_api_key'], (localResult) => {
          console.log("Local storage API key exists:", !!localResult.openai_api_key);
          console.log("Local storage API key begins with:", localResult.openai_api_key ? localResult.openai_api_key.substring(0, 5) + "..." : "N/A");
          
          // If we have a key in local but not sync, move it to sync
          if (!syncResult.openai_api_key && localResult.openai_api_key) {
            console.log("Moving API key from local to sync storage");
            chrome.storage.sync.set({openai_api_key: localResult.openai_api_key}, () => {
              console.log("API key moved to sync storage");
            });
          }
          
          // Show warning if no API key found
          if (!syncResult.openai_api_key && !localResult.openai_api_key) {
            showToast('API key not set. Please go to Settings.', 3000);
          }
        });
      });
    }
  
    generateBtn.onclick = async () => {
      try {
        // Set loading state
        setLoading(generateBtn, true, 'Generating...');
        
        // Check if we have a screenshot
        if (!hasScreenshot) {
          // Try to take a screenshot automatically
          chrome.tabs.captureVisibleTab({ format: 'png' }, (screenshotUrl) => {
            if (chrome.runtime.lastError || !screenshotUrl) {
              aiReply.value = "No screenshot found. Please click 'Take Screenshot' first.";
              setLoading(generateBtn, false, 'Generate Reply ✨');
              showToast('Screenshot needed first', 3000);
              return;
            }
            
            chrome.storage.local.set({ screenshot: screenshotUrl }, () => {
              // Remove placeholder if it exists
              const placeholderMsg = document.querySelector('.placeholder-message');
              if (placeholderMsg) {
                placeholderMsg.remove();
              }
              
              screenshotPreview.style.display = 'block';
              screenshotPreview.src = screenshotUrl;
              hasScreenshot = true;
              
              // Now continue with generation
              continueGeneration();
            });
          });
        } else {
          continueGeneration();
        }
        
        function continueGeneration() {
          aiReply.value = "Generating reply...";
          
          // Get the screenshot from local storage
          chrome.storage.local.get(['screenshot'], ({ screenshot }) => {
            if (!screenshot) {
              aiReply.value = "No screenshot found. Please click 'Take Screenshot' first.";
              setLoading(generateBtn, false, 'Generate Reply ✨');
              showToast('Screenshot needed first', 3000);
              return;
            }
            
            // Log for debugging
            console.log("Fetching API key from storage");
            
            // First get from sync storage
            chrome.storage.sync.get(['openai_api_key', 'model', 'systemPrompt'], (syncResult) => {
              console.log("Sync storage result received");
              
              let apiKey = syncResult.openai_api_key;
              const model = syncResult.model || 'gpt-4o-mini';
              const systemPrompt = syncResult.systemPrompt || 'Generate a concise, professional reply based on the provided screenshot. Your response should directly address the key points in the message, remaining brief, clear, and polite.';
              
              if (!apiKey) {
                console.log("No API key in sync storage, checking local storage");
                // Try local storage
                chrome.storage.local.get(['openai_api_key'], (localResult) => {
                  console.log("Local storage result received");
                  apiKey = localResult.openai_api_key;
                  
                  if (!apiKey) {
                    aiReply.value = "API key not set. Please set your API key in options.";
                    setLoading(generateBtn, false, 'Generate Reply ✨');
                    showToast('API key needed - go to Settings', 3000);
                    return;
                  }
                  
                  // Relaxed validation - just check if it's a string with some minimum length
                  if (typeof apiKey !== 'string' || apiKey.length < 5) {
                    aiReply.value = "API key appears to be invalid. Please check your API key in options.";
                    setLoading(generateBtn, false, 'Generate Reply ✨');
                    showToast('Invalid API key', 3000);
                    return;
                  }
                  
                  // Continue with API call
                  makeApiCall(apiKey, model, systemPrompt, screenshot);
                });
              } else {
                // Relaxed validation - just check if it's a string with some minimum length
                if (typeof apiKey !== 'string' || apiKey.length < 5) {
                  aiReply.value = "API key appears to be invalid. Please check your API key in options.";
                  setLoading(generateBtn, false, 'Generate Reply ✨');
                  showToast('Invalid API key', 3000);
                  return;
                }
                
                // Continue with API call directly
                makeApiCall(apiKey, model, systemPrompt, screenshot);
              }
            });
          });
        }
      } catch (error) {
        aiReply.value = `Error: ${error.message || "Failed to generate reply. Please try again."}`;
        console.error("Error in generate function:", error);
        setLoading(generateBtn, false, 'Generate Reply ✨');
        showToast('Error generating reply', 3000);
      }
    };
    
    // Helper function to make the API call
    function makeApiCall(apiKey, model, systemPrompt, screenshot) {
      // Verify that apiKey is a proper string
      if (!apiKey || typeof apiKey !== 'string') {
        aiReply.value = "Invalid API key detected. Please go to Options and set a valid OpenAI API key.";
        setLoading(generateBtn, false, 'Generate Reply ✨');
        return;
      }

      // Log info without exposing the full key
      console.log("Making API call with model:", model);
      console.log("API key begins with:", apiKey.substring(0, 5) + "...");
      console.log("API key length:", apiKey.length);
      
      // Ensure proper content-type for image URL
      const imageContent = screenshot.startsWith('data:image/') 
        ? [{ type: "image_url", image_url: { url: screenshot } }]
        : "No valid screenshot found. Please take a new screenshot.";
      
      if (typeof imageContent === 'string') {
        aiReply.value = imageContent;
        setLoading(generateBtn, false, 'Generate Reply ✨');
        return;
      }
      
      fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: model,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: imageContent }
          ],
          max_tokens: 200
        })
      })
      .then(response => {
        console.log("API response status:", response.status);
        if (!response.ok) {
          return response.json().then(err => {
            console.error("API error details:", err);
            throw new Error(err.error?.message || `Network error: ${response.status}`);
          });
        }
        return response.json();
      })
      .then(data => {
        console.log("API response received successfully");
        aiReply.value = data.choices[0].message.content;
        // Save the generated reply
        chrome.storage.local.set({ savedReply: aiReply.value });
        setLoading(generateBtn, false, 'Generate Reply ✨');
        showToast('Reply generated successfully!');
      })
      .catch(error => {
        console.error("API call failed:", error);
        setLoading(generateBtn, false, 'Generate Reply ✨');
        
        // Provide user-friendly error messages
        if (error.message.includes("invalid_api_key") || error.message.includes("Incorrect API key")) {
          aiReply.value = "Your OpenAI API key appears to be invalid. Please go to Options and enter a valid key.";
          showToast('Invalid API key', 3000);
        } else if (error.message.includes("Rate limit")) {
          aiReply.value = "OpenAI rate limit reached. Please wait a moment and try again.";
          showToast('Rate limit reached', 3000);
        } else {
          aiReply.value = `Error: ${error.message || "Failed to generate reply. Please try again."}`;
          showToast('Error generating reply', 3000);
        }
      });
    }
  
    insertBtn.onclick = () => {
      if (!aiReply.value || aiReply.value.startsWith("Error:") || aiReply.value === "Generating reply...") {
        alert("Please generate a valid reply first.");
        return;
      }
      
      // Function to check for and fix duplicated content
      const checkAndCleanReply = (text) => {
        const firstLines = text.split('\n').slice(0, 3).join('\n');
        const isDuplicated = text.indexOf(firstLines, firstLines.length) > 0;
        
        if (isDuplicated) {
          console.warn("Detected duplicated content, cleaning up before sending...");
          // Find the unique part and only send that
          const lines = text.split('\n');
          const uniqueLines = [];
          const seenLines = new Set();
          
          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed || seenLines.has(trimmed)) continue;
            seenLines.add(trimmed);
            uniqueLines.push(line);
          }
          
          return uniqueLines.join('\n');
        }
        
        return text;
      };
      
      const cleanReply = checkAndCleanReply(aiReply.value);
      if (cleanReply !== aiReply.value) {
        console.log("Cleaned up duplicated content");
        aiReply.value = cleanReply;
        // Save the cleaned reply
        chrome.storage.local.set({ savedReply: cleanReply });
      }
      
      console.log("Insert Reply button clicked, attempting to insert:", aiReply.value.substring(0, 20) + "...");
      
      // Set loading state
      setLoading(insertBtn, true, 'Inserting...');
      
      // Get the current active tab in the window that opened the popup
      chrome.tabs.query({ active: true, lastFocusedWindow: true }, (tabs) => {
        if (tabs && tabs.length > 0 && tabs[0].id) {
          const tabId = tabs[0].id;
          console.log("Sending message to tab:", tabId);
          
          // Execute the content script if it hasn't been injected yet
          chrome.scripting.executeScript({
            target: { tabId: tabId },
            files: ['content.js']
          }).then(() => {
            // Now send the message
            chrome.tabs.sendMessage(tabId, { 
              action: "insertReply", 
              reply: aiReply.value 
            }, (response) => {
              if (chrome.runtime.lastError) {
                console.error("Error inserting reply:", chrome.runtime.lastError);
                setLoading(insertBtn, false, 'Insert Reply 📤');
                showToast('Failed to insert reply', 3000);
              } else if (response && response.success) {
                console.log("Reply inserted successfully");
                
                // Give visual feedback
                setLoading(insertBtn, false, 'Inserted! ✓');
                showToast('Reply inserted successfully!');
                
                setTimeout(() => {
                  insertBtn.textContent = 'Insert Reply 📤';
                }, 2000);
              } else {
                console.error("Failed to insert reply:", response ? response.error : "Unknown error");
                setLoading(insertBtn, false, 'Insert Reply 📤');
                showToast('No compatible input field found', 3000);
              }
            });
          }).catch(err => {
            console.error("Error injecting content script:", err);
            setLoading(insertBtn, false, 'Insert Reply 📤');
            showToast('Failed to insert reply', 3000);
          });
        } else {
          console.error("No active tab found");
          setLoading(insertBtn, false, 'Insert Reply 📤');
          showToast('Cannot access the current page', 3000);
        }
      });
    };
  
    copyBtn.onclick = () => {
      if (!aiReply.value || aiReply.value.startsWith("Error:") || aiReply.value === "Generating reply...") {
        showToast('Please generate a valid reply first', 3000);
        return;
      }
      
      navigator.clipboard.writeText(aiReply.value)
        .then(() => {
          setLoading(copyBtn, false, 'Copied! ✓');
          showToast('Copied to clipboard!');
          
          setTimeout(() => {
            copyBtn.textContent = 'Copy 📋';
          }, 2000);
        })
        .catch(err => {
          console.error("Error copying text: ", err);
          showToast('Failed to copy to clipboard', 3000);
        });
    };
  
    optionsBtn.onclick = () => {
      chrome.runtime.openOptionsPage();
    };
  });
  