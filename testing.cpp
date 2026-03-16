#include <cstdlib>
#include <stdint.h>
#include <cstring>
#include <iostream>
#include <thread>
#include <X11/Xlib.h>
#include <X11/keysym.h>
#include <X11/extensions/XTest.h>

#include <X11/XKBlib.h>

int main()
{
  int event_code;
  int error_return;
  int major = XkbMajorVersion;
  int minor = XkbMinorVersion;
  int reason_return;
  Display *display = XkbOpenDisplay("", &event_code, &error_return, &major, &minor, &reason_return);

  switch(reason_return)
  {
  case XkbOD_BadLibraryVersion:
    std::cout << "Bad XKB library version";
    return 1;
  case XkbOD_ConnectionRefused:
    std::cout << "Connection to X server refused";
    return 1;
  case XkbOD_BadServerVersion:
    std::cout << "Bad X11 server version";
    return 1;
  case XkbOD_NonXkbServer:
    std::cout << "XKB not present";
    return 1;
  case XkbOD_Success:
    break;
  default:
    std::cout << "Unknown reason return";
    return 1;
  }

  XkbDescPtr kbd = XkbGetKeyboard(display, XkbAllComponentsMask, XkbUseCoreKbd);
  if(!kbd)
  {
    std::cerr << "Failed to get keyboard description." << std::endl;
    return 1;
  }
  std::cout << kbd->names->groups[0] << ' ' << XInternAtom(display, "German", False) << '\n';
  Atom de_atom = XInternAtom(display, "German", False);
  kbd->names->groups[0] = de_atom;

  if(!XkbSetNames(display, XkbGroupNamesMask, 0, 1, kbd))
  {
    std::cout << "Failed to update keyboard group" << std::endl;
    return 1;
  }

  //std::cout << XkbSetMap(display, XkbGroupNamesMask, kbd);

  std::cin.get();
  XkbFreeKeyboard(kbd, XkbAllComponentsMask, True);

  return 0;
}