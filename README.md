# kaitai-struct-vscode [BETA]

This is an extension built by Dominick Reba (@fudgepop01) that allows for relative ease of development
of ksy files. To find out more about Kaitai Struct and what it can do,
head here: [[kaitai.io](https://kaitai.io/)]

this is the first extension to utilize the [[fudgedit](https://fudgepop01.github.io/)] hex editor. An extension
exposing the editor itself will be released at a later date if requested.

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

If you have any requirements or dependencies, add a section describing those and how to install and configure them.

## Extension Settings

Include if your extension adds any VS Code settings through the `contributes.configuration` extension point.

For example:

This extension contributes the following settings:

* `myExtension.enable`: enable/disable this extension
* `myExtension.thing`: set to `blah` to do something

## Known Issues

Calling out known issues can help limit users opening duplicate issues against your extension.

## TODO / PLANNED FEATURES

* [ ] fudgedit
  * [x] initial integration with vscode
  * [ ] bundle fudgedit with the extension rather than pulling from unpkg
* [x] regions
  * [x] ensure arrays work
  * [x] render instances properly
  * [x] render sequences properly
* [x] tree view
* [ ] intuitive webview GUI
  * [ ] region depth adjustment (_technically_ speaking this is implemented)
  * [ ] property adjustment
    * [ ] line width
    * [ ] number of lines
    * [ ] group size
    * [ ] inline ASCII toggle
    * [ ] editor mode toggle
  * [ ] selected byte value viewer
* [ ] optimization / usability
  * [x] use base64 to transfer data to/from webview
  * [ ] a scrollbar
  * [ ] lazy load instances when possible
  * [ ] edit / save opened files directly via fudgedit

## Release Notes

Users appreciate release notes as you update your extension.

### 1.0.0

Initial release of ...

### 1.0.1

Fixed issue #.

### 1.1.0

Added features X, Y, and Z.