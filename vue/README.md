# Vue 

<img src="../_screenshots/webpack.png" width="400" />

Creates rectangles (same as the [Webpack sample plugin][webpack]).

This demonstrates:

- bundling plugin code using Webpack, and
- using Vue.

The main plugin code is in `src/code.ts`. The HTML for the UI is in
`src/ui.html`, while the embedded JavaScript is in `src/ui.js` and the Vue script is in `src/App.vue`.

These are compiled to files in `build/`, which are what Figma will use to run
your plugin as set in the `manifest.json`.

To build:

    $ npm install
    $ npx webpack

[webpack]: ../webpack/
