cmake_minimum_required(VERSION 3.12)

project(TypewriterSolverHost)

add_executable(${PROJECT_NAME} main.cpp)

set_target_properties(
  ${PROJECT_NAME} PROPERTIES
  OUTPUT_NAME "com.tolik708.typewriter_solver"
  SUFFIX ".exe"
  CXX_STANDARD 17
)

target_compile_options(
  ${PROJECT_NAME}
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
  PUBLIC X11
  PUBLIC Xtst
)