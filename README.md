# selection-to-file package

> Select some text then turn it into a [new file](https://twitter.com/mvalipour/status/886309170080874497) or [match your file name](https://twitter.com/mvalipour/status/889068473707528192).

## Commands:

- `selection-to-file:new-file` (`ctrl-r c`): creates a new file (in the same directory as active editor) and name it based on the text selection and current file extension.
- `selection-to-file:match` (`ctrl-r m`): same as this 👆 but instead of a new file, it renames current file.

## Currently supports

- `.rb` files -- `snake_case`
- `.js` files -- `kebab-case`
- `.cs` files -- `PascalCase`

## Contribute

Contribution are welcome!
