'use babel';

import { CompositeDisposable } from 'atom';
import * as languages from './languages';

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
    selectedText = editor.getSelectedText() || editor.getWordUnderCursor();
    newFilePath = this.buildPath(selectedText, fileExt)
    newPath = `${dir}/${newFilePath}.${fileExt}`;

    return atom.workspace.open().then(newEditor => {
      newEditor.saveAs(newPath)
    });
  },

  buildPath(text, ext) {
    const lang = languages[ext] || languages.none;
    return lang.pathBuilder(text);
  }

};
