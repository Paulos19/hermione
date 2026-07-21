"use client"

import { useEffect, useState, useMemo, useRef } from "react"
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

interface TiptapYjsEditorProps {
  documentId: string
  bookId: string
  currentUser: { id: string, name: string | null, email: string }
  wsToken: string
  initialContent?: string
  onEditorReady: (editor: Editor | null) => void
  onWordCountChange?: (count: number) => void
  onSyncStatusChange?: (isSynced: boolean) => void
  onEditorStateChange?: () => void
}

export default function TiptapYjsEditor({ 
  documentId, 
  bookId, 
  currentUser, 
  wsToken, 
  initialContent,
  onEditorReady,
  onWordCountChange,
  onSyncStatusChange,
  onEditorStateChange
}: TiptapYjsEditorProps) {
  const [editor, setEditor] = useState<Editor | null>(null)

  const cursorColor = useMemo(() => {
    const colors = ['#B899FF', '#F98181', '#FBCE41', '#4D96FF', '#68CE86']
    return colors[Math.floor(Math.random() * colors.length)]
  }, [])

  useEffect(() => {
    const doc = new Y.Doc()
    const WS_BASE_URL = process.env.NEXT_PUBLIC_WS_URL || 'wss://services-websckt.khdya3.easypanel.host';
    const WS_URL = `${WS_BASE_URL}/ws/editor`;
    const prov = new WebsocketProvider(WS_URL, documentId, doc, {
      params: { auth: wsToken }
    })

    prov.on('status', (event: { status: string }) => {
      console.log('Status do Yjs Editor Web:', event.status)
      if (onSyncStatusChange) {
        onSyncStatusChange(event.status === 'connected')
      }
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
        Placeholder.configure({ placeholder: 'Start writing your story...' }),
        LineHeight,
        TextIndent,
        FontSize,
        FontFamily,
        UppercaseExtension,
        EmDashExtension
      ],
      editorProps: {
        attributes: {
          class: 'prose prose-invert prose-lg mx-auto max-w-[720px] px-24 pt-20 pb-24 focus:outline-none min-h-[60vh] text-zinc-100 text-[17px] leading-[1.85] font-normal',
          style: '',
          spellcheck: 'true',
          lang: 'pt-BR',
        },
      },
      editable: true,
      onTransaction: () => {
        if (onEditorStateChange) onEditorStateChange();
      },
      onSelectionUpdate: () => {
        if (onEditorStateChange) onEditorStateChange();
      },
      onUpdate: ({ editor }) => {
        const html = editor.getHTML();
        
        // Update Word Count
        if (onWordCountChange) {
          const text = editor.getText()
          const words = text.trim().split(/\s+/).filter(word => word.length > 0).length
          onWordCountChange(words)
        }

        if ((window as any)._saveTimeout) {
          clearTimeout((window as any)._saveTimeout);
        }
        (window as any)._saveTimeout = setTimeout(() => {
          if (onSyncStatusChange) onSyncStatusChange(false) // syncing
          
          const text = editor.getText()
          const words = text.trim().split(/\s+/).filter(word => word.length > 0).length
          
          salvarDocumentoAction(documentId, html, bookId, words)
            .then(() => {
              if (onSyncStatusChange) onSyncStatusChange(true) // synced
            })
            .catch(console.error);
        }, 2000);
      }
    })

    setEditor(instance)
    onEditorReady(instance)
    
    // Initial Word Count
    if (onWordCountChange) {
       const text = instance.getText()
       const words = text.trim().split(/\s+/).filter(word => word.length > 0).length
       onWordCountChange(words)
    }

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
      onEditorReady(null)
    }
  }, [documentId, wsToken, currentUser.id, bookId, initialContent, cursorColor])

  if (!editor) {
    return <div className="p-8 text-gray-500 dark:text-[#8A94A0] flex justify-center w-full">Loading writing environment...</div>
  }

  return (
    <div className="w-full flex justify-center h-fit">
      <div className="w-full max-w-[920px] min-w-[760px] min-h-[1300px] rounded-[18px] border border-gray-200 dark:border-white/5 bg-white dark:bg-[#141A22] shadow-[0_12px_48px_rgba(0,0,0,.25)] shrink-0 overflow-hidden relative transition-colors duration-200">
        <EditorContent editor={editor} />
        
        {/* Typography & Cursors CSS */}
        <style dangerouslySetInnerHTML={{__html: `
          .collaboration-cursor__caret {
            border-left: 2px solid #F5F5F5;
            border-right: 2px solid #F5F5F5;
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

          /* Editor Selection */
          .ProseMirror *::selection {
            background-color: rgba(184,153,255,0.30) !important;
            color: white !important;
          }

          /* Title (if they use h1 as title, but standard h1 below) */
          /* Assuming standard H1 is standard, but the user requested Title spec. Let's make H1 the Title and H2 the normal H1, or just apply H1 spec. */
          
          .ProseMirror h1 {
            font-family: var(--font-cormorant-garamond), serif;
            font-size: 42px;
            line-height: 1.15;
            font-weight: 600;
            letter-spacing: -0.02em;
            margin-top: 0;
            margin-bottom: 56px;
            color: #111827;
          }
          
          .dark .ProseMirror h1 {
            color: white;
          }

          .ProseMirror h2 {
            font-size: 34px;
            font-weight: 600;
            margin-top: 64px;
            margin-bottom: 28px;
          }

          .ProseMirror h3 {
            font-size: 28px;
            font-weight: 600;
            margin-top: 56px;
            margin-bottom: 24px;
          }
          
          .ProseMirror h4 {
            font-size: 22px;
            font-weight: 600;
            margin-top: 48px;
            margin-bottom: 20px;
          }

          .ProseMirror p {
            margin-bottom: 20px;
          }

          .ProseMirror ul, .ProseMirror ol {
            margin-top: 20px;
            margin-bottom: 20px;
            padding-left: 32px;
            display: flex;
            flex-direction: column;
            gap: 10px;
          }

          .ProseMirror blockquote {
            padding-left: 24px;
            border-left: 3px solid #B899FF;
            margin: 32px 0;
            color: #4B5563;
            font-style: italic;
          }
          
          .dark .ProseMirror blockquote {
            color: #C8CBD2;
          }

          .ProseMirror img {
            max-width: 100%;
            border-radius: 12px;
            margin: 40px auto;
            display: block;
          }

          .ProseMirror table {
            margin: 32px 0;
            border-collapse: collapse;
          }

          .ProseMirror th, .ProseMirror td {
            padding: 14px;
            border: 1px solid rgba(0,0,0,0.1);
          }
          
          .dark .ProseMirror th, .dark .ProseMirror td {
            border: 1px solid rgba(255,255,255,0.08);
          }

          .ProseMirror pre {
            background-color: #F3F4F6;
            padding: 24px;
            border-radius: 12px;
            margin: 32px 0;
            font-family: var(--font-geist-mono), monospace;
          }
          
          .dark .ProseMirror pre {
            background-color: #10151B;
          }

          /* Hide scrollbar in EditorContent if any, let workspace scroll */
          .ProseMirror {
             caret-color: #111827;
             color: #111827;
             outline: none;
          }
          
          .dark .ProseMirror {
             caret-color: #F5F5F5;
             color: #F5F5F5;
          }
        `}} />
      </div>
    </div>
  )
}
