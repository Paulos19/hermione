import { Editor } from '@tiptap/react'
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Indent,
  Outdent,
  CaseUpper,
  Highlighter,
  Link,
  Image as ImageIcon
} from 'lucide-react'

export default function EditorToolbar({ editor }: { editor: Editor | null }) {
  if (!editor) {
    return null
  }

  const toggleBold = () => editor.chain().focus().toggleBold().run()
  const toggleItalic = () => editor.chain().focus().toggleItalic().run()
  const toggleUnderline = () => editor.chain().focus().toggleUnderline().run()
  const toggleStrike = () => editor.chain().focus().toggleStrike().run()
  
  const setAlign = (align: string) => editor.chain().focus().setTextAlign(align).run()
  
  const toggleH1 = () => editor.chain().focus().toggleHeading({ level: 1 }).run()
  const toggleH2 = () => editor.chain().focus().toggleHeading({ level: 2 }).run()
  const toggleH3 = () => editor.chain().focus().toggleHeading({ level: 3 }).run()
  
  const toggleBulletList = () => editor.chain().focus().toggleBulletList().run()
  const toggleOrderedList = () => editor.chain().focus().toggleOrderedList().run()
  const toggleBlockquote = () => editor.chain().focus().toggleBlockquote().run()
  
  const indent = () => editor.chain().focus().indent().run()
  const outdent = () => editor.chain().focus().outdent().run()
  const setUppercase = () => editor.chain().focus().setUppercase().run()
  const toggleHighlight = () => editor.chain().focus().toggleHighlight().run()
  
  const setLineHeight = (e: React.ChangeEvent<HTMLSelectElement>) => {
    editor.chain().focus().setLineHeight(e.target.value).run()
  }

  const setFontSize = (e: React.ChangeEvent<HTMLSelectElement>) => {
    editor.chain().focus().setFontSize(e.target.value).run()
  }

  const activeClass = "bg-indigo-500/20 text-indigo-400 border border-indigo-500/50"
  const inactiveClass = "text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200 border border-transparent"
  const btnBase = "p-2 rounded-lg text-sm transition-all duration-200 flex items-center justify-center cursor-pointer"

  return (
    <div className="border-b border-zinc-800/60 p-2 flex flex-wrap items-center gap-1 bg-[#0B0F12]/90 sticky top-0 z-10 backdrop-blur shadow-md shadow-black/20">
      
      {/* Estilos Básicos */}
      <div className="flex items-center gap-1 bg-zinc-900/50 p-1 rounded-xl border border-zinc-800/50">
        <button onClick={toggleBold} className={`${btnBase} ${editor.isActive('bold') ? activeClass : inactiveClass}`} title="Negrito">
          <Bold className="w-4 h-4" />
        </button>
        <button onClick={toggleItalic} className={`${btnBase} ${editor.isActive('italic') ? activeClass : inactiveClass}`} title="Itálico">
          <Italic className="w-4 h-4" />
        </button>
        <button onClick={toggleUnderline} className={`${btnBase} ${editor.isActive('underline') ? activeClass : inactiveClass}`} title="Sublinhado">
          <Underline className="w-4 h-4" />
        </button>
        <button onClick={toggleStrike} className={`${btnBase} ${editor.isActive('strike') ? activeClass : inactiveClass}`} title="Tachado">
          <Strikethrough className="w-4 h-4" />
        </button>
        <button onClick={toggleHighlight} className={`${btnBase} ${editor.isActive('highlight') ? activeClass : inactiveClass}`} title="Destacar">
          <Highlighter className="w-4 h-4" />
        </button>
        <button onClick={setUppercase} className={`${btnBase} ${inactiveClass}`} title="Maiúsculas">
          <CaseUpper className="w-4 h-4" />
        </button>
      </div>

      <div className="w-px h-6 bg-zinc-800 mx-1" />

      {/* Headings */}
      <div className="flex items-center gap-1 bg-zinc-900/50 p-1 rounded-xl border border-zinc-800/50">
        <button onClick={toggleH1} className={`${btnBase} ${editor.isActive('heading', { level: 1 }) ? activeClass : inactiveClass}`} title="Título 1">
          <Heading1 className="w-4 h-4" />
        </button>
        <button onClick={toggleH2} className={`${btnBase} ${editor.isActive('heading', { level: 2 }) ? activeClass : inactiveClass}`} title="Título 2">
          <Heading2 className="w-4 h-4" />
        </button>
        <button onClick={toggleH3} className={`${btnBase} ${editor.isActive('heading', { level: 3 }) ? activeClass : inactiveClass}`} title="Título 3">
          <Heading3 className="w-4 h-4" />
        </button>
      </div>

      <div className="w-px h-6 bg-zinc-800 mx-1" />

      {/* Alinhamento */}
      <div className="flex items-center gap-1 bg-zinc-900/50 p-1 rounded-xl border border-zinc-800/50">
        <button onClick={() => setAlign('left')} className={`${btnBase} ${editor.isActive({ textAlign: 'left' }) ? activeClass : inactiveClass}`} title="Alinhar à Esquerda">
          <AlignLeft className="w-4 h-4" />
        </button>
        <button onClick={() => setAlign('center')} className={`${btnBase} ${editor.isActive({ textAlign: 'center' }) ? activeClass : inactiveClass}`} title="Centralizar">
          <AlignCenter className="w-4 h-4" />
        </button>
        <button onClick={() => setAlign('right')} className={`${btnBase} ${editor.isActive({ textAlign: 'right' }) ? activeClass : inactiveClass}`} title="Alinhar à Direita">
          <AlignRight className="w-4 h-4" />
        </button>
        <button onClick={() => setAlign('justify')} className={`${btnBase} ${editor.isActive({ textAlign: 'justify' }) ? activeClass : inactiveClass}`} title="Justificar">
          <AlignJustify className="w-4 h-4" />
        </button>
      </div>

      <div className="w-px h-6 bg-zinc-800 mx-1" />

      {/* Listas e Recuo */}
      <div className="flex items-center gap-1 bg-zinc-900/50 p-1 rounded-xl border border-zinc-800/50">
        <button onClick={toggleBulletList} className={`${btnBase} ${editor.isActive('bulletList') ? activeClass : inactiveClass}`} title="Lista">
          <List className="w-4 h-4" />
        </button>
        <button onClick={toggleOrderedList} className={`${btnBase} ${editor.isActive('orderedList') ? activeClass : inactiveClass}`} title="Lista Numérica">
          <ListOrdered className="w-4 h-4" />
        </button>
        <button onClick={toggleBlockquote} className={`${btnBase} ${editor.isActive('blockquote') ? activeClass : inactiveClass}`} title="Citação">
          <Quote className="w-4 h-4" />
        </button>
        <button onClick={indent} className={`${btnBase} ${inactiveClass}`} title="Aumentar Recuo">
          <Indent className="w-4 h-4" />
        </button>
        <button onClick={outdent} className={`${btnBase} ${inactiveClass}`} title="Diminuir Recuo">
          <Outdent className="w-4 h-4" />
        </button>
      </div>

      <div className="w-px h-6 bg-zinc-800 mx-1" />

      {/* Selects: Fonte e Espaçamento */}
      <div className="flex items-center gap-2">
        <select 
          onChange={setFontSize} 
          className="bg-zinc-900 border border-zinc-700 text-zinc-300 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block p-1.5 outline-none cursor-pointer"
          title="Tamanho da Fonte"
        >
          <option value="">Tamanho</option>
          <option value="12px">12px</option>
          <option value="14px">14px</option>
          <option value="16px">16px</option>
          <option value="18px">18px</option>
          <option value="20px">20px</option>
          <option value="24px">24px</option>
        </select>

        <select 
          onChange={setLineHeight} 
          className="bg-zinc-900 border border-zinc-700 text-zinc-300 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block p-1.5 outline-none cursor-pointer"
          title="Espaçamento entre Linhas"
        >
          <option value="">Espaçamento</option>
          <option value="1.0">1.0</option>
          <option value="1.5">1.5</option>
          <option value="2.0">2.0</option>
        </select>
      </div>
    </div>
  )
}
