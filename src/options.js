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
    
    // Update Gemini icon with the new SVG
    const geminiLabel = document.querySelector('label[for="gemini-provider"]');
    if (geminiLabel) {
        // Remove existing icon if present (could be an image, SVG, or text)
        while (geminiLabel.firstChild) {
            geminiLabel.removeChild(geminiLabel.firstChild);
        }
        
        // Create and add the new SVG
        const svgElement = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        svgElement.setAttribute("fill", "none");
        svgElement.setAttribute("xmlns", "http://www.w3.org/2000/svg");
        svgElement.setAttribute("viewBox", "0 0 16 16");
        svgElement.setAttribute("width", "16");
        svgElement.setAttribute("height", "16");
        svgElement.style.marginRight = "8px";
        
        const pathElement = document.createElementNS("http://www.w3.org/2000/svg", "path");
        pathElement.setAttribute("d", "M16 8.016A8.522 8.522 0 008.016 16h-.032A8.521 8.521 0 000 8.016v-.032A8.521 8.521 0 007.984 0h.032A8.522 8.522 0 0016 7.984v.032z");
        pathElement.setAttribute("fill", "url(#prefix__paint0_radial_980_20147)");
        
        const defsElement = document.createElementNS("http://www.w3.org/2000/svg", "defs");
        const radialGradient = document.createElementNS("http://www.w3.org/2000/svg", "radialGradient");
        radialGradient.setAttribute("id", "prefix__paint0_radial_980_20147");
        radialGradient.setAttribute("cx", "0");
        radialGradient.setAttribute("cy", "0");
        radialGradient.setAttribute("r", "1");
        radialGradient.setAttribute("gradientUnits", "userSpaceOnUse");
        radialGradient.setAttribute("gradientTransform", "matrix(16.1326 5.4553 -43.70045 129.2322 1.588 6.503)");
        
        const stop1 = document.createElementNS("http://www.w3.org/2000/svg", "stop");
        stop1.setAttribute("offset", ".067");
        stop1.setAttribute("stop-color", "#9168C0");
        
        const stop2 = document.createElementNS("http://www.w3.org/2000/svg", "stop");
        stop2.setAttribute("offset", ".343");
        stop2.setAttribute("stop-color", "#5684D1");
        
        const stop3 = document.createElementNS("http://www.w3.org/2000/svg", "stop");
        stop3.setAttribute("offset", ".672");
        stop3.setAttribute("stop-color", "#1BA1E3");
        
        radialGradient.appendChild(stop1);
        radialGradient.appendChild(stop2);
        radialGradient.appendChild(stop3);
        defsElement.appendChild(radialGradient);
        
        svgElement.appendChild(pathElement);
        svgElement.appendChild(defsElement);
        
        geminiLabel.appendChild(svgElement);
        geminiLabel.appendChild(document.createTextNode(" Google Gemini"));
    }
    
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
    
    // Add status message elements for API key testing
    function addStatusElement(containerId, statusId) {
      const container = document.querySelector(`#${containerId} .api-key-container`);
      if (container && !document.getElementById(statusId)) {
        const statusElement = document.createElement('p');
        statusElement.id = statusId;
        statusElement.className = 'api-status';
        statusElement.style.fontSize = '0.85rem';
        statusElement.style.marginTop = '0.5rem';
        statusElement.style.opacity = '0';
        statusElement.style.transition = 'opacity 0.3s ease';
        container.insertAdjacentElement('afterend', statusElement);
      }
    }
    
    // Add status elements for API key testing
    addStatusElement('openai-settings', 'openai-test-status');
    addStatusElement('gemini-settings', 'gemini-test-status');
    
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
    
    // Toggle tutorial visibility (fixed implementation)
    toggleTutorialBtn.addEventListener('click', () => {
      // First, hide the other section if it's open
      if (!tosContent.classList.contains('hidden')) {
        tosContent.classList.add('hidden');
        toggleTosBtn.textContent = 'Show Terms';
      }
      
      // Then toggle this section
      const isHidden = tutorialContent.classList.contains('hidden');
      
      if (isHidden) {
        tutorialContent.classList.remove('hidden');
        toggleTutorialBtn.textContent = 'Hide Tutorial';
        // Scroll to tutorial after it's shown
        setTimeout(() => scrollToElement(tutorialContent), 100);
      } else {
        tutorialContent.classList.add('hidden');
        toggleTutorialBtn.textContent = 'Show Tutorial';
      }
    });
    
    // Toggle ToS visibility (fixed implementation)
    toggleTosBtn.addEventListener('click', () => {
      // First, hide the other section if it's open
      if (!tutorialContent.classList.contains('hidden')) {
        tutorialContent.classList.add('hidden');
        toggleTutorialBtn.textContent = 'Show Tutorial';
      }
      
      // Then toggle this section
      const isHidden = tosContent.classList.contains('hidden');
      
      if (isHidden) {
        tosContent.classList.remove('hidden');
        toggleTosBtn.textContent = 'Hide Terms';
        // Scroll to ToS after it's shown
        setTimeout(() => scrollToElement(tosContent), 100);
      } else {
        tosContent.classList.add('hidden');
        toggleTosBtn.textContent = 'Show Terms';
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
            setStatus(`API key invalid or expired`, true, 'openai-test-status');
          }).catch(error => {
            setStatus("API key invalid or expired", true, 'openai-test-status');
          });
        }
      })
      .catch(error => {
        testKeyBtn.disabled = false;
        testKeyBtn.classList.remove('loading');
        setStatus(`API key invalid or expired`, true, 'openai-test-status');
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
            setStatus(`API key invalid or expired`, true, 'gemini-test-status');
          }).catch(error => {
            setStatus("API key invalid or expired", true, 'gemini-test-status');
          });
        }
      })
      .catch(error => {
        testGeminiKeyBtn.disabled = false;
        testGeminiKeyBtn.classList.remove('loading');
        setStatus(`API key invalid or expired`, true, 'gemini-test-status');
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
          
          systemPromptInput.value = syncResult.systemPrompt || `You are an AI agent designed to compose social media replies for me, (User).

Your Task: Based only on the content visible in the provided screenshot of a social media message, write the direct reply message I (User) should send.

Instructions for Crafting the Reply:

1.  Act as User: Write the response naturally and in character, as if you are User composing the message.

2.  Direct Address: Use the second person ("you") to address the sender of the message in the screenshot directly.

3.  Personalization: If the sender's name is visible in the screenshot, use it to personalize the greeting (e.g., "Hi [Name],"). Ensure this name is the one associated with the main text block identified in step 9.

4.  Acknowledge and Respond: Directly address the key point(s), question(s), or sentiment(s) expressed only in the main text block identified in step 9.

5.  Conciseness: Keep the reply brief and to the point, ideally 2-3 sentences.

6.  Tone: Maintain a professional, courteous, positive, and empathetic tone suitable for business communication. Adapt the tone slightly based on the main text block's content: For positive feedback, express genuine appreciation and be specific if possible (e.g., "Thanks so much for your kind words about [specific aspect]!"). For negative feedback, respond promptly (in tone), acknowledge their experience with empathy (e.g., "I'm sorry to hear you experienced this."), offer a sincere apology if appropriate without being defensive, and suggest taking the conversation offline if needed (e.g., "Could you please send us a direct message with your details so we can look into this for you?"). For neutral feedback/questions, acknowledge their comment or answer their question directly, provide helpful info if possible, or ask a clarifying question.

7.  Be Solution-Oriented: Where applicable, focus on being helpful and offering a clear next step or resolution path based on the main text block's content.

8.  Use Main Text Content Only: Base your reply strictly on the information fully visible within the single main text block identified in step 9. Do not invent details, assume missing context, or use outside knowledge.

9.  Focus on Largest Central Text Block & Sender:
    A. Locate Main Text: Identify the largest single block of conversational text located within the main central column or feed area of the screenshot. This is likely the primary message or post.
    B. Identify Associated Sender: Determine the sender's name or handle that is most directly and closely associated with that specific text block. Look for the name immediately preceding or clearly linked to that block.
    C. Base Reply: Formulate your reply based exclusively on the content of that identified text block and its associated sender.
    D. Ignore All Else: Explicitly disregard all other text elements in the screenshot. This includes: smaller text blocks above or below the main one (like other posts or comments), navigation menus (like 'Home', 'Explore', 'Notifications'), sidebars ('Who to follow', 'Explore' topics), headers, footers, separated timestamps or usernames not directly linked to the main text block, interaction buttons ('Like', 'Reply'), and any text cut off by the border. Your focus is only the single largest conversational block and its direct sender.

10. Output is the Reply: Your response should be the message User will send. Do not provide summaries, analyses, or explanations of the screenshot or your generated reply.

11. Formatting: Do not use "—" symbols in the response.`}
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
        setStatus("OpenAI API key required", true);
        return;
      } else if (provider === 'gemini' && !geminiApiKey) {
        setStatus("Gemini API key required", true);
        return;
      }
      
      // Validate API key format
      if (provider === 'openai' && openaiApiKey.length < 10) {
        setStatus("Invalid OpenAI API key format", true);
        return;
      }
      if (provider === 'gemini' && geminiApiKey.length < 10) {
        setStatus("Invalid Gemini API key format", true);
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
              saveBtn.textContent = 'Save Settings';
              
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
