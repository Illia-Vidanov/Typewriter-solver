function Lerp(a, b, t) {
  return a + t * (b - a);
}

function GetElementWithStyleAttribute(style_attribute)
{
  const all_elements_with_style = document.querySelectorAll("*[style]");
  for(const element of all_elements_with_style)
  {
    if(element.getAttribute("style") == style_attribute)
      return element;
  }
  console.warning("Couldn't find next letter element");
  return undefined;
}

function PrintLetter(key)
{
  document.getElementById("input_area").dispatchEvent(new KeyboardEvent('keypress', {
    key: key
  }));
}

function main()
{
  // Approximate error percentage to do in one lecture (0-1)
  const ERROR_PERCENTAGE = 0.005; // 0.5%
  const MIN_TYPE_DELAY_MS = 50;
  const MAX_TYPE_DELAY_MS = 80;

  // Can't use id because they are unique every time
  let next_letter_element = GetElementWithStyleAttribute("position: relative; float: left; background: rgba(84,84,84,0.2);");
  if(!next_letter_element)
    return;
  console.log("Next letter id: " + next_letter_element.id);

  // Need to print first letter to get total char count
  PrintLetter(next_letter_element.innerHTML);
  let error_count = Math.floor(parseFloat(GetElementWithStyleAttribute("z-index: 999; position: relative; float: left; margin-left: 2px; top: -2px; font-weight: bold;").innerHTML) * ERROR_PERCENTAGE);
  console.log("Desired error count: " + error_count);

  // Main loop
  const interval_id = setInterval(() =>
  {
    if(Math.random() < ERROR_PERCENTAGE && error_count > 0)
    {
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
    if(!next_letter_element)
      clearInterval(interval_id);
  }, Lerp(MIN_TYPE_DELAY_MS, MAX_TYPE_DELAY_MS, Math.random()));
}

main();