import { Extension, textInputRule } from '@tiptap/core';

export const EmDashExtension = Extension.create({
  name: 'emDash',

  addInputRules() {
    return [
      textInputRule({
        find: /--$/,
        replace: '—',
      }),
    ];
  },
});
