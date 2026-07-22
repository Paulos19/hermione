import { Editor } from '@tiptap/react';
import { BubbleMenu } from '@tiptap/react/menus';
import { 
  ArrowUpToLine, 
  ArrowDownToLine, 
  ArrowLeftToLine, 
  ArrowRightToLine, 
  Trash2, 
  Combine, 
  SplitSquareHorizontal, 
  TableProperties,
  Trash
} from 'lucide-react';

interface TableBubbleMenuProps {
  editor: Editor;
}

export const TableBubbleMenu = ({ editor }: TableBubbleMenuProps) => {
  if (!editor) return null;

  const btnBase = "p-1.5 rounded hover:bg-[var(--theme-bg-surface-elevated)] text-[var(--theme-text-muted)] hover:text-[var(--theme-text-main)] transition-colors flex items-center justify-center";

  return (
    <BubbleMenu 
      editor={editor} 
      tippyOptions={{ duration: 150, placement: 'top' }}
      shouldShow={({ editor }) => editor.isActive('table')}
      className="flex items-center gap-1 bg-[var(--theme-bg-surface)] p-1 rounded-lg border border-[var(--theme-border)] shadow-xl overflow-hidden z-50"
    >
      <button 
        onMouseDown={(e) => e.preventDefault()} 
        onClick={() => editor.chain().focus().addColumnBefore().run()} 
        className={btnBase} 
        title="Adicionar Coluna Antes"
      >
        <ArrowLeftToLine className="w-4 h-4" />
      </button>
      <button 
        onMouseDown={(e) => e.preventDefault()} 
        onClick={() => editor.chain().focus().addColumnAfter().run()} 
        className={btnBase} 
        title="Adicionar Coluna Depois"
      >
        <ArrowRightToLine className="w-4 h-4" />
      </button>
      <button 
        onMouseDown={(e) => e.preventDefault()} 
        onClick={() => editor.chain().focus().deleteColumn().run()} 
        className={btnBase + " text-red-400 hover:text-red-500 hover:bg-red-500/10"} 
        title="Excluir Coluna"
      >
        <Trash className="w-4 h-4" />
      </button>

      <div className="w-[1px] h-6 bg-[var(--theme-border)] mx-1" />

      <button 
        onMouseDown={(e) => e.preventDefault()} 
        onClick={() => editor.chain().focus().addRowBefore().run()} 
        className={btnBase} 
        title="Adicionar Linha Antes"
      >
        <ArrowUpToLine className="w-4 h-4" />
      </button>
      <button 
        onMouseDown={(e) => e.preventDefault()} 
        onClick={() => editor.chain().focus().addRowAfter().run()} 
        className={btnBase} 
        title="Adicionar Linha Depois"
      >
        <ArrowDownToLine className="w-4 h-4" />
      </button>
      <button 
        onMouseDown={(e) => e.preventDefault()} 
        onClick={() => editor.chain().focus().deleteRow().run()} 
        className={btnBase + " text-red-400 hover:text-red-500 hover:bg-red-500/10"} 
        title="Excluir Linha"
      >
        <Trash className="w-4 h-4" />
      </button>

      <div className="w-[1px] h-6 bg-[var(--theme-border)] mx-1" />

      <button 
        onMouseDown={(e) => e.preventDefault()} 
        onClick={() => editor.chain().focus().mergeCells().run()} 
        className={btnBase} 
        title="Mesclar Células"
      >
        <Combine className="w-4 h-4" />
      </button>
      <button 
        onMouseDown={(e) => e.preventDefault()} 
        onClick={() => editor.chain().focus().splitCell().run()} 
        className={btnBase} 
        title="Dividir Célula"
      >
        <SplitSquareHorizontal className="w-4 h-4" />
      </button>

      <div className="w-[1px] h-6 bg-[var(--theme-border)] mx-1" />

      <button 
        onMouseDown={(e) => e.preventDefault()} 
        onClick={() => editor.chain().focus().toggleHeaderRow().run()} 
        className={btnBase} 
        title="Alternar Cabeçalho"
      >
        <TableProperties className="w-4 h-4" />
      </button>

      <button 
        onMouseDown={(e) => e.preventDefault()} 
        onClick={() => editor.chain().focus().deleteTable().run()} 
        className={btnBase + " text-red-500 hover:text-red-600 hover:bg-red-500/20 ml-1"} 
        title="Excluir Tabela"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </BubbleMenu>
  );
};
