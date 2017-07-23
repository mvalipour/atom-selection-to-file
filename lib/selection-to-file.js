'use babel';

import { CompositeDisposable } from 'atom';
import languageFactory from './languages';
import fs from 'fs-plus';

export default {

  subscriptions: null,

  activate(state) {
    this.subscriptions = new CompositeDisposable();
    this.registerCommand('create');
    this.registerCommand('match');
  },

  registerCommand(command) {
    atomCommand = {};
    atomCommand[`selection-to-file:${command}`] = this[command].bind(this)

    this.subscriptions.add(atom.commands.add('atom-text-editor', atomCommand));
  },

  deactivate() {
    this.subscriptions.dispose();
  },

  create(editor) {
    this.onStart();
    editor = this.getEditor(editor);

    const path = editor.getPath();
    const selectedText = this.getSelectedText(editor);
    if(!selectedText) {
      return this.onComplete();
    }

    const lang = languageFactory(path);
    const newPath = lang.pathBuilder(path, selectedText);

    return atom.workspace.open()
      .then(e => {
        e.insertText(
          lang.commentPrefix ?
            `${lang.commentPrefix} ${selectedText}` :
            selectedText
        );
        e.saveAs(newPath)
      })
      .then(this.onComplete.bind(this));
  },

  match(editor) {
    this.onStart();
    editor = this.getEditor(editor);

    const path = editor.getPath();
    const selectedText = this.getSelectedText(editor);

    if(selectedText && fs.existsSync(path)) {
      const lang = languageFactory(path);
      const newPath = lang.pathBuilder(path, selectedText);

      fs.moveSync(path, newPath);
    }

    this.onComplete();
  },

  getSelectedText(editor) {
    return editor.getSelectedText() || editor.getWordUnderCursor()
  },

  getEditor(editor) {
    return (editor && editor.constructor.name === 'TextEditor') ?
      editor :
      atom.workspace.getActiveTextEditor();
  },

  onComplete() { this.state = 'completed'; },
  onStart() { this.state = 'started'; }
};
