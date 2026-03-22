cmake_minimum_required(VERSION 3.12)

project(TypewriterSolverHost)

# Dependencies
include(FetchContent)

FetchContent_Declare(
  nlohmann_json
  GIT_REPOSITORY https://github.com/nlohmann/json
  GIT_TAG 55f93686c01528224f448c19128836e7df245f72
  EXCLUDE_FROM_ALL
)
FetchContent_MakeAvailable(nlohmann_json)

FetchContent_Declare(
  googletest
  URL https://github.com/google/googletest/archive/03597a01ee50ed33e9dfd640b249b4be3799d395.zip
  EXCLUDE_FROM_ALL
)

set(gtest_force_shared_crt ON CACHE BOOL "" FORCE)
FetchContent_MakeAvailable(googletest)

# Target
add_executable(${PROJECT_NAME} main.cpp)

set_target_properties(
  ${PROJECT_NAME} PROPERTIES
  OUTPUT_NAME "com.tolik708.typewriter_solver"
  SUFFIX ".exe"
  CXX_STANDARD 17
)

target_compile_options(
  ${PROJECT_NAME}
  PRIVATE -g
  PRIVATE -Wall
  PRIVATE -Wextra
  PRIVATE -Wshadow
  PRIVATE -Wdeprecated
  PRIVATE -pedantic-errors
  PRIVATE -fmax-errors=3
  PRIVATE -Wno-deprecated
)

target_include_directories(${PROJECT_NAME}
  PUBLIC ${CMAKE_CURRENT_SOURCE_DIR}
)

target_link_libraries(${PROJECT_NAME}
  PRIVATE X11
  PRIVATE Xtst
  PRIVATE nlohmann_json
)