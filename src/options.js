document.addEventListener("DOMContentLoaded", () => {
    // Get DOM elements
    const openaiRadio = document.getElementById('openai-provider');
    const geminiRadio = document.getElementById('gemini-provider');
    const apiKeyInput = document.getElementById('apiKey');
    const geminiKeyInput = document.getElementById('geminiKey');
    const modelSelect = document.getElementById('model');
    const systemPromptInput = document.getElementById('systemPrompt');
    const temperatureSlider = document.getElementById('temperature');
    const temperatureValue = document.querySelector('.temperature-value');
    const saveBtn = document.getElementById('save');
    const showKeyBtn = document.getElementById('showKey');
    const showGeminiKeyBtn = document.getElementById('showGeminiKey');
    const testKeyBtn = document.getElementById('testKey');
    const testGeminiKeyBtn = document.getElementById('testGeminiKey');
    const status = document.getElementById('status');
    const openaiSettings = document.getElementById('openai-settings');
    const geminiSettings = document.getElementById('gemini-settings');
    const toggleTutorialBtn = document.getElementById('toggleTutorial');
    const toggleTosBtn = document.getElementById('toggleTos');
    const tutorialContent = document.getElementById('tutorial');
    const tosContent = document.getElementById('tos');
    
    console.log("Options page loaded");
    
    // Listen for keyboard shortcut messages from background script
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      if (request.action === "triggerShortcut") {
        console.log("Shortcut detected in options page");
        // Handle the shortcut action here
        // This would execute when on the options page
      }
    });
    
    // Animate cards with a staggered effect
    function animateCards() {
      const cards = document.querySelectorAll('.card');
      cards.forEach((card, index) => {
        setTimeout(() => {
          card.classList.add('animated');
        }, 100 * index);
      });
    }
    
    // Run animations after page loads
    setTimeout(animateCards, 100);
    
    // Setup radio button event listeners for provider selection
    openaiRadio.addEventListener('change', () => {
      if (openaiRadio.checked) {
        document.getElementById('openai-settings').style.display = 'block';
        document.getElementById('gemini-settings').style.display = 'none';
      }
    });
    
    geminiRadio.addEventListener('change', () => {
      if (geminiRadio.checked) {
        document.getElementById('openai-settings').style.display = 'none';
        document.getElementById('gemini-settings').style.display = 'block';
      }
    });
    
    // Update temperature value display
    temperatureSlider.addEventListener('input', () => {
      const value = parseFloat(temperatureSlider.value) / 10;
      temperatureValue.textContent = value.toFixed(1);
    });
    
    // Smooth scroll to sections when they're expanded
    function scrollToElement(element, duration = 300) {
      const rect = element.getBoundingClientRect();
      const isInView = (rect.top >= 0) && (rect.bottom <= window.innerHeight);
      
      if (!isInView) {
        element.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }
    
    // Function to set status message with animation
    function setStatus(message, isError = false, elementId = 'status') {
      const statusElement = document.getElementById(elementId);
      if (!statusElement) return;
      
      // Clear previous status animation
      statusElement.style.opacity = '0';
      
      setTimeout(() => {
        statusElement.textContent = message;
        statusElement.style.color = isError ? "#f43f5e" : "#10b981";
        statusElement.style.opacity = '1';
        
        if (!isError) {
          setTimeout(() => { 
            statusElement.style.opacity = '0';
            setTimeout(() => { statusElement.textContent = ''; }, 300);
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
    
    // Toggle API key visibility for OpenAI
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
    
    // Toggle API key visibility for Gemini
    showGeminiKeyBtn.addEventListener('click', () => {
      if (geminiKeyInput.type === 'password') {
        geminiKeyInput.type = 'text';
        showGeminiKeyBtn.textContent = '🔒';
        showGeminiKeyBtn.title = 'Hide API Key';
        // Auto-hide after 5 seconds
        setTimeout(() => {
          geminiKeyInput.type = 'password';
          showGeminiKeyBtn.textContent = '👁️';
          showGeminiKeyBtn.title = 'Show API Key';
        }, 5000);
      } else {
        geminiKeyInput.type = 'password';
        showGeminiKeyBtn.textContent = '👁️';
        showGeminiKeyBtn.title = 'Show API Key';
      }
    });
    
    // Test OpenAI API key
    testKeyBtn.addEventListener('click', () => {
      const apiKeyVal = apiKeyInput.value.trim();
      
      if (!apiKeyVal) {
        setStatus("API key not configured", true, 'openai-test-status');
        return;
      }
      
      // Show loading state
      setStatus("Testing OpenAI API key...", false, 'openai-test-status');
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
          setStatus("OpenAI API key is valid! ✅", false, 'openai-test-status');
        } else {
          response.json().then(data => {
            setStatus(`API key not configured`, true, 'openai-test-status');
          }).catch(error => {
            setStatus("API key not configured", true, 'openai-test-status');
          });
        }
      })
      .catch(error => {
        testKeyBtn.disabled = false;
        testKeyBtn.classList.remove('loading');
        setStatus(`API key not configured`, true, 'openai-test-status');
      });
    });
    
    // Test Gemini API key
    testGeminiKeyBtn.addEventListener('click', () => {
      const apiKeyVal = geminiKeyInput.value.trim();
      
      if (!apiKeyVal) {
        setStatus("API key not configured", true, 'gemini-test-status');
        return;
      }
      
      // Show loading state
      setStatus("Testing Gemini API key...", false, 'gemini-test-status');
      testGeminiKeyBtn.disabled = true;
      testGeminiKeyBtn.classList.add('loading');
      
      // Make a lightweight test call to the Gemini API
      const endpoint = `https://generativelanguage.googleapis.com/v1/models?key=${apiKeyVal}`;
      
      fetch(endpoint)
      .then(response => {
        testGeminiKeyBtn.disabled = false;
        testGeminiKeyBtn.classList.remove('loading');
        
        if (response.ok) {
          setStatus("Gemini API key is valid! ✅", false, 'gemini-test-status');
        } else {
          response.json().then(data => {
            setStatus(`API key not configured`, true, 'gemini-test-status');
          }).catch(error => {
            setStatus("API key not configured", true, 'gemini-test-status');
          });
        }
      })
      .catch(error => {
        testGeminiKeyBtn.disabled = false;
        testGeminiKeyBtn.classList.remove('loading');
        setStatus(`API key not configured`, true, 'gemini-test-status');
      });
    });
    
    // Load saved settings
    function loadSettings() {
      // First try sync storage
      chrome.storage.sync.get(
        ['provider', 'openai_api_key', 'gemini_api_key', 'model', 'systemPrompt', 'temperature'], 
        (syncResult) => {
          console.log("Loaded sync settings:", { 
            provider: syncResult.provider || 'openai',
            hasOpenAIKey: !!syncResult.openai_api_key,
            hasGeminiKey: !!syncResult.gemini_api_key,
            model: syncResult.model,
            hasSystemPrompt: !!syncResult.systemPrompt,
            temperature: syncResult.temperature || 0.7
          });
          
          // Set provider radio button
          const provider = syncResult.provider || 'openai';
          if (provider === 'openai') {
            openaiRadio.checked = true;
            document.getElementById('openai-settings').style.display = 'block';
            document.getElementById('gemini-settings').style.display = 'none';
          } else {
            geminiRadio.checked = true;
            document.getElementById('openai-settings').style.display = 'none';
            document.getElementById('gemini-settings').style.display = 'block';
          }
          
          // If API keys not in sync, check local storage
          if (!syncResult.openai_api_key || !syncResult.gemini_api_key) {
            chrome.storage.local.get(['openai_api_key', 'gemini_api_key'], (localResult) => {
              console.log("Loaded local settings:", { 
                hasOpenAIKey: !!localResult.openai_api_key,
                hasGeminiKey: !!localResult.gemini_api_key
              });
              
              // Use local API keys if available
              if (localResult.openai_api_key && !syncResult.openai_api_key) {
                apiKeyInput.value = localResult.openai_api_key;
                // Move it to sync storage
                chrome.storage.sync.set({openai_api_key: localResult.openai_api_key}, () => {
                  console.log("Moved OpenAI API key from local to sync storage");
                });
              }
              
              if (localResult.gemini_api_key && !syncResult.gemini_api_key) {
                geminiKeyInput.value = localResult.gemini_api_key;
                // Move it to sync storage
                chrome.storage.sync.set({gemini_api_key: localResult.gemini_api_key}, () => {
                  console.log("Moved Gemini API key from local to sync storage");
                });
              }
            });
          } else {
            apiKeyInput.value = syncResult.openai_api_key || '';
            geminiKeyInput.value = syncResult.gemini_api_key || '';
          }
          
          // Set other fields from sync storage
          if (!syncResult.model) {
            modelSelect.value = 'gpt-4o-mini'; // Default model
          } else {
            modelSelect.value = syncResult.model;
          }
          
          // Set temperature
          const temp = syncResult.temperature || 0.7;
          temperatureSlider.value = temp * 10;
          temperatureValue.textContent = temp.toFixed(1);
          
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
    
    // Initial load of settings
    loadSettings();
    
    // Save button handler
    saveBtn.addEventListener('click', () => {
      saveSettings();
    });
    
    function saveSettings() {
      const provider = openaiRadio.checked ? 'openai' : 'gemini';
      const openaiApiKey = apiKeyInput.value.trim();
      const geminiApiKey = geminiKeyInput.value.trim();
      const modelVal = modelSelect.value;
      const systemPromptVal = systemPromptInput.value.trim();
      const temperatureVal = parseFloat(temperatureSlider.value) / 10;
      
      console.log("Saving settings:", { 
        provider: provider,
        hasOpenaiKey: !!openaiApiKey, 
        hasGeminiKey: !!geminiApiKey,
        model: modelVal,
        hasSystemPrompt: !!systemPromptVal,
        temperature: temperatureVal
      });
      
      // Validate based on selected provider
      if (provider === 'openai' && !openaiApiKey) {
        setStatus("API key not configured", true);
        return;
      } else if (provider === 'gemini' && !geminiApiKey) {
        setStatus("API key not configured", true);
        return;
      }
      
      // Validate API key format
      if (provider === 'openai' && openaiApiKey.length < 10) {
        setStatus("API key not configured", true);
        return;
      }
      if (provider === 'gemini' && geminiApiKey.length < 10) {
        setStatus("API key not configured", true);
        return;
      }
      
      // Set default system prompt if empty
      if (systemPromptVal === "") {
        systemPromptInput.value = `Generate a concise, professional reply based on the provided screenshot. Your response should directly address the key points in the message, remaining brief, clear, and polite.`;
      }
      
      // Show loading state
      saveBtn.disabled = true;
      saveBtn.classList.add('loading');
      saveBtn.textContent = 'Saving...';
      
      // Clear any potentially corrupted previous keys
      chrome.storage.sync.remove(['openai_api_key', 'gemini_api_key'], () => {
        chrome.storage.local.remove(['openai_api_key', 'gemini_api_key'], () => {
          // Add a slight delay to ensure removal completes
          setTimeout(() => {
            const settings = { 
              provider: provider,
              openai_api_key: openaiApiKey,
              gemini_api_key: geminiApiKey,
              model: modelVal,
              systemPrompt: systemPromptInput.value,
              temperature: temperatureVal
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
                const localSettings = {};
                if (provider === 'openai') {
                  localSettings.openai_api_key = openaiApiKey;
                } else {
                  localSettings.gemini_api_key = geminiApiKey;
                }
                
                chrome.storage.local.set(localSettings, () => {
                  setStatus("API key saved to local storage (sync failed)");
                  
                  // Verify the setting was saved
                  chrome.storage.local.get(['openai_api_key', 'gemini_api_key'], (result) => {
                    console.log("Local verification - keys saved:", { 
                      openai: !!result.openai_api_key,
                      gemini: !!result.gemini_api_key 
                    });
                  });
                });
              } else {
                setStatus("Settings saved successfully!");
                
                // Verify the settings were saved
                chrome.storage.sync.get(['openai_api_key', 'gemini_api_key'], (result) => {
                  console.log("Verification - keys saved:", { 
                    openai: !!result.openai_api_key,
                    gemini: !!result.gemini_api_key 
                  });
                });
              }
            });
          }, 100);
        });
      });
    }
  });
