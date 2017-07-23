# selection-to-file package

> Select some text then turn it into a [new file](https://twitter.com/mvalipour/status/886309170080874497) or [match your file name](https://twitter.com/mvalipour/status/889068473707528192).

```sh
apm install selection-to-file
```

## Commands:

- `selection-to-file:new-file` (`ctrl-r n`): creates a new file (in the same directory as active editor) and name it based on the text selection and current file extension.  
- `selection-to-file:new-file-prompt` (`ctrl-r ctrl-n`): same as this 👆 - prompt mode.
- `selection-to-file:match` (`ctrl-r m`): same as this 👆 but instead of a new file, it renames current file.
- `selection-to-file:pluck` (`ctrl-r p`): Plucks the selected text into a new file, prompting for the new path.

## Currently supports

- `.rb` files -- `snake_case`
- `.js` files -- `kebab-case`
- `.cs` files -- `PascalCase`

## Contribute

Contribution are welcome!
