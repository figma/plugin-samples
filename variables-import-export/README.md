# Variables Import / Export Sample

This is a code sample to demonstrate how to use Variables APIs to import or export design tokens in a Figma plugin or widget. This sample imports and exports Variables formatted using the [W3C Design Tokens spec](https://design-tokens.github.io/community-group/format/#design-token).

This code is distributed strictly for educational purposes. It's purely a starting point and you should modify it as needed for your specific purposes. As such, there are some [known limitations](#known-limitations).

## Usage

Tokens should be defined in JSON following the W3C Design Tokens spec. An example below:

```json
{
  "group name": {
    "token name": {
      "$value": 1234,
      "$type": "number"
    }
  },
  "alias name": {
    "$value": "{group name.token name}"
  }
}
```

## Known Limitations

- Import doesn't support multiple modes - as there is no concept of modes in the W3C Design Spec at this time
  - You can only import 1 collection and mode at a time
  - For importing/overwriting variables to a specific mode, see [Alternative Sophisticated UI](#alternative-sophisticated-ui)
- Variables Import / Export only supports types that currently exist in the W3C Design Token Spec and in Figma. In other words, only `color`, `number`, and alias design tokens are currently supported

## Alternative Sophisticated UI

Our Developer Advocates, [Jake Albaugh](https://github.com/jake-figma) and [Akbar Mirza](https://github.com/akbarbmirza/), have created a sample with a slightly more sophisticated UI. You can find that at https://github.com/jake-figma/variables-import-export
