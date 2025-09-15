chrome.action.onClicked.addListener(async () => {
  chrome.scripting.executeScript({
    target: { tabId: (await GetCurrentTab()).id },
    files: [ "script.js" ]
  });
});

async function GetCurrentTab() {
    const [tab] = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
    if(!tab)
      console.error("Couldn't get active tab");
    return tab;
  }