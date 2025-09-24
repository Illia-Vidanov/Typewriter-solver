import { GetStorageChache, AddEvent } from "../scripts/common.js"

function SaveOptions() {
  console.log("Saving " + document.getElementById("error_percentage").value);
  chrome.storage.sync.set({
    error_percentage: document.getElementById("error_percentage").value,
    min_type_delay_ms: document.getElementById("min_type_delay_ms").value,
    max_type_delay_ms: document.getElementById("max_type_delay_ms").value
  });
}

async function LoadOptions() {
  const storage_cache = await GetStorageChache();
  document.getElementById("min_type_delay_ms").value = storage_cache.min_type_delay_ms;
  document.getElementById("max_type_delay_ms").value = storage_cache.max_type_delay_ms;
  document.getElementById("error_percentage").value = storage_cache.error_percentage;
}

async function main() {
  AddEvent(document.getElementById("min_type_delay_ms"), "change", SaveOptions);
  AddEvent(document.getElementById("max_type_delay_ms"), "change", SaveOptions);
  AddEvent(document.getElementById("error_percentage"), "change", SaveOptions);
  await LoadOptions();
}

AddEvent(document, "DOMContentLoaded", main);