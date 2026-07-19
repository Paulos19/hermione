"use client"

import { useEffect, useState } from "react"
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
  currentUser: { id: string, name: string | null, email: string }
  wsToken: string
}

export default function TiptapYjsEditor({ documentId, currentUser, wsToken }: TiptapYjsEditorProps) {
  const [provider, setProvider] = useState<WebsocketProvider | null>(null)
  
  // Random color for cursor
  const colors = ['#958DF1', '#F98181', '#FBCE41', '#4D96FF', '#68CE86']
  const cursorColor = colors[Math.floor(Math.random() * colors.length)]

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        undoRedo: false, // Desabilitar histórico do StarterKit para o Yjs gerenciar
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
    content: '',
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
        salvarDocumentoAction(documentId, html).catch(console.error);
      }, 2000);
    }
  })

  useEffect(() => {
    if (!editor || !documentId) return

    // 1. Instanciar documento Yjs
    const ydoc = new Y.Doc()

    // 2. Conectar ao servidor WebSocket
    const WS_URL = 'wss://services-websckt.khdya3.easypanel.host/ws/editor'
    
    // O y-websocket permite passar parâmetros na URL (aqui passamos o token)
    const wsProvider = new WebsocketProvider(WS_URL, documentId, ydoc, {
      params: { auth: wsToken }
    })
    
    setProvider(wsProvider)

    // 3. Adicionar as extensões dinamicamente
    editor.extensionManager.extensions.push(
      Collaboration.configure({
        document: ydoc,
      })
    )
    
    editor.extensionManager.extensions.push(
      CollaborationCursor.configure({
        provider: wsProvider,
        user: {
          name: currentUser.name || currentUser.email.split('@')[0],
          color: cursorColor,
        },
      })
    )

    // Precisamos forçar uma recriação das views internas do tiptap ao injetar as extensões colaborativas
    editor.view.updateState(editor.state)

    wsProvider.on('status', (event: { status: string }) => {
      console.log('Status do Yjs Editor Web:', event.status) // 'connected' ou 'disconnected'
    })

    return () => {
      wsProvider.destroy()
      ydoc.destroy()
    }
  }, [editor, documentId, wsToken, currentUser])

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
