#include "Communication.hpp"

#include "Setup.hpp"

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

// Open chrome with "google-chrome-stable --enable-logging=stderr --log-level=0" to view errors
void SendErrorMessage(const json& message_json) noexcept
{
  const std::string& message = message_json.dump();
  uint32_t size = message.size();
  alignas(sizeof(uint32_t)) char size_char[sizeof(uint32_t)];
  std::memcpy(size_char, &size, sizeof(uint32_t));
  std::cerr.write(size_char, 4);
  std::cerr.write(message.data(), size);
}

void SendString(const std::string& string) noexcept
{
    json message;
    message["Message"] = string;
    SendMessage(message);
}

void SendErrorString(const std::string& string) noexcept
{
    json message;
    message["Error"] = string;
    SendErrorMessage(message);
}