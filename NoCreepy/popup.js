document.addEventListener('DOMContentLoaded', () => {
  // Get our HTML elements
  const toggleMessages = document.getElementById('toggleMessages');
  const newWordInput = document.getElementById('newWord');
  const addWordBtn = document.getElementById('addWordBtn');

  // --- 1. Load Initial State ---
  // When you click the extension icon, fetch current settings to update the UI
  chrome.storage.local.get(["filterMessages"], (data) => {
    // If it hasn't been set yet, default to true
    toggleMessages.checked = data.filterMessages !== false; 
  });

  // --- 2. Handle Checkbox Toggle ---
  // Whenever you check/uncheck the box, save it to storage instantly
  toggleMessages.addEventListener('change', (e) => {
    chrome.storage.local.set({ filterMessages: e.target.checked }, () => {
      console.log("Message filtering set to: " + e.target.checked);
    });
  });

  // --- 3. Handle Adding a New Word ---
  addWordBtn.addEventListener('click', () => {
    // Get the text from the input box, remove extra spaces, make lowercase
    const wordToAdd = newWordInput.value.trim().toLowerCase(); 

    if (wordToAdd) {
      // Fetch the current list of bad words
        chrome.storage.local.get(["manualWords"], (data) => {
        let words = data.manualWords || [];
        
        // Only add it if it's not already in the list
        if (!words.includes(wordToAdd)) {
          words.push(wordToAdd);
          
          // Save the new list back to storage
          chrome.storage.local.set({ badWords: words }, () => {
            newWordInput.value = ''; // Clear the input box
            
            // Change button text temporarily to show success
            const originalText = addWordBtn.innerText;
            addWordBtn.innerText = "Added!";
            setTimeout(() => { addWordBtn.innerText = originalText; }, 1500);
          });
        } else {
          alert("That word is already blocked!");
        }
      });
    }
  });

document.getElementById('openSettingsBtn').addEventListener('click', () => {
    chrome.runtime.openOptionsPage();
  });

  // Allow pressing "Enter" in the text box to trigger the button click
  newWordInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      addWordBtn.click();
    }
  });
});