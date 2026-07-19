import { Extension } from '@tiptap/core';

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    uppercase: {
      setUppercase: () => ReturnType;
    };
  }
}

export const UppercaseExtension = Extension.create({
  name: 'uppercase',

  addCommands() {
    return {
      setUppercase: () => ({ tr, state, dispatch }) => {
        const { selection } = state;
        if (selection.empty) return false;

        const text = state.doc.textBetween(selection.from, selection.to, '');
        if (text) {
          tr.insertText(text.toUpperCase(), selection.from, selection.to);
          if (dispatch) dispatch(tr);
          return true;
        }
        return false;
      },
    };
  },
});
