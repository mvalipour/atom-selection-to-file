'use babel';

import { CompositeDisposable } from 'atom';

export default {

  subscriptions: null,

  activate(state) {
    // Events subscribed to in atom's system can be easily cleaned up with a CompositeDisposable
    this.subscriptions = new CompositeDisposable();

    // Register command that creates
    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'selection-to-file:create': () => this.create()
    }));
  },

  deactivate() {
    this.subscriptions.dispose();
  },

  serialize() {
    return {};
  },

  create() {
    me = this;

    editor = atom.workspace.getActiveTextEditor();
    path = editor.getPath();
    fileExt = editor.getFileName().split('.').pop();
    dir = editor.getDirectoryPath();
    selectedText = editor.getSelectedText();
    newFilename = this.changeCase(selectedText)
    newPath = `${dir}/${newFilename}.${fileExt}`;

    return atom.workspace.open().then(newEditor => {
      newEditor.insertText(me.getBoilerplate(selectedText, fileExt));
      newEditor.saveAs(newPath)
    });
  },

  changeCase(text) {
    // TODO: use variant casing
    // TODO: use `change-case` lib
    // .
    // snake_case:
    return text.replace(/(?:^|\.?)([A-Z])/g, (x,y) => "_" + y.toLowerCase()).replace(/^_/, "")
  },

  getBoilerplate(text, extension) {
    // TODO: use variant boilerplate
    // .
    // `.rb`
    return `class ${text}\nend`
  }

};
