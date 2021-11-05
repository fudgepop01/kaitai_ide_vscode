# kaitai-struct-vscode [BETA]

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

## Known Issues

- sometimes the code is analyzed from the wrong offset somehow...
- search function occasionally breaks

## Release Notes

After working for awhile to improve the hex viewer, I am proud to release 0.7.0 of this extension!
There are a number of new things that have been added thanks to this new power.
Here is the changelog entry for this version:

```md
## [0.7.0]
### Added
- hex display updated to v1.0.0
  - regions are now rendered for all views
  - ability to toggle what type of view is desired
  - ability to just render specific chunks of the open file
  - a new binary view
  - values can be found/jumped to with cmd/ctrl+F
    - floating point values may be innaccurate
  - find out more at my github site: https://fudgepop01.github.io
- moved settings panel to the side
  - it can be opened/closed by clicking on the vertical bar that says "settings"
- bit-sized structures are now rendered properly.

### Removed
- the incredibly-underwhelming info display
```

Speaking of the changelog, it now actually serves the correct function as a changelog. I've since cleaned up and restructured this README file.

## Future Plans:

- fix bugs
- add ability to see ksy doc comments in the region tooltips
