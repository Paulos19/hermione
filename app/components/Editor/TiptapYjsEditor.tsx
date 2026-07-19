"use client"

import { useEffect, useState, useMemo } from "react"
import { useEditor, EditorContent } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import Collaboration from "@tiptap/extension-collaboration"
import CollaborationCursor from "@tiptap/extension-collaboration-cursor"
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
  const cursorColor = useMemo(() => {
    const colors = ['#958DF1', '#F98181', '#FBCE41', '#4D96FF', '#68CE86']
    return colors[Math.floor(Math.random() * colors.length)]
  }, [])

  const { ydoc, wsProvider } = useMemo(() => {
    const doc = new Y.Doc()
    const WS_URL = 'wss://services-websckt.khdya3.easypanel.host/ws/editor'
    const prov = new WebsocketProvider(WS_URL, documentId, doc, {
      params: { auth: wsToken }
    })
    return { ydoc: doc, wsProvider: prov }
  }, [documentId, wsToken])

  useEffect(() => {
    wsProvider.on('status', (event: { status: string }) => {
      console.log('Status do Yjs Editor Web:', event.status)
    })
    return () => {
      wsProvider.destroy()
      ydoc.destroy()
    }
  }, [wsProvider, ydoc])

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        undoRedo: false, // Desabilitar histórico do StarterKit para o Yjs gerenciar
      }),
      Collaboration.configure({
        document: ydoc,
      }),
      CollaborationCursor.configure({
        provider: wsProvider,
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
    // "content" must not be set here when using Collaboration extension, 
    // it will cause "Cannot read properties of undefined (reading 'doc')"
    editorProps: {
      attributes: {
        class: 'prose prose-invert prose-lg max-w-none focus:outline-none min-h-[60vh] text-zinc-300 mx-auto mt-8 px-8',
      },
    },
    editable: true,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      // Debounce the save directly using setTimeout
      if ((window as any)._saveTimeout) {
        clearTimeout((window as any)._saveTimeout);
      }
      (window as any)._saveTimeout = setTimeout(() => {
        salvarDocumentoAction(documentId, html, bookId).catch(console.error);
      }, 2000);
    }
  })

  // Load initial content if the server document is empty
  useEffect(() => {
    if (!editor || !wsProvider) return;

    const handleSync = (isSynced: boolean) => {
      if (isSynced) {
        // If document is completely empty after syncing, it means the server 
        // doesn't have it (e.g. server restarted or new document)
        // We inject the DB content manually.
        if (editor.isEmpty && initialContent) {
          editor.commands.setContent(initialContent);
        }
      }
    };

    wsProvider.on('sync', handleSync);
    
    // Check if it's already synced
    if (wsProvider.synced && editor.isEmpty && initialContent) {
      editor.commands.setContent(initialContent);
    }

    return () => {
      wsProvider.off('sync', handleSync);
    }
  }, [editor, wsProvider, initialContent]);

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
