async function GetStorageChache()
{
  const DEFAULT_STORAGE_CACHE = {
    error_percentage: 0.005, // 0.5%
    min_type_delay_ms: 50,
    max_type_delay_ms: 80
  };
  const storage_cache = await chrome.storage.sync.get(DEFAULT_STORAGE_CACHE);
  if(!storage_cache) {
    console.error("Couldn't load settings. Defaults are used");
    return DEFAULT_STORAGE_CACHE;
  }
  return storage_cache;
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

function AddEvent(obj, event, callback) {
  if (obj.attachEvent)
   return obj.attachEvent('on'+ event, callback);
  else
   return obj.addEventListener(event, callback, false);
}

export { GetStorageChache, AddEvent, Lerp, Clamp }