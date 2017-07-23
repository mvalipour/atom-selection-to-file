'use babel';

import {TextEditor, CompositeDisposable, Disposable, Emitter} from 'atom';
import path from 'path';

export default class FileNameDialog {

  constructor({ initialPath, prompt, onConfirm } = {}) {
    this.onConfirm = onConfirm || (t => {})
    this.emitter = new Emitter();
    this.disposables = new CompositeDisposable();

    this.element = document.createElement('div');
    this.element.classList.add('tree-view-dialog');

    this.promptText = document.createElement('label');
    this.promptText.classList.add('icon');
    this.promptText.textContent = prompt;
    this.element.appendChild(this.promptText);

    this.miniEditor = new TextEditor({mini: true});
    const blurHandler = () => {
      if(document.hasFocus()) {
        this.close();
      }
    }
    this.miniEditor.element.addEventListener('blur', blurHandler);
    this.disposables.add(new Disposable(() => this.miniEditor.element.removeEventListener('blur', blurHandler)));
    this.element.appendChild(this.miniEditor.element);
    atom.commands.add(this.element, {
      'core:confirm': () => this.confirm(this.miniEditor.getText()),
      'core:cancel': () => this.cancel()
    });

    initialPath = atom.project.relativize(initialPath);
    this.miniEditor.setText(initialPath);
    const basename = path.basename(initialPath);
    const extname = path.extname(initialPath);
    this.miniEditor.setSelectedBufferRange([
      [0, initialPath.length - basename.length],
      [0, initialPath.length - extname.length]
    ]);
  }

  serialize() {}

  destroy() {
    this.element.remove();
  }

  getElement() {
    return this.element;
  }

  attach() {
    this.panel = atom.workspace.addModalPanel({item: this});
    this.miniEditor.element.focus();
    this.miniEditor.scrollToCursorPosition();
  }

  close() {
    const panel = this.panel;
    this.panel = null;
    if(panel) { panel.destroy(); }
    this.emitter.dispose();
    this.disposables.dispose();
    this.miniEditor.destroy();
    const activePane = atom.workspace.getCenter().getActivePane();
    if(!activePane.isDestroyed()){ activePane.activate(); }
  }

  confirm(path) {
    this.onConfirm(atom.project.resolvePath(path));
    this.close();
  }

  cancel() { this.close(); }

}
