function GetNextLetterElement()
{
  const all_elements_with_style = document.querySelectorAll("*[style]");
  for(const element of all_elements_with_style)
  {
    if(element.getAttribute("style") == "position: relative; float: left; background: rgba(84,84,84,0.2);")
      return element;
  }
}

function main()
{
  let next_letter_element = GetNextLetterElement();
  const interval_id = setInterval(() =>
  {
    document.getElementById("input_area").dispatchEvent(new KeyboardEvent('keypress', {
      key: next_letter_element.innerHTML
    }));

    next_letter_element = document.getElementById(next_letter_element.id);
    if(!next_letter_element)
      clearInterval(interval_id);
  }, 50);
}

main();