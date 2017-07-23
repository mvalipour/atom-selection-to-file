'use babel';

import { CompositeDisposable } from 'atom';
import languageFactory from './languages';
import FileNameDialog from './file-name-dialog'
import fs from 'fs-plus';

export default {

  subscriptions: null,

  activate(state) {
    this.subscriptions = new CompositeDisposable();
    this.registerCommand('new-file', 'newFile');
    this.registerCommand('match');
    this.registerCommand('pluck');
  },

  registerCommand(command, fnName='') {
    atomCommand = {};
    atomCommand[`selection-to-file:${command}`] = this[fnName || command].bind(this)

    this.subscriptions.add(atom.commands.add('atom-text-editor', atomCommand));
  },

  deactivate() {
    this.subscriptions.dispose();
  },

  newFile(editor) {
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

      fs.move(path, newPath, this.onComplete.bind(this));
    }
    else {
      this.onComplete();
    }
  },

  pluck(editor) {
    const me = this;
    this.onStart();
    editor = this.getEditor(editor);
    const path = editor.getPath();
    const selectedText = this.getSelectedText(editor);
    if(!selectedText) {
      return this.onComplete();
    }

    const dialog = new FileNameDialog({
      initialPath: path,
      prompt: 'Enter the new path for the file.',
      onConfirm: newPath => {
        if(fs.existsSync(newPath)) {
          atom.notifications.addError('A file with this name already exists!')
          return false;
        }
        atom.workspace.open()
          .then(e => {
            editor.backspace();
            e.insertText(selectedText);
            return e.saveAs(newPath);
          })
          .then(() => me.onComplete());
      }
    });
    dialog.attach();
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
