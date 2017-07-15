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
    toSnakeCase = s => s.replace(/(?:^|\.?)([A-Z])/g, (x,y) => "_" + y.toLowerCase()).replace(/^_/, "")

    editor = atom.workspace.getActiveTextEditor();
    path = editor.getPath();
    fileName = editor.getFileName();
    fileExt = fileName.split('.').pop();
    dir = path.substring(0, path.length - fileName.length);
    selectedText = editor.getSelectedText();
    newPath = dir + toSnakeCase(selectedText) + '.' + fileExt;

    return atom.workspace.open().then(e => e.saveAs(newPath));
  }

};
