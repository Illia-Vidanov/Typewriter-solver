import { GetStorageChache } from "../scripts/common.js";

async function InjectionScript(storage_cache) {
  console.log("Injecting script");

  let enabled = true;
  chrome.runtime.onMessage.addListener(message => {
    enabled = message.enabled;
  });

  // Functions (must define them hiere because I can't import files in Injected file and this function is called from another context)
  const sleep = (ms) => { return new Promise(r => setTimeout(r, ms)); };
  
  const all_elements_with_style = document.querySelectorAll("*[style]");
  function GetElementWithStyleAttribute(style_attribute) {
    for(const element of all_elements_with_style) {
      if(element.getAttribute("style") == style_attribute)
        return element;
    }

    return undefined;
  }

  function GetElementWithShuffledStyleAttributes(style_attributes, begin = "") {
    if(style_attributes.length == 1)
      return GetElementWithStyleAttribute((begin + style_attributes[0]).trim());
    
    for(const attribute of style_attributes) {
      let element = GetElementWithShuffledStyleAttributes(style_attributes.toSpliced(style_attributes.indexOf(attribute), 1), begin + attribute);
      if(element)
        return element;
    }
  }

  let worker_port = chrome.runtime.connect();
  function PrintLetter(symbol) {
    worker_port.postMessage(symbol.replaceAll("\u00a0", " ")); // no break space is simple space
  }

  function Lerp(a, b, t) {
    return a + t * (b - a);
  }

  function Clamp(value, min, max) {
    if(value > max)
      return max;
    else if(value < min)
      return min;
    return value;
  }

  // Can't use id because they are unique every time
  // Need to try different variants because it's randomized
  let style_attributes = ["background: rgba(84,84,84,0.2); ", "float: left; ", "position: relative; "];
  let next_letter_element = GetElementWithShuffledStyleAttributes(style_attributes);
  if(!next_letter_element)
    console.log("couldn't find next_letter_element using style " + style_attributes.join('') + " and other variations");
  
  console.log("Next letter id: " + next_letter_element.id);

  // Approximate error percentage to do in one lecture (0-1)
  let ERROR_PERCENTAGE;
  let MIN_TYPE_DELAY_MS;
  let MAX_TYPE_DELAY_MS;
  ERROR_PERCENTAGE = Clamp(parseFloat(storage_cache.error_percentage), 0, 1);
  if(storage_cache.min_type_delay_ms > storage_cache.max_type_delay_ms) {
    // Swap variables if they min is larger than max
    MIN_TYPE_DELAY_MS = parseInt(storage_cache.max_type_delay_ms);
    MAX_TYPE_DELAY_MS = parseInt(storage_cache.min_type_delay_ms);
  }
  else {
    MIN_TYPE_DELAY_MS = parseInt(storage_cache.min_type_delay_ms);
    MAX_TYPE_DELAY_MS = parseInt(storage_cache.max_type_delay_ms);
  }

  console.log("Loaded options:", "\nERROR_PERCENTAGE = ", ERROR_PERCENTAGE, "\nMIN_TYPE_DELAY_MS = ", MIN_TYPE_DELAY_MS, "\nMAX_TYPE_DELAY_MS = ", MAX_TYPE_DELAY_MS);

  // Need to print first letter to get total char count
  PrintLetter(next_letter_element.textContent);
  // There is a phantom error on that second printletter I can't solve
  // It sees right letter types the right one but it's still counted as a mistake
  //await sleep(1000);
  //next_letter_element = document.getElementById(next_letter_element.id);
  //await sleep(1000);
  // Or it twice if there were preparation window open
  console.log(next_letter_element.textContent);
  PrintLetter(next_letter_element.textContent);

  // This isn't shuffeled
  const letters_left_element = GetElementWithStyleAttribute("z-index: 999; position: relative; float: left; margin-left: 2px; top: -2px; font-weight: bold;");
  if(!letters_left_element)
  {
    console.error("Couldn't get char count left. Probobly can't type now. Stopping");
    return;
  }
  
  let error_count = Math.floor(parseFloat(letters_left_element.textContent) * ERROR_PERCENTAGE);
  console.log("Desired error count: " + error_count.toString());

  // Main loop
  function MainLoop() {
    // Here is no check for if typing is paused, but it shouldn't be big of an issue

    if(Math.random() < (error_count / parseFloat(letters_left_element.textContent))) {
      error_count--;
      // Way to type always wrong letter
      if(next_letter_element.textContent == "a")
        PrintLetter("a");
      else
        PrintLetter("b");
    }
    else
      PrintLetter(next_letter_element.textContent);

    if(enabled)
      setTimeout(MainLoop, Lerp(MIN_TYPE_DELAY_MS, MAX_TYPE_DELAY_MS, Math.random()));
    else
    {
      worker_port.disconnect();
      console.log("Stopping execution");
    }
  }
  setTimeout(MainLoop);
} // Injected script

