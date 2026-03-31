#ifndef PLATFORM_LINUX_HPP
#define PLATFORM_LINUX_HPP
#pragma once

#include "Setup.hpp"

#include <X11/Xlib.h>
#include <X11/keysym.h>
#include <X11/extensions/XTest.h>
#include <X11/XKBlib.h>


void PressKey(Display* display, const std::string& symbol) noexcept;

void FormatSymbolNamesForSetting(std::string& symbol_names) noexcept;
void SetXkbSymbolNames(Display* display, const std::string& symbol_names) noexcept;
std::string GetXkbSymbolNames(Display* display) noexcept;

// Interface
using LayoutState = std::string;
using LayoutContext = Display*;

[[nodiscard]] inline auto GetLayoutContext() noexcept -> LayoutContext { return XOpenDisplay(NULL); }
inline void FreeLayoutContext(LayoutContext context) noexcept { XCloseDisplay(context); }
[[nodiscard]] inline auto GetLayoutState(LayoutContext context) noexcept -> LayoutState { return GetXkbSymbolNames(context); }
[[nodiscard]] inline auto GetWantedLayoutState([[maybe_unused]] LayoutContext context) noexcept -> std::string { return "+de"; }
// No need to free std::string
inline void FreeLayoutState([[maybe_unused]] LayoutContext context, [[maybe_unused]] const LayoutState& state) noexcept {}
inline void SetLayout(LayoutContext context, const LayoutState& state) noexcept { SetXkbSymbolNames(context, state); }

#endif // PLATFORM_LINUX_HPP