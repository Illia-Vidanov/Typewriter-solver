import { GetStorageChache } from "../scripts/common.js";

var is_running = false;

async function GetCurrentTab() {
  const [tab] = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
  if(!tab)
    console.error("Couldn't get active tab");
  return tab;
}

async function InjectionScript(storage_cache) {
  console.log("Injecting script");

  let stop = false;
  chrome.runtime.onMessage.addListener(message => {
    stop = message.stop;
  });

  // Functions (must define them hiere because I can't import files in Injected file and this function is called from another context)
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
    worker_port.postMessage(symbol);
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
    console.log("couldn't find next_letter_element using style background: rgba(84,84,84,0.2); float: left; position: relative; and 5 other variations");
  
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
  console.log("Emulating ", decodeURIComponent(next_letter_element.textContent));
  PrintLetter(decodeURIComponent(next_letter_element.textContent));
  //await new Promise(r => setTimeout(r, 0));
  //PrintLetter(next_letter_element.innerHTML.charCodeAt(0));
  worker_port.disconnect();
  return;
  const letters_left_element = GetElementWithStyleAttribute("z-index: 999; position: relative; float: left; margin-left: 2px; top: -2px; font-weight: bold;");
  if(!letters_left_element) {
    console.warn("Couldn't get char count left. Probobly can't type now. Stop");
    return;
  }
  let error_count = Math.floor(parseFloat(letters_left_element.innerHTML) * ERROR_PERCENTAGE);
  console.log("Desired error count: " + error_count);

  // Main loop
  function MainLoop() {
    // Here is no check for if typing is paused, but it shouldn't be big of an issue
    if(Math.random() < ERROR_PERCENTAGE && error_count > 0) {
      error_count--;
      // Way to type always wrong letter
      if(next_letter_element.innerHTML == "a")
        PrintLetter("a");
      else
        PrintLetter("b");
    }
    else
      PrintLetter(next_letter_element.innerHTML);

    next_letter_element = document.getElementById(next_letter_element.id);
    if(next_letter_element && !stop)
      setTimeout(MainLoop, Lerp(MIN_TYPE_DELAY_MS, MAX_TYPE_DELAY_MS, Math.random()));
    else
      console.log("Stopping execution");
  }
  setTimeout(MainLoop);
}

// Treat every message as a key to press
function OnMessage(symbol) {
  console.log("Emulating ", symbol);
  host_port.postMessage({symbol: symbol});
}
chrome.runtime.onConnect.addListener((port) => {
  console.log("Content script and service worker connected");
  port.onMessage.addListener(OnMessage);
  port.onDisconnect.addListener((port) => {
    console.log("Content script and service worker disconnected");
    port.onMessage.removeListener(OnMessage);
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

chrome.action.onClicked.addListener(async () => {
  console.log("service worker onClicked")

  let tab_id = (await GetCurrentTab()).id;
  // Stop running content script
  if(is_running)
    chrome.tabs.sendMessage(tab_id, { stop: true });
  
  is_running = true;
  chrome.scripting.executeScript({
    target: { tabId: tab_id },
    func: InjectionScript,
    args: [ (await GetStorageChache()) ]
  });
});