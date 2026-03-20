#include <cstdlib>
#include <stdint.h>
#include <cstring>
#include <iostream>
#include <thread>
#include <X11/Xlib.h>
#include <X11/keysym.h>
#include <X11/extensions/XTest.h>

#include <X11/XKBlib.h>

/*
Next

So I am trying to change keyboard layout using XKBlib and almost got it
Right now XkbSetNames doesn't work and I don't know why
I guess that I should be changing not groups but symbols, but not sure

We should better analyse XkbGetKeyboard(display, XkbAllComponentsMask, XkbUseCoreKbd); to see what actually changes when I call setxkbmap ...
And we should check if this changes are made after XkbSetNames by calling XkbGetKeyboard again.
*/

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
  char *symbols_name = XGetAtomName(display, kbd->names->symbols);
  std::cout << symbols_name << '\n';

  XkbComponentNamesRec names;
  char symbols[] = "+pc+us+inet(evdev)+terminate(ctrl_alt_bksp)";
  names.keymap = NULL;
  names.keycodes = NULL;
  names.types = NULL;
  names.compat = NULL;
  names.symbols = symbols;
  names.geometry = NULL;
  XkbDescPtr kbd1 = XkbGetKeyboardByName(display, XkbUseCoreKbd, &names, XkbGBN_AllComponentsMask, XkbGBN_AllComponentsMask, True);

  /*kbd = XkbGetKeyboard(display, XkbAllComponentsMask, XkbUseCoreKbd);
  if(!kbd)
  {
    std::cerr << "Failed to get keyboard description." << std::endl;
    return 1;
  }

  std::cout << kbd->names->groups[0] << '\n';*/

  std::cin.get();
  XFree(symbols_name);
  XkbFreeKeyboard(kbd, XkbAllComponentsMask, True);
  XkbFreeKeyboard(kbd1, XkbAllComponentsMask, True);
  XCloseDisplay(display);
  return 0;
}