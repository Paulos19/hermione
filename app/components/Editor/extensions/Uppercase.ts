import { Extension } from '@tiptap/core';

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    changeCase: {
      setUppercase: () => ReturnType;
      setLowercase: () => ReturnType;
      setCapitalize: () => ReturnType;
    };
  }
}

export const UppercaseExtension = Extension.create({
  name: 'changeCase',

  addCommands() {
    return {
      setUppercase: () => ({ tr, state, dispatch }) => {
        const { selection } = state;
        if (selection.empty) return false;

        const changes: {start: number, end: number, text: string}[] = [];
        state.doc.nodesBetween(selection.from, selection.to, (node, pos) => {
          if (node.isText && node.text) {
            const start = Math.max(pos, selection.from);
            const end = Math.min(pos + node.nodeSize, selection.to);
            const textToReplace = node.text.substring(start - pos, end - pos);
            changes.push({ start, end, text: textToReplace.toUpperCase() });
          }
        });
        
        if (changes.length > 0) {
          for (let i = changes.length - 1; i >= 0; i--) {
            tr.insertText(changes[i].text, changes[i].start, changes[i].end);
          }
          if (dispatch) dispatch(tr);
          return true;
        }
        return false;
      },
      setLowercase: () => ({ tr, state, dispatch }) => {
        const { selection } = state;
        if (selection.empty) return false;

        const changes: {start: number, end: number, text: string}[] = [];
        state.doc.nodesBetween(selection.from, selection.to, (node, pos) => {
          if (node.isText && node.text) {
            const start = Math.max(pos, selection.from);
            const end = Math.min(pos + node.nodeSize, selection.to);
            const textToReplace = node.text.substring(start - pos, end - pos);
            changes.push({ start, end, text: textToReplace.toLowerCase() });
          }
        });
        
        if (changes.length > 0) {
          for (let i = changes.length - 1; i >= 0; i--) {
            tr.insertText(changes[i].text, changes[i].start, changes[i].end);
          }
          if (dispatch) dispatch(tr);
          return true;
        }
        return false;
      },
      setCapitalize: () => ({ tr, state, dispatch }) => {
        const { selection } = state;
        if (selection.empty) return false;

        const changes: {start: number, end: number, text: string}[] = [];
        state.doc.nodesBetween(selection.from, selection.to, (node, pos) => {
          if (node.isText && node.text) {
            const start = Math.max(pos, selection.from);
            const end = Math.min(pos + node.nodeSize, selection.to);
            const textToReplace = node.text.substring(start - pos, end - pos);
            const capitalized = textToReplace.replace(/\b\w/g, c => c.toUpperCase());
            changes.push({ start, end, text: capitalized });
          }
        });
        
        if (changes.length > 0) {
          for (let i = changes.length - 1; i >= 0; i--) {
            tr.insertText(changes[i].text, changes[i].start, changes[i].end);
          }
          if (dispatch) dispatch(tr);
          return true;
        }
        return false;
      },
    };
  },
});
