#include <iostream>
#include <stdint.h>
#include <string.h>
#include <thread>

#include <X11/Xlib.h>
#include <X11/keysym.h>
#include <X11/extensions/XTest.h>

#include <nlohmann/json.hpp>
using json = nlohmann::json;

// For debuging and testing purpuses
void SendMessage(const json& message_json) noexcept
{
  const std::string& message = message_json.dump();
  uint32_t size = message.size();
  alignas(sizeof(uint32_t)) char size_char[sizeof(uint32_t)];
  std::memcpy(size_char, &size, sizeof(uint32_t));
  std::cout.write(size_char, 4);
  std::cout.write(message.data(), size);
  std::cout.flush();
}

int main()
{
  Display *display = XOpenDisplay(NULL);
  while (true)
  {
    alignas(sizeof(uint32_t)) char size_char[sizeof(uint32_t)];
    std::cin.read(size_char, sizeof(uint32_t));
    uint32_t size;
    std::memcpy(&size, size_char, sizeof(uint32_t));
    json msg;
    msg["size"] = size;
    SendMessage(msg);

    if(size != 0)
    {
      char* message = new char[size];
      std::cin.read(message, size);
      msg.clear();
      msg["msg"] = message;
      SendMessage(msg);
      //std::cerr << message;
      delete[] message;
    }
    else
      std::this_thread::sleep_for(std::chrono::seconds(1));

    //uint32_t keycode = XKeysymToKeycode(display, keysym);
    //XTestFakeKeyEvent(display, keycode, True, 0);
    //XTestFakeKeyEvent(display, keycode, False, 0);
    //XFlush(display);
  }
  
  XCloseDisplay(display);
  return 0;
}