#ifndef COMMUNICATION_HPP
#define COMMUNICATION_HPP
#pragma once

#include "Setup.hpp"


void SendMessage(const json& message_json) noexcept;
void SendErrorMessage(const json& message_json) noexcept;
void SendString(const std::string& string) noexcept;
void SendErrorString(const std::string& string) noexcept;

#endif // COMMUNICATION_HPP