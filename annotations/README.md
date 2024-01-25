# Annotations

TODO: [Annotations Plugin Documentation](...)

A demo plugin that adds `"mainComponent"` property reference annotations to every component instance in the current selection.

**Important:** The Annotations API currently does not support rich text. Viewing text annotations with the plugin API will always yield plain text.

A single annotation contains both the label and properties.
This means that if you have an annotation with a rich text label, you cannot add a property to it without losing rich text formatting.
If users aren't making use of the rich text this is unnoticeable.
However, there is no way to detect which annotations are making use of it and which aren't.