let is_running = false;
let tab_id;

const sleep = (ms) => { return new Promise(r => setTimeout(r, ms)); };

async function GetCurrentTab() {
  const [tab] = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
  if(!tab)
    console.error("Couldn't get active tab");
  return tab;
}

chrome.runtime.onConnect.addListener((port) => {
  console.log("Content script and service worker connected");
  port.onMessage.addListener(OnMessage);
  port.onDisconnect.addListener((port) => {
    console.log("Content script and service worker disconnected");
    port.onMessage.removeListener(OnMessage);
    DisableTyping();
  });
});

// We need only one host in order to function properly
let host_port = chrome.runtime.connectNative("com.tolik708.typewriter_solver");
host_port.onMessage.addListener(function (msg) {
  console.log("Message from host: " + JSON.stringify(msg));
});
host_port.onDisconnect.addListener(() => {
  console.log("Native host disconnected");
});

// Set default bage as disabled
chrome.action.setBadgeText({text: " "});
chrome.action.setBadgeBackgroundColor({color:[255, 0, 0, 255]});

function DisableTyping() {
  chrome.action.setBadgeBackgroundColor({color:[255, 0, 0, 255]});
  // If active tab changed because typewriter tab was changed for example after finishing level we don't want an error
  try { chrome.tabs.sendMessage(tab_id, { enabled: false }); } catch {}
  host_port.postMessage({status: "disable"});
  is_running = false;
}

function EnableTyping() {
  chrome.action.setBadgeBackgroundColor({color:[0, 255, 0, 255]});
  host_port.postMessage({status: "enable"});
  chrome.tabs.sendMessage(tab_id, { enabled: true });
  is_running = true;
}

// If active tab changed change layout to normal
chrome.tabs.onActivated.addListener((active_info) => {
  if(tab_id)
    DisableTyping();
  tab_id = undefined;
});

chrome.tabs.onUpdated.addListener(async (changed_tab_id, change_info, tab) => {
  if(changed_tab_id == tab_id && change_info.url && change_info.url.includes("levelCompleteInfo"))
  {
    console.log("Finished lection moving to the next one");
    await chrome.tabs.update(tab_id, {url: "https://at4.typewriter.at/index.php?r=typewriter/runLevel"});
    await sleep(2000);
    EnableTyping();
    InjectScript();
  }
});

// Messages from content script treated as key emulations
function OnMessage(message) {
  //console.log("Emulating ", message);
  host_port.postMessage({symbol: message});
}

chrome.action.onClicked.addListener(async () => {
  console.log("service worker onClicked");
  
  let tab = await GetCurrentTab();
  if(!tab.url.includes("typewriter"))
  {
    console.error("This isn't typewriter");
    return;
  }

  tab_id = tab.id;
  // Stop running content script
  if(is_running)
  {
    DisableTyping();
    return;
  }
  
  EnableTyping();
  InjectScript();
});

async function InjectScript() {
  chrome.scripting.executeScript({
    target: { tabId: tab_id },
    func: InjectionScript,
    args: [ (await GetStorageChache()) ]
  });
}