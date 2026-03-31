#include "PlatformLinux.hpp"

#include "Setup.hpp"

#include <X11/Xlib.h>
#include <X11/keysym.h>
#include <X11/extensions/XTest.h>
#include <X11/XKBlib.h>

#include "Communication.hpp"


// usually symboll names we get from XkbGetKeyboard and XGetAtomName are formatted as
// "pc_us_inet(evdev)_terminate(ctrl_alt_bksp)" but the correct syntax would be something like "+pc+us+inet(edev)+terminate(ctrl_alt_bksp)"
void FormatSymbolNamesForSetting(std::string& symbol_names) noexcept
{
  if(symbol_names.empty())
    return;
    
  symbol_names.insert(0, 1, '+');
  int in_bracket = 0;
  for(std::size_t i = 1; i < symbol_names.size(); ++i)
  {
    if(symbol_names[i] == '(') // I really hope that this approximation won't break anything
      ++in_bracket;
    else if(symbol_names[i] == ')')
      --in_bracket;
    else if(in_bracket == 0 && symbol_names[i] == '_')
      symbol_names[i] = '+';
  }
}

void SetXkbSymbolNames(Display* display, const std::string& symbol_names) noexcept
{
  if(symbol_names.empty())
    return;

  char* symbol_names_copy = strdup(symbol_names.c_str());

  XkbComponentNamesRec names;
  names.keymap = NULL;
  names.keycodes = NULL;
  names.types = NULL;
  names.compat = NULL;
  names.symbols = symbol_names_copy;
  names.geometry = NULL;
  XkbDescPtr keyboard_description = XkbGetKeyboardByName(display, XkbUseCoreKbd, &names, XkbGBN_AllComponentsMask, XkbGBN_AllComponentsMask, True);
  if(!keyboard_description)
    SendErrorString("Failed to change Keyboard layout");
  else
    XkbFreeKeyboard(keyboard_description, XkbAllComponentsMask, True);
}

std::string GetXkbSymbolNames(Display* display) noexcept
{
  XkbDescPtr keyboard_description = XkbGetKeyboard(display, XkbAllComponentsMask, XkbUseCoreKbd);
  if(!keyboard_description)
  {
    SendErrorString("Failed to get keyboard description");
    return "";
  }

  char* symbol_atom_names = XGetAtomName(display, keyboard_description->names->symbols);
  if(!symbol_atom_names)
  {
    XkbFreeKeyboard(keyboard_description, XkbAllComponentsMask, True);
    SendErrorString("Failed to get atom name");
    return "";
  }

  std::string symbol_names = std::string(symbol_atom_names);
  
  XkbFreeKeyboard(keyboard_description, XkbAllComponentsMask, True);
  XFree(symbol_atom_names);

  FormatSymbolNamesForSetting(symbol_names);
  return symbol_names;
}

