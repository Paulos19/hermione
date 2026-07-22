import { Extension } from '@tiptap/core'
import { Plugin, PluginKey } from '@tiptap/pm/state'
import { Decoration, DecorationSet } from '@tiptap/pm/view'

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    searchHighlight: {
      setSearchHighlight: (query: string | null) => ReturnType
    }
  }
}

export const SearchHighlight = Extension.create({
  name: 'searchHighlight',

  addStorage() {
    return {
      searchQuery: null as string | null,
    }
  },

  addCommands() {
    return {
      setSearchHighlight: (query: string | null) => ({ tr, dispatch }) => {
        this.storage.searchQuery = query
        if (dispatch) {
          tr.setMeta('searchHighlight', true)
        }
        return true
      },
    }
  },

  addProseMirrorPlugins() {
    const pluginKey = new PluginKey('searchHighlight')

    return [
      new Plugin({
        key: pluginKey,
        state: {
          init: () => DecorationSet.empty,
          apply: (tr, oldState) => {
            // Ensure decorations are re-calculated when query changes or doc changes
            const query = this.storage.searchQuery
            if (!query) return DecorationSet.empty

            const decorations: Decoration[] = []
            tr.doc.descendants((node, pos) => {
              if (node.isText && node.text) {
                const text = node.text.toLowerCase()
                const q = query.toLowerCase()
                let index = text.indexOf(q)
                while (index !== -1) {
                  decorations.push(
                    Decoration.inline(pos + index, pos + index + q.length, {
                      class: 'search-highlight',
                      style: 'background-color: rgba(234, 179, 8, 0.4); color: inherit; border-radius: 4px; padding: 2px 0;'
                    })
                  )
                  index = text.indexOf(q, index + q.length)
                }
              }
            })

            return DecorationSet.create(tr.doc, decorations)
          },
        },
        props: {
          decorations(state) {
            return pluginKey.getState(state)
          },
        },
      }),
    ]
  },
})
