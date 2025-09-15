function SaveOptions()
{
  chrome.storage.sync.set({
    error_percentage: document.getElementById("error_percentage").value,
    min_type_delay_ms: document.getElementById("min_type_delay_ms").value,
    max_type_delay_ms: document.getElementById("max_type_delay_ms").value
  });
}

function LoadOptions()
{
  chrome.storage.sync.get({
    error_percentage: 0.005, // 0.5%
    min_type_delay_ms: 50,
    max_type_delay_ms: 80
  }, (storage_cache) => {
    document.getElementById("min_type_delay_ms").value = storage_cache.min_type_delay_ms;
    document.getElementById("max_type_delay_ms").value = storage_cache.max_type_delay_ms;
    document.getElementById("error_percentage").value = storage_cache.error_percentage;
  });
}

function main()
{
  console.log(document);
  document.getElementById("min_type_delay_ms").addEventListener("change", SaveOptions);
  document.getElementById("max_type_delay_ms").addEventListener("change", SaveOptions);
  document.getElementById("error_percentage").addEventListener("change", SaveOptions);
  LoadOptions();
}

addEventListener("DOMContentLoaded", main);