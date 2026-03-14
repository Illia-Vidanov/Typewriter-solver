#include <iostream>
#include <thread>

int main(int argc, char** argv)
{
  const char* message = "{\"text\":\"Hello,                                                                 world!\"}";
    uint32_t size = std::char_traits<char>::length(message);
    std::cout.write(reinterpret_cast<const char*>(&size), sizeof(size));
    std::cout.write(message, size);
    std::cout.flush();
    std::this_thread::sleep_for(std::chrono::milliseconds(5000));

  return 0;
}