# Antinote Extensions

## Intro

Antinote enables extensions written in ES5 Javascript which enable new utility keywords that can do the following:
- Add new text to a note
- Edit existing text in a note
- Open URLs and URI Schemes (for deeplinking / exporting)

__Limitations__
- Extensions are sandboxed and cannot access any networking features or APIs
- They run entriely local on the user's machine
- They can only access one note at a time

## Downloading Extensions

1. To open the Extensions folder for Antinote, paste this command into your Terminal:

```bash
open ~/Library/Containers/com.chabomakers.Antinote/Data/Library/Application\ Support/Antinote/Extensions
```
2. Copy/paste any of the extensions from this repo's `extensions-official` folder into there.
3. Restart Antinote.
4. Use the extension by typing `** extension_command(arg1, arg2, etc)` and then pressing enter.

## Creating an Extension

