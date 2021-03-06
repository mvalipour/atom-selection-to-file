'use babel';

import { CompositeDisposable } from 'atom';
import languageFactory from './languages';
import FileNameDialog from './file-name-dialog'
import fs from 'fs-plus';
import { camelCase } from 'change-case';

export default {

  subscriptions: null,

  activate(state) {
    this.subscriptions = new CompositeDisposable();
    this.registerCommand('new-file');
    this.registerCommand('new-file-prompt');
    this.registerCommand('match');
    this.registerCommand('match-prompt');
    this.registerCommand('pluck');
  },

  registerCommand(command) {
    atomCommand = {};
    atomCommand[`selection-to-file:${command}`] = this[camelCase(command)].bind(this)

    this.subscriptions.add(atom.commands.add('atom-text-editor', atomCommand));
  },

  deactivate() {
    this.subscriptions.dispose();
  },

  newFilePrompt(editor) {
    this.newFile(editor, { prompt: true });
  },

  matchPrompt(editor) {
    this.match(editor, { prompt: true });
  },

  newFile(editor, { prompt=false } = {}) {
    const me = this;
    this.onStart();
    editor = this.getEditor(editor);

    const path = editor.getPath();
    const selectedText = this.getSelectedText(editor);
    if(!selectedText) {
      return this.onComplete();
    }

    const lang = languageFactory(path);
    const newPath = lang.pathBuilder(path, selectedText);

    const finishOff = function (finalPath) {
      atom.workspace.open()
        .then(e => {
          e.insertText(
            lang.commentPrefix ?
              `${lang.commentPrefix} ${selectedText}` :
              selectedText
          );
          e.saveAs(finalPath);
        })
        .then(me.onComplete());
    }

    if(!prompt) {
      return finishOff(newPath);
    }

    const dialog = new FileNameDialog({
      initialPath: newPath,
      prompt: 'Enter the new path for the file.',
      onConfirm: p => finishOff(p)
    });
    dialog.attach();
  },

  match(editor, { prompt=false } = {}) {
    const me = this;
    this.onStart();
    editor = this.getEditor(editor);

    const path = editor.getPath();
    const selectedText = this.getSelectedText(editor);

    if(!selectedText || !fs.existsSync(path)) {
      return this.onComplete();
    }

    const lang = languageFactory(path);
    const newPath = lang.pathBuilder(path, selectedText);

    const finishOff = function (finalPath) {
      fs.move(path, finalPath, me.onComplete());
    }

    if(!prompt) {
      return finishOff(newPath);
    }

    const dialog = new FileNameDialog({
      initialPath: newPath,
      prompt: 'Enter the new path for the file.',
      onConfirm: p => finishOff(p)
    });
    dialog.attach();
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
