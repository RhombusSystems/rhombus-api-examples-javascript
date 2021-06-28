cmake_minimum_required(VERSION 3.19.4)
project(RhombusHelperImageProcessor VERSION 0.1.0)

set(This Rhombus)

enable_testing()

file(
  GLOB_RECURSE Sources
  "src/*.cpp"
)

include_directories(include/vendor/glfw/include vendor/ include/)

add_executable(${This} ${Sources})

option(GLFW_BUILD_EXAMPLES OFF)
option(GLFW_BUILD_TESTS OFF)
option(GLFW_BUILD_DOCS OFF)
add_subdirectory(${CMAKE_SOURCE_DIR}/vendor/glfw)
target_link_libraries(${This} PRIVATE glfw)
