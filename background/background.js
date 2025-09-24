import { GetStorageChache } from "../scripts/common.js";

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
  function GetElementWithStyleAttribute(style_attribute) {
    const all_elements_with_style = document.querySelectorAll("*[style]");
    for(const element of all_elements_with_style) {
      if(element.getAttribute("style") == style_attribute)
        return element;
    }
    console.log("Couldn't find element with style: " + style_attribute);
    return undefined;
  }

  function PrintLetter(key) {
    document.getElementById("input_area").dispatchEvent(new KeyboardEvent('keypress', {
      key: key
    }));
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
  let next_letter_element = GetElementWithStyleAttribute("position: relative; float: left; background: rgba(84,84,84,0.2);");
  if(!next_letter_element)
    return;
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
  PrintLetter(next_letter_element.innerHTML);
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

chrome.action.onClicked.addListener(async () => {
  let tab_id = (await GetCurrentTab()).id;
  chrome.tabs.sendMessage(tab_id, { stop: true });
  chrome.scripting.executeScript({
    target: { tabId: tab_id },
    func: InjectionScript,
    args: [ (await GetStorageChache()) ]
  });
});