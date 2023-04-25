# Change Log
All notable changes to the "kaitai-struct-vscode" extension will be documented in this file.

## [Version 0.9.0]
### Bugfixes
- _unchecking_ the "chunk selected" option will now immediately display the full view once more
- made commands uh... well, the commands actually work now.
- scrolling with a scroll wheel finally works after literally 4 years

### Additions
- updated the kaitai struct compiler itself
- fixed major previously-somehow-uncaught bug that prevented commands from actually working (whoops)
- new options
  - "non-display character" is what will be displayed when the character does not have an ASCII equivalent
  - "non-display opacity" is how opaque said character is
  - "go to line" replaced by the _significantly_ more useful "go to offset"
- **updated the editor itself**
  - makes it compatible with scroll wheels
  - hold `Ctrl` while scrolling to scroll 10x the normal amount
  - hold `Shift` while scrolling to scroll 1 line at a time
  - hold `Ctrl+Shift` while scrolling to scroll 1 _page_ at a time
  - the tooltip text can be selected by clicking on a region. It will immediately warp to the cursor in a selectable state, only unfreezing when the editor is clicked again
- **BETA typescript support**
  - The compiler for this extension was built with a typescript fork created by [@Theaninova](https://github.com/Theaninova)
  - ([here is the pull request for that feature](kaitai-io/kaitai_struct_compiler#249))

## [0.8.1]
### Fixed
- made it so the extension cache actually refreshes between compiles

## [0.8.0]
### Added
- various contributions from github user [BryceBarbara](https://github.com/BryceBarbara)

### Fixed (at last)
- the region highlighting showing up at the wrong location for no discernable reason 
- importing of js files or something (idk it has been awhile oops)

## [0.7.0]
### Added
- hex display updated to v1.0.0
  - regions are now rendered for all views
  - ability to toggle what type of view is desired
  - ability to just render specific chunks of the open file
  - a new binary view
  - values can be found/jumped to with cmd/ctrl+F
    - floating point values may be innaccurate
  - find out more at [my github site](https://fudgepop01.github.io)
- moved settings panel to the side
  - it can be opened/closed by clicking on the vertical bar that says "settings"
- bit-sized structures are now rendered properly.

### Fixed
- commands only show up on the command palette when they're actually available

### Removed
- the incredibly-underwhelming info display

## [0.6.4]
### Fixed
- improved circular detection for arrays
- prevented circular structures from showing up as a region in the hex view

## [0.6.3]
### Fixed
- fixed bug concerning instances with `if` conditions

## [0.6.2]
### Added
  - support for recursive instances
    - when a recursive instnace is detected, it will switch to lazy mode and mark the instance with `[rec]`

## [0.6.1]
### Added
- early typescript support
- "jump to line" feature in webview

## [0.6.0]
### Added
- Lazy mode
  - this means that you don't need to worry about parsing types with enormous instances anymore!
    when not running in eager mode:
    - In the KSExplorer panel, instances show up with `[instance]` which can then be expanded by clicking on them
    - regions of instances (if they exist) don't show up until they're clicked on
    - if for some reason you want to have fun clicking endlessly in a circular structure, you can do that too in 'lazy' mode
- eager mode togglable via a checkbox in the webview

### Fixed
- encountering circular references in eager mode no-longer causes infinite loops

## [0.5.1]
### Fixed
- bug involving optional fields/instances that have an `if` attribute that returns `false`

## [0.5.0]
### Fixed
- updated kaitai struct so that nested types with parameters work properly (ex. `my_type::my_nested_type_with_parameter(2)`)

## [0.4.0]
### Added
- updated to the latest version of Kaitai Struct (0.8 ==> 0.9)

### Fixed
- actually made it work on windows (sorry about that)

## [0.3.1]
### Fixed
- fixed oversight preventing imports from being handled properly when compiling to a target language

## [0.3.0]
### Added
- arrays of primitives now behave like arrays instead of displaying the contents in one line

## [0.2.2]
### Fixed
- opening file as hex without hex editor already open will now properly wait for the editor to load

## [0.2.1]
### Added
- ability to import other ksy files
- very basic info panel

## [0.1.0]
### Added
- webview with hex and ASCII display
- compilation of ksy files to other supported file formats
- ability to open files in the hex display
- ability to compile and examine the file open in the hex editor
- settings panel
- [intro video](https://www.youtube.com/watch?v=4c7UuZ33JYE) to introduce the extension

### Notes
- First beta release, hurrah!
