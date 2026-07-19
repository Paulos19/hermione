import { Extension } from '@tiptap/core';

export interface TextIndentOptions {
  types: string[];
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    textIndent: {
      indent: () => ReturnType;
      outdent: () => ReturnType;
    };
  }
}

export const TextIndent = Extension.create<TextIndentOptions>({
  name: 'textIndent',

  addOptions() {
    return {
      types: ['paragraph', 'heading'],
    };
  },

  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          textIndent: {
            default: null,
            keepOnSplit: true,
            parseHTML: element => element.style.textIndent || null,
            renderHTML: attributes => {
              if (!attributes.textIndent) return {};
              return { style: `text-indent: ${attributes.textIndent}` };
            },
          },
        },
      },
    ];
  },

  addCommands() {
    return {
      indent: () => ({ tr, state, dispatch }) => {
        const { selection } = state;
        tr.doc.nodesBetween(selection.from, selection.to, (node, pos) => {
          if (this.options.types.includes(node.type.name)) {
            let currentIndent = parseInt(node.attrs.textIndent || '0', 10);
            let newIndent = currentIndent + 20;
            tr.setNodeMarkup(pos, undefined, { ...node.attrs, textIndent: `${newIndent}px` });
          }
        });
        if (dispatch) dispatch(tr);
        return true;
      },
      outdent: () => ({ tr, state, dispatch }) => {
        const { selection } = state;
        tr.doc.nodesBetween(selection.from, selection.to, (node, pos) => {
          if (this.options.types.includes(node.type.name)) {
            let currentIndent = parseInt(node.attrs.textIndent || '0', 10);
            let newIndent = Math.max(currentIndent - 20, 0);
            tr.setNodeMarkup(pos, undefined, {
              ...node.attrs,
              textIndent: newIndent === 0 ? null : `${newIndent}px`,
            });
          }
        });
        if (dispatch) dispatch(tr);
        return true;
      },
    };
  },
});
