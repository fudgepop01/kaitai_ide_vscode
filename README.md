# kaitai-struct-vscode (featuring BETA typescript support)

This is an extension built by Dominick Reba (@fudgepop01) that allows for relative ease of development
of ksy files. To find out more about Kaitai Struct and what it can do,
head here: [[kaitai.io](https://kaitai.io/)]

If you want to see an overview of what this extension can do, check out [[the overview video here](https://www.youtube.com/watch?v=4c7UuZ33JYE)]

this is the first extension to utilize the [[fudgedit](https://fudgepop01.github.io/)] hex editor. An extension
exposing the editor itself will be released at a later date if requested.

## Usage

1. open the command palette
2. use the "open hex editor" command
3. in the file explorer, right-click the file you wish to view
4. select "open file as hex"
5. if the file is large, wait a bit for it to load
6. right click the ksy file you wish to visualize
7. choose "compile and examine ksy"
8. wait for it to process and send all the data
9. enjoy your visualization

To generate a new parser from a ksy file in a target language, right click on a
ksy file and select "compile to target language". A prompt will appear where you choose the
target langugae of choice. Pick the language and a parser will be generated from the ksy.

## Pro Tip

Thanks to contributions from [BryceBarbara](https://github.com/BryceBarbara), it is no longer necessary to manually
edit the file associations. Thank you Bryce!

## Features

### regions: highlighting with depth

A _region_ is the name I've given to the different chunks of a file.
_Depth_ refers to how many layers are traversed and visualized in the hex viewer.
Take the following example ksy:

```yaml
seq:
  - id: no_subregions
    type: u4
  - id: has_subregions
    type: example_type
types:
  example_type:
    seq:
      - id: first_child
        type: u4
      - id: second_child
        type: u2
```

When the region depth parameter has a value of 1, only the regions representing
the `no_subregions` and `has_subregions` will show up. However, with a region
depth of 2, the individual components of `has_subregions`, `first_child` and
`second_child`, will appear and overlap its parent (`has_subregions`).

### regions: tooltips

When hovering over one of these generated regions, you'll see some data about
the underlying region in the form of a tooltip. This tooltip will contain
at minumum a `name` (the `id` from the ksy) and the `size` of the region (along
with start and end positions in brackets)

Hovering over regions will grey out all other regions to allow the
the user to focus on what particular region is being highlighted and
distinguish it from the others.

Hovering over a region with a raw value type, such as string or integer
will (read: _should_) additionally display the obtained value in the best way it can.

### chunks: focus on what's relevant

If the option is enabled, chunking will automatically take place when a node is clicked in the
tree-view. This will force the hex viewer to only render the chunk of the file that's relevant.

### tree views

Upon compiling a kaitai struct file, a tree view in the explorer panel will pop up
(if enabled). This will be titled KSEXPLORER (Kaitai Struct EXPLORER), and contains
a tree view of all of the region names along with their types (or values). This
will also give the user a bit more control over the editor.

### tree views: navigation

if a tree view's node has children, then a dropdown toggle will appear at the
start of the node. Clicking this will expand that region and show the child nodes.

### tree views: jumping

By clicking on one of the tree's nodes, the hex editor will jump to the location of
that node in the hex, place the cursor at the starting byte of the node, and select
the area occupied by the node in the editor. This allows the user to navigate and
view regions significantly easier, or focus on particular regions without the color
overlay.

## Requirements

None! It *should* all work out of the box!

## Release Notes

### Version 1.0.0
#### Bugfixes
- WHOOPS I managed to break instances 8 months ago and never got around to fixing that
  - (in previous versions it only worked with the "eager analysis" box checked)
- Error messages from compilation now properly show the path to the problem

#### Additions
- kaitai struct compiler is updated once more (with VERY beta typescript support)
- KSExplorer renamed to "Kaitai Struct Explorer"
  - keyboard navigation for this panel improved
- more colors to differentiate between regions with varying levels of saturation depending on depth
- doc comments are shown when hovering over a region

### Version 0.9.0
- The commands should work again!
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

#### Bugfixes
- _unchecking_ the "chunk selected" option will now immediately display the full view once more
- made commands uh... well, the commands actually work now.

## Future Plans:

- find MORE job lol
- ~~MAYBE make doc comments show up in regions~~ 
  - I DID IT, WOO

## Contributions / Credits:

- [StencilJS](https://stenciljs.com) for the tools that enabled me to build the hex editor
- [@Theaninova](https://github.com/Theaninova) for the beta typescript compiler
- [@BryceBarbara](https://github.com/BryceBarbara) for effectively refactoring an enormous amount of this extension's codebase, effectively making it much more maintainable
- [Kaitai Struct](https://kaitai.io) (this literally would not exist without it)