void PressKey(Display* display, const std::string& symbol) noexcept
{
  static const KeyCode kShiftKeycode = XKeysymToKeycode(display, XK_Shift_L);
  static const KeyCode kAltGrKeycode = XKeysymToKeycode(display, XK_ISO_Level3_Shift) == 0 ? XKeysymToKeycode(display, XK_Mode_switch) : XKeysymToKeycode(display, XK_ISO_Level3_Shift);

  // We need to use hash table, because we have non-ascii charachters
  using CharKeysymMapType = std::unordered_map<std::string, std::pair<uint16_t, KeyCode>>;
  // Map is german layout specific
  static const CharKeysymMapType kCharKeysymMap =
  {
    { "A", { XK_A, kShiftKeycode } },
    { "B", { XK_B, kShiftKeycode } },
    { "C", { XK_C, kShiftKeycode } },
    { "D", { XK_D, kShiftKeycode } },
    { "E", { XK_E, kShiftKeycode } },
    { "F", { XK_F, kShiftKeycode } },
    { "G", { XK_G, kShiftKeycode } },
    { "H", { XK_H, kShiftKeycode } },
    { "I", { XK_I, kShiftKeycode } },
    { "J", { XK_J, kShiftKeycode } },
    { "K", { XK_K, kShiftKeycode } },
    { "L", { XK_L, kShiftKeycode } },
    { "M", { XK_M, kShiftKeycode } },
    { "N", { XK_N, kShiftKeycode } },
    { "O", { XK_O, kShiftKeycode } },
    { "P", { XK_P, kShiftKeycode } },
    { "Q", { XK_Q, kShiftKeycode } },
    { "R", { XK_R, kShiftKeycode } },
    { "S", { XK_S, kShiftKeycode } },
    { "T", { XK_T, kShiftKeycode } },
    { "U", { XK_U, kShiftKeycode } },
    { "V", { XK_V, kShiftKeycode } },
    { "W", { XK_W, kShiftKeycode } },
    { "X", { XK_X, kShiftKeycode } },
    { "Y", { XK_Y, kShiftKeycode } },
    { "Z", { XK_Z, kShiftKeycode } },

    { "a", { XK_a, 0 } },
    { "b", { XK_b, 0 } },
    { "c", { XK_c, 0 } },
    { "d", { XK_d, 0 } },
    { "e", { XK_e, 0 } },
    { "f", { XK_f, 0 } },
    { "g", { XK_g, 0 } },
    { "h", { XK_h, 0 } },
    { "i", { XK_i, 0 } },
    { "j", { XK_j, 0 } },
    { "k", { XK_k, 0 } },
    { "l", { XK_l, 0 } },
    { "m", { XK_m, 0 } },
    { "n", { XK_n, 0 } },
    { "o", { XK_o, 0 } },
    { "p", { XK_p, 0 } },
    { "q", { XK_q, 0 } },
    { "r", { XK_r, 0 } },
    { "s", { XK_s, 0 } },
    { "t", { XK_t, 0 } },
    { "u", { XK_u, 0 } },
    { "v", { XK_v, 0 } },
    { "w", { XK_w, 0 } },
    { "x", { XK_x, 0 } },
    { "y", { XK_y, 0 } },
    { "z", { XK_z, 0 } },

    { "Ö", { XK_Odiaeresis, kShiftKeycode } },
    { "ö", { XK_odiaeresis, 0 } },
    { "Ä", { XK_Adiaeresis, kShiftKeycode } },
    { "ä", { XK_adiaeresis, 0 } },
    { "Ü", { XK_Udiaeresis, kShiftKeycode } },
    { "ü", { XK_udiaeresis, 0 } },

    { "°",  { XK_degree,     kShiftKeycode } },
    { "!",  { XK_exclam,     kShiftKeycode } },
    { "\"", { XK_quotedbl,   kShiftKeycode } },
    { "§",  { XK_section,    kShiftKeycode } },
    { "$",  { XK_dollar,     kShiftKeycode } },
    { "%",  { XK_percent,    kShiftKeycode } },
    { "&",  { XK_ampersand,  kShiftKeycode } },
    { "/",  { XK_slash,      kShiftKeycode } },
    { "(",  { XK_parenleft,  kShiftKeycode } },
    { ")",  { XK_parenright, kShiftKeycode } },
    { "=",  { XK_equal,      kShiftKeycode } },
    { "?",  { XK_question,   kShiftKeycode } },
    { "`",  { XK_grave,      kShiftKeycode } },

    { "^", { XK_asciicircum, 0 } },
    { "1", { XK_1,           0 } },
    { "2", { XK_2,           0 } },
    { "3", { XK_3,           0 } },
    { "4", { XK_4,           0 } },
    { "5", { XK_5,           0 } },
    { "6", { XK_6,           0 } },
    { "7", { XK_7,           0 } },
    { "8", { XK_8,           0 } },
    { "9", { XK_9,           0 } },
    { "0", { XK_0,           0 } },
    { "ß", { XK_ssharp,      0 } },
    { "´", { XK_acute,       0 } },
    
    { " ",  { XK_space,       0 } },
    { "#",  { XK_numbersign,  0 } },
    { "*",  { XK_asterisk,    kShiftKeycode } },
    { "+",  { XK_plus,        0 } },
    { "\'", { XK_apostrophe,  kShiftKeycode } },
    { ",",  { XK_comma,       0 } },
    { ".",  { XK_period,      0 } },
    { "-",  { XK_minus,       0 } },
    { "_",  { XK_underscore,  kShiftKeycode } },
    { ":",  { XK_colon,       kShiftKeycode } },
    { ";",  { XK_semicolon,   kShiftKeycode } },
    { "<",  { XK_less,        0 } },
    { ">",  { XK_greater,     kShiftKeycode } },

    { ">",  { XK_at,          kAltGrKeycode } },
  };

  CharKeysymMapType::const_iterator it = kCharKeysymMap.find(symbol);
  if(it == kCharKeysymMap.end())
  {
    SendErrorString("Unknown key \"" + symbol + "\" " + std::to_string(static_cast<uint8_t>(symbol[0])));
    return;
  }

  const uint8_t keycode = XKeysymToKeycode(display, it->second.first);
  if(keycode == 0)
  {
    SendErrorMessage("Couldn't convert keysym \"" + std::to_string(it->second.first) + "\"to keycode");
    return;
  }

  /*
  json message;
  message["symbol"] = symbol;
  message["keysym"] = it->second.first;
  message["keycode"] = keycode;
  SendMessage(message); */

  if(it->second.second)
    XTestFakeKeyEvent(display, it->second.second, True, 0);
  XTestFakeKeyEvent(display, keycode, True, 0);
  XTestFakeKeyEvent(display, keycode, False, 0);
  if(it->second.second)
    XTestFakeKeyEvent(display, it->second.second, False, 0);

  XFlush(display);
}