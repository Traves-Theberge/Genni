document.addEventListener("DOMContentLoaded", () => {
    const apiKeyInput = document.getElementById('apiKey');
    const modelSelect = document.getElementById('model');
    const systemPromptInput = document.getElementById('systemPrompt');
    const saveBtn = document.getElementById('save');
    const showKeyBtn = document.getElementById('showKey');
    const testKeyBtn = document.getElementById('testKey');
    const status = document.getElementById('status');
    const toggleTutorialBtn = document.getElementById('toggleTutorial');
    const toggleTosBtn = document.getElementById('toggleTos');
    const tutorialContent = document.getElementById('tutorial');
    const tosContent = document.getElementById('tos');
    
    console.log("Options page loaded");
    
    // Add animation class to elements gradually for a staggered effect
    function animateElements() {
      const elements = Array.from(document.querySelectorAll('.input-group, .tutorial-container, .tos-container'));
      elements.forEach((el, index) => {
        setTimeout(() => {
          el.style.opacity = '1';
          el.style.transform = 'translateY(0)';
        }, 100 * index);
      });
    }
    
    // Run animations after page loads
    setTimeout(animateElements, 100);
    
    // Smooth scroll to sections when they're expanded
    function scrollToElement(element, duration = 300) {
      const rect = element.getBoundingClientRect();
      const isInView = (rect.top >= 0) && (rect.bottom <= window.innerHeight);
      
      if (!isInView) {
        element.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }
    
    // Function to set status message with animation
    function setStatus(message, isError = false) {
      // Clear previous status animation
      status.style.opacity = '0';
      
      setTimeout(() => {
        status.textContent = message;
        status.style.color = isError ? "#f43f5e" : "#10b981";
        status.style.opacity = '1';
        
        if (!isError) {
          setTimeout(() => { 
            status.style.opacity = '0';
            setTimeout(() => { status.textContent = ''; }, 300);
          }, 3000);
        }
      }, 300);
    }
    
    // Toggle tutorial visibility with animation
    toggleTutorialBtn.addEventListener('click', () => {
      // First, collapse the other section if it's open
      if (!tosContent.classList.contains('hidden')) {
        tosContent.classList.add('hidden');
        toggleTosBtn.textContent = 'Show Terms';
      }
      
      // Then toggle this section
      const isHidden = tutorialContent.classList.contains('hidden');
      
      if (isHidden) {
        tutorialContent.classList.remove('hidden');
        tutorialContent.style.opacity = '0';
        tutorialContent.style.maxHeight = '0';
        
        setTimeout(() => {
          tutorialContent.style.opacity = '1';
          tutorialContent.style.maxHeight = '300px';
          scrollToElement(tutorialContent);
        }, 10);
        
        toggleTutorialBtn.textContent = 'Hide Tutorial';
      } else {
        tutorialContent.style.opacity = '0';
        tutorialContent.style.maxHeight = '0';
        
        setTimeout(() => {
          tutorialContent.classList.add('hidden');
          toggleTutorialBtn.textContent = 'Show Tutorial';
        }, 300);
      }
    });
    
    // Toggle ToS visibility with animation
    toggleTosBtn.addEventListener('click', () => {
      // First, collapse the other section if it's open
      if (!tutorialContent.classList.contains('hidden')) {
        tutorialContent.classList.add('hidden');
        toggleTutorialBtn.textContent = 'Show Tutorial';
      }
      
      // Then toggle this section
      const isHidden = tosContent.classList.contains('hidden');
      
      if (isHidden) {
        tosContent.classList.remove('hidden');
        tosContent.style.opacity = '0';
        tosContent.style.maxHeight = '0';
        
        setTimeout(() => {
          tosContent.style.opacity = '1';
          tosContent.style.maxHeight = '300px';
          scrollToElement(tosContent);
        }, 10);
        
        toggleTosBtn.textContent = 'Hide Terms';
      } else {
        tosContent.style.opacity = '0';
        tosContent.style.maxHeight = '0';
        
        setTimeout(() => {
          tosContent.classList.add('hidden');
          toggleTosBtn.textContent = 'Show Terms';
        }, 300);
      }
    });
    
    // Toggle API key visibility with improved animation
    showKeyBtn.addEventListener('click', () => {
      if (apiKeyInput.type === 'password') {
        apiKeyInput.type = 'text';
        showKeyBtn.textContent = '🔒';
        showKeyBtn.title = 'Hide API Key';
        // Auto-hide after 5 seconds
        setTimeout(() => {
          apiKeyInput.type = 'password';
          showKeyBtn.textContent = '👁️';
          showKeyBtn.title = 'Show API Key';
        }, 5000);
      } else {
        apiKeyInput.type = 'password';
        showKeyBtn.textContent = '👁️';
        showKeyBtn.title = 'Show API Key';
      }
    });
    
    // Test API key functionality with loading state
    testKeyBtn.addEventListener('click', () => {
      const apiKeyVal = apiKeyInput.value.trim();
      
      if (!apiKeyVal) {
        setStatus("Please enter an API key to test", true);
        return;
      }
      
      // Show loading state
      setStatus("Testing API key...");
      testKeyBtn.disabled = true;
      testKeyBtn.classList.add('loading');
      
      // Make a lightweight test call to the OpenAI API
      fetch("https://api.openai.com/v1/models", {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${apiKeyVal}`,
        }
      })
      .then(response => {
        testKeyBtn.disabled = false;
        testKeyBtn.classList.remove('loading');
        
        if (response.ok) {
          setStatus("API key is valid! ✅");
        } else {
          response.json().then(data => {
            setStatus(`API key test failed: ${data.error?.message || "Unknown error"}`, true);
          }).catch(error => {
            setStatus("API key appears to be invalid", true);
          });
        }
      })
      .catch(error => {
        testKeyBtn.disabled = false;
        testKeyBtn.classList.remove('loading');
        setStatus(`Error testing API key: ${error.message}`, true);
      });
    });
    
    // Load saved settings from both storage types
    loadSettings();
    
    function loadSettings() {
      // First try sync storage
      chrome.storage.sync.get(
        ['openai_api_key', 'model', 'systemPrompt'], 
        (syncResult) => {
          console.log("Loaded sync settings:", { 
            hasApiKey: !!syncResult.openai_api_key,
            model: syncResult.model,
            hasSystemPrompt: !!syncResult.systemPrompt 
          });
          
          // If API key not in sync, check local storage
          if (!syncResult.openai_api_key) {
            chrome.storage.local.get(['openai_api_key'], (localResult) => {
              console.log("Loaded local settings:", { 
                hasApiKey: !!localResult.openai_api_key
              });
              
              // Use local API key if available
              if (localResult.openai_api_key) {
                apiKeyInput.value = localResult.openai_api_key;
                // Move it to sync storage
                chrome.storage.sync.set({openai_api_key: localResult.openai_api_key}, () => {
                  console.log("Moved API key from local to sync storage");
                });
              }
            });
          } else {
            apiKeyInput.value = syncResult.openai_api_key || '';
          }
          
          // Set other fields from sync storage
          if (!syncResult.model) {
            modelSelect.value = 'gpt-4o-mini'; // Default model
          } else {
            modelSelect.value = syncResult.model;
          }
          systemPromptInput.value = syncResult.systemPrompt || `
          Write a response as a person replying to a message based on the context provided in the screenshot. 

            Craft a reply:
          - Be written in second person, addressing the recipient directly.
          - Be concise and professional (ideally 2-3 sentences).
          - Respond naturally and in character, as if you were the sender of the reply.
          - Acknowledge or answer the key points in the screenshot message.
          - Avoid explaining what the message says instead, reply as if you are the one communicating and responding.
          - Maintain a professional and courteous tone suitable for business communication.
          - Only use information visible in the screenshot—do not assume missing context.
          - You must write a direct response to the message in the screenshot, not a summary or analysis.
          - Do not use — symbols in your response.`}
      );
    }
    
    // Add loading animation class to the save button
    saveBtn.addEventListener('click', () => {
      saveSettings();
    });
    
    function saveSettings() {
      const apiKeyVal = apiKeyInput.value.trim();
      const modelVal = modelSelect.value;
      const systemPromptVal = systemPromptInput.value.trim();
      
      console.log("Saving settings:", { 
        hasApiKey: !!apiKeyVal, 
        apiKeyLength: apiKeyVal.length,
        model: modelVal,
        hasSystemPrompt: !!systemPromptVal 
      });
      
      if (apiKeyVal === "") {
        setStatus("Please enter a valid API key", true);
        return;
      }
      
      // Validate API key format - be more permissive with different API key formats
      // Some API keys don't follow the sk- format, especially for proxy services
      if (apiKeyVal.length < 10) {
        setStatus("API key seems too short. OpenAI keys are typically 51+ characters", true);
        return;
      }
      
      if (systemPromptVal === "") {
        systemPromptInput.value = `Generate a concise, professional reply based on the provided screenshot. Your response should directly address the key points in the message, remaining brief, clear, and polite.`;
      }
      
      // Show loading state
      saveBtn.disabled = true;
      saveBtn.classList.add('loading');
      saveBtn.textContent = 'Saving...';
      
      // Clear any potentially corrupted previous keys
      chrome.storage.sync.remove(['openai_api_key'], () => {
        chrome.storage.local.remove(['openai_api_key'], () => {
          // Add a slight delay to ensure removal completes
          setTimeout(() => {
            const settings = { 
              openai_api_key: apiKeyVal,
              model: modelVal,
              systemPrompt: systemPromptInput.value 
            };
            
            // First try sync storage
            chrome.storage.sync.set(settings, () => {
              // Remove loading state
              saveBtn.disabled = false;
              saveBtn.classList.remove('loading');
              saveBtn.textContent = 'Save Settings 🔑';
              
              if (chrome.runtime.lastError) {
                console.error("Error saving to sync storage:", chrome.runtime.lastError);
                
                // Fallback to local storage if sync fails
                chrome.storage.local.set({openai_api_key: apiKeyVal}, () => {
                  setStatus("API key saved to local storage (sync failed)");
                  
                  // Verify the setting was saved
                  chrome.storage.local.get(['openai_api_key'], (result) => {
                    console.log("Local verification - API key saved:", !!result.openai_api_key);
                    if (result.openai_api_key) {
                      console.log("Saved key begins with:", result.openai_api_key.substring(0, 5) + "...");
                      console.log("Saved key length:", result.openai_api_key.length);
                    }
                  });
                });
              } else {
                setStatus("Settings saved successfully!");
                
                // Verify the settings were saved
                chrome.storage.sync.get(['openai_api_key'], (result) => {
                  console.log("Verification - API key saved:", !!result.openai_api_key);
                  if (result.openai_api_key) {
                    console.log("Saved key begins with:", result.openai_api_key.substring(0, 5) + "...");
                    console.log("Saved key length:", result.openai_api_key.length);
                  }
                });
              }
            });
          }, 100);
        });
      });
    }
  });
  