#include "Setup.hpp"

#include "Communication.hpp"
#include "Platform.hpp"

// Globals
LayoutState initial_layout_state;
LayoutState wanted_layout_state;

constexpr std::chrono::milliseconds kFetchDelay = std::chrono::milliseconds{10};

// Returns false if app should terminate
bool WaitForMessage(LayoutContext context) noexcept
{
  alignas(sizeof(uint32_t)) char size_char[sizeof(uint32_t)];
  std::cin.read(size_char, sizeof(uint32_t));
  uint32_t size;
  std::memcpy(&size, size_char, sizeof(uint32_t));

  if(size != 0)
  {
    char* message = new char[size];
    std::cin.read(message, size);
    //SendErrorString(std::string(message));
    json parsed_message = json::parse(message, message + size);

    json::iterator field_it;
    if((field_it = parsed_message.find("symbol")) != parsed_message.end())
      PressKey(context, *field_it);
    else if((field_it = parsed_message.find("status")) != parsed_message.end())
    {
      if(*field_it == "close")
      {
        delete[] message;
        return false;
      }
      else if(*field_it == "enable")
        SetLayout(context, wanted_layout_state);
      else if(*field_it == "disable")
        SetLayout(context, initial_layout_state);
    }
    else
      SendErrorString("No known fields found in message");

    delete[] message;
  }
  else
    std::this_thread::sleep_for(kFetchDelay);

  return true;
}



int main()
{
  LayoutContext context = GetLayoutContext();

  initial_layout_state = GetXkbSymbolNames(context);
  wanted_layout_state = GetWantedLayoutState(context);

  while (true)
  {
    if(!WaitForMessage(context))
      break;
  }
  
  FreeLayoutState(context, initial_layout_state);
  FreeLayoutState(context, wanted_layout_state);
  FreeLayoutContext(context);
  return 0;
}