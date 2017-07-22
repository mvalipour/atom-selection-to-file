'use babel';

import Module from '../lib/selection-to-file';

// Use the command `window:run-package-specs` (cmd-alt-ctrl-p) to run specs.
//
// To run a specific `it` or `describe` block add an `f` to the front (e.g. `fit`
// or `fdescribe`). Remove the `f` to unfocus the block.

describe('SelectionToFile', () => {
  let editor, editorView, activationPromise;

  function fileIsOpen(filename) {
    waitsForPromise(() => atom.workspace.open(filename));
    runs(() => {
      editor = atom.workspace.getActiveTextEditor();
      editorView = atom.views.getView(editor);
      activationPromise = atom.packages.activatePackage('selection-to-file');
    });
  }

  function waitForCommandCompletion() {
    const mainModule = atom.packages.getActivePackage('selection-to-file').mainModule;
    return new Promise((resolve) => {
      const timer = setInterval(() => {
        if (mainModule.state === 'completed') {
          resolve();
          clearInterval(timer);
        }
      }, 10);
    });
  }

  function commandIsSentAndCompleted(command) {
    atom.commands.dispatch(editorView, `selection-to-file:${command}`);
    waitsForPromise(() => activationPromise);
    waitsForPromise(waitForCommandCompletion)
  }

  describe(':create command', () => {
    describe('when a ruby file is open', () => {
      beforeEach(() => fileIsOpen('test_file.rb'));

      describe('when no text is selected and cursor is not on a word either', () => {
        it('does not open new editor', () => {
          editor.insertText("class Test\r  SomeOtherClass\rend");
          editor.setCursorBufferPosition([1, 1]);
          commandIsSentAndCompleted('create');
          runs(() => {
            expect(atom.workspace.getTextEditors().length).toEqual(1);
          });
        });
      });

      describe('when no text is selected and cursor is on a word', () => {
        it('does not open new editor', () => {
          editor.insertText("class Test\r  SomeOtherClass\rend");
          editor.setCursorBufferPosition([1, 4]);
          commandIsSentAndCompleted('create');
          runs(() => {
            expect(atom.workspace.getTextEditors().length).toEqual(2);

            const newEditor = atom.workspace.getTextEditors()[1];
            expect(newEditor.getPath().endsWith('/some_other_class.rb'))
              .toBe(true);

            expect(newEditor.getText()).toEqual("# SomeOtherClass");
          });
        });
      });

      describe('when there is a text selected', () => {
        it('creates a new editor with file name from selection and selected text as commented content', () => {
          editor.insertText("class Test\r  SomeOtherClass\rend");
          editor.setSelectedBufferRange([[1, 2], [1, 16]]);
          commandIsSentAndCompleted('create');
          runs(() => {
            expect(atom.workspace.getTextEditors().length).toEqual(2);

            const newEditor = atom.workspace.getTextEditors()[1];
            expect(newEditor.getPath().endsWith('/some_other_class.rb'))
              .toBe(true);

            expect(newEditor.getText()).toEqual("# SomeOtherClass");
          });
        });
      });

      describe('when there is a text selected with module', () => {
        it('creates a new editor with dir and file name from selection and selected text as commented content', () => {
          editor.insertText("class Test\r  Some::Other::Class\rend");
          editor.setSelectedBufferRange([[1, 2], [1, 20]]);
          commandIsSentAndCompleted('create');
          runs(() => {
            expect(atom.workspace.getTextEditors().length).toEqual(2);

            const newEditor = atom.workspace.getTextEditors()[1];
            expect(newEditor.getPath().endsWith('/some/other/class.rb'))
              .toBe(true);

            expect(newEditor.getText()).toEqual("# Some::Other::Class");
          });
        });
      });
    });

    describe('when a js file is open', () => {
      beforeEach(() => fileIsOpen('testFile.js'));

      describe('when there is a text selected', () => {
        it('creates a new editor with file name from selection and selected text as commented content', () => {
          editor.insertText("function\r  SomeOtherClass()\r{}");
          editor.setSelectedBufferRange([[1, 2], [1, 16]]);
          commandIsSentAndCompleted('create');
          runs(() => {
            expect(atom.workspace.getTextEditors().length).toEqual(2);

            const newEditor = atom.workspace.getTextEditors()[1];
            expect(newEditor.getPath().endsWith('/some-other-class.js'))
              .toBe(true);

            expect(newEditor.getText()).toEqual("// SomeOtherClass");
          });
        });
      });

      describe('when there is a text selected with namespace', () => {
        it('creates a new editor with dir and file name from selection and selected text as commented content', () => {
          editor.insertText("const x = new some.other.Class()");
          editor.setSelectedBufferRange([[0, 14], [0, 30]]);
          commandIsSentAndCompleted('create');
          runs(() => {
            expect(atom.workspace.getTextEditors().length).toEqual(2);

            const newEditor = atom.workspace.getTextEditors()[1];
            expect(newEditor.getPath().endsWith('/some/other/class.js'))
              .toBe(true);

            expect(newEditor.getText()).toEqual("// some.other.Class");
          });
        });
      });
    });

    describe('when a cs file is open', () => {
      beforeEach(() => fileIsOpen('TestFile.cs'));

      describe('when there is a text selected', () => {
        it('creates a new editor with file name from selection and selected text as commented content', () => {
          editor.insertText("// TODO: some other class to add");
          editor.setSelectedBufferRange([[0, 9], [0, 25]]);
          commandIsSentAndCompleted('create');
          runs(() => {
            expect(atom.workspace.getTextEditors().length).toEqual(2);

            const newEditor = atom.workspace.getTextEditors()[1];
            expect(newEditor.getPath().endsWith('/SomeOtherClass.cs'))
              .toBe(true);

            expect(newEditor.getText()).toEqual("// some other class");
          });
        });
      });

      describe('when there is a text selected with namespace', () => {
        it('creates a new editor with dir and file name from selection and selected text as commented content', () => {
          editor.insertText("const x = new Some.Other.Class()");
          editor.setSelectedBufferRange([[0, 14], [0, 30]]);
          commandIsSentAndCompleted('create');
          runs(() => {
            expect(atom.workspace.getTextEditors().length).toEqual(2);

            const newEditor = atom.workspace.getTextEditors()[1];
            expect(newEditor.getPath().endsWith('/Some/Other/Class.cs'))
              .toBe(true);

            expect(newEditor.getText()).toEqual("// Some.Other.Class");
          });
        });
      });
    });

    describe('when a file with no extension is open', () => {
      beforeEach(() => fileIsOpen('some-file'));

      describe('when there is a text selected', () => {
        it('creates a new editor with file name from selection and selected text as commented content', () => {
          editor.insertText("This is some file with no extension");
          editor.setSelectedBufferRange([[0, 8], [0, 17]]);
          commandIsSentAndCompleted('create');
          runs(() => {
            expect(atom.workspace.getTextEditors().length).toEqual(2);

            const newEditor = atom.workspace.getTextEditors()[1];
            expect(newEditor.getPath().endsWith('/some-file'))
              .toBe(true);

            expect(newEditor.getText()).toEqual("some file");
          });
        });
      });
    });
  });
});
