"use client"

import { useEffect, useState, useMemo } from "react"
import { Editor, EditorContent } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import Collaboration from "@tiptap/extension-collaboration"
import CollaborationCaret from "@tiptap/extension-collaboration-caret"
import * as Y from "yjs"
import { WebsocketProvider } from "y-websocket"
import { salvarDocumentoAction } from "@/app/actions/document"

// Standard Extensions
import TextAlign from '@tiptap/extension-text-align'
import Placeholder from '@tiptap/extension-placeholder'
import Image from '@tiptap/extension-image'
import Link from '@tiptap/extension-link'
import Color from '@tiptap/extension-color'
import { TextStyle } from '@tiptap/extension-text-style'
import Highlight from '@tiptap/extension-highlight'
import Underline from '@tiptap/extension-underline'
import FontFamily from '@tiptap/extension-font-family'

// Custom Extensions
import { LineHeight } from './extensions/LineHeight'
import { TextIndent } from './extensions/TextIndent'
import { FontSize } from './extensions/FontSize'
import { UppercaseExtension } from './extensions/Uppercase'
import { EmDashExtension } from './extensions/EmDash'

import EditorToolbar from './EditorToolbar'

interface TiptapYjsEditorProps {
  documentId: string
  bookId: string
  currentUser: { id: string, name: string | null, email: string }
  wsToken: string
  initialContent?: string
}

export default function TiptapYjsEditor({ documentId, bookId, currentUser, wsToken, initialContent }: TiptapYjsEditorProps) {
  const [editor, setEditor] = useState<Editor | null>(null)

  const cursorColor = useMemo(() => {
    const colors = ['#958DF1', '#F98181', '#FBCE41', '#4D96FF', '#68CE86']
    return colors[Math.floor(Math.random() * colors.length)]
  }, [])

  useEffect(() => {
    const doc = new Y.Doc()
    const WS_URL = 'wss://services-websckt.khdya3.easypanel.host/ws/editor'
    const prov = new WebsocketProvider(WS_URL, documentId, doc, {
      params: { auth: wsToken }
    })

    prov.on('status', (event: { status: string }) => {
      console.log('Status do Yjs Editor Web:', event.status)
    })

    const instance = new Editor({
      extensions: [
        StarterKit.configure({
          undoRedo: false,
        }),
        Collaboration.configure({
          document: doc,
        }),
        CollaborationCaret.configure({
          provider: prov,
          user: {
            name: currentUser.name || currentUser.email.split('@')[0],
            color: cursorColor,
          },
        }),
        Underline,
        TextStyle,
        Color,
        Highlight.configure({ multicolor: true }),
        Image,
        Link.configure({ openOnClick: false }),
        TextAlign.configure({ types: ['heading', 'paragraph'], alignments: ['left', 'center', 'right', 'justify'] }),
        Placeholder.configure({ placeholder: 'Escreva a sua história...' }),
        LineHeight,
        TextIndent,
        FontSize,
        FontFamily,
        UppercaseExtension,
        EmDashExtension
      ],
      editorProps: {
        attributes: {
          class: 'prose prose-invert prose-lg max-w-none focus:outline-none min-h-[60vh] text-zinc-300 mx-auto mt-8 px-8',
        },
      },
      editable: true,
      onUpdate: ({ editor }) => {
        const html = editor.getHTML();
        if ((window as any)._saveTimeout) {
          clearTimeout((window as any)._saveTimeout);
        }
        (window as any)._saveTimeout = setTimeout(() => {
          salvarDocumentoAction(documentId, html, bookId).catch(console.error);
        }, 2000);
      }
    })

    setEditor(instance)

    const handleSync = (isSynced: boolean) => {
      if (isSynced && instance.isEmpty && initialContent) {
        instance.commands.setContent(initialContent);
      }
    };
    prov.on('sync', handleSync);
    
    if (prov.synced && instance.isEmpty && initialContent) {
      instance.commands.setContent(initialContent);
    }

    return () => {
      prov.off('sync', handleSync);
      instance.destroy()
      prov.destroy()
      doc.destroy()
      setEditor(null)
    }
  }, [documentId, wsToken, currentUser.id, bookId, initialContent, cursorColor])

  if (!editor) {
    return <div className="p-8 text-zinc-500">Iniciando editor...</div>
  }

  return (
    <div className="w-full h-full flex flex-col items-center py-8">
      <div className="max-w-3xl w-full bg-[#0F1419]/50 shadow-2xl rounded-2xl border border-zinc-800/60 overflow-hidden min-h-[80vh]">
        
        {/* Toolbar */}
        <EditorToolbar editor={editor} />

        {/* Editor Wrapper */}
        <EditorContent editor={editor} className="p-4" />
        
        {/* Inject CSS for cursors since CollaborationCursor requires some base styles */}
        <style dangerouslySetInnerHTML={{__html: `
          .collaboration-cursor__caret {
            border-left: 2px solid #0D0D0D;
            border-right: 2px solid #0D0D0D;
            margin-left: -2px;
            margin-right: -2px;
            pointer-events: none;
            position: relative;
            word-break: normal;
          }
          
          .collaboration-cursor__label {
            border-radius: 4px 4px 4px 0;
            color: #FFF;
            font-size: 12px;
            font-weight: 600;
            left: -2px;
            line-height: normal;
            padding: 2px 6px;
            position: absolute;
            top: -1.8em;
            user-select: none;
            white-space: nowrap;
          }
        `}} />
      </div>
    </div>
  )
}
