"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import { useEffect, useState } from "react";
import { Bold, Italic, Heading2, CheckCircle2, Loader2 } from "lucide-react";

interface DocumentationEditorProps {
  initialTitle: string;
  initialContent: string;
  onSave: (data: { title: string; content: string }) => Promise<void>;
}

export const DocumentationEditor = ({
  initialTitle,
  initialContent,
  onSave,
}: DocumentationEditorProps) => {
  const [isSaving, setIsSaving] = useState(false);
  const [title, setTitle] = useState(initialTitle);
  const [content, setContent] = useState(initialContent);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: "Commencez à écrire...",
        emptyEditorClass:
          "cursor-text before:content-[attr(data-placeholder)] before:text-text-muted/50 before:float-left before:pointer-events-none",
      }),
    ],
    content: initialContent,
    editorProps: {
      attributes: {
        class:
          "prose prose-invert prose-sm sm:prose-base focus:outline-none max-w-none text-text-main prose-headings:text-white prose-a:text-accent prose-strong:text-white",
      },
    },
    onUpdate: ({ editor }) => {
      setContent(editor.getHTML());
    },
  });

  useEffect(() => {
    if (content === initialContent && title === initialTitle) return;

    const timer = setTimeout(() => {
      setIsSaving(true);
      const safeTitle = title.trim() === "" ? "Sans titre" : title.trim();
      onSave({ title: safeTitle, content }).finally(() => setIsSaving(false));
    }, 1000);

    return () => clearTimeout(timer);
  }, [content, title, initialContent, initialTitle, onSave]);

  if (!editor) return null;

  return (
    <div className="w-full max-w-4xl mx-auto pb-12">
      {/* TOOLBAR */}
      <div className="flex items-center gap-1.5 mb-8 pb-3 border-b border-border-dim sticky top-0 bg-background/80 backdrop-blur-md z-10 pt-2">
        <button
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`p-1.5 rounded-md transition-colors ${
            editor.isActive("bold")
              ? "bg-surface-hover text-white"
              : "text-text-muted hover:text-white hover:bg-surface"
          }`}
          title="Gras"
        >
          <Bold className="w-4 h-4" />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`p-1.5 rounded-md transition-colors ${
            editor.isActive("italic")
              ? "bg-surface-hover text-white"
              : "text-text-muted hover:text-white hover:bg-surface"
          }`}
          title="Italique"
        >
          <Italic className="w-4 h-4" />
        </button>
        <div className="w-px h-4 bg-border-dim mx-1" />
        <button
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          }
          className={`p-1.5 rounded-md transition-colors ${
            editor.isActive("heading", { level: 2 })
              ? "bg-surface-hover text-white"
              : "text-text-muted hover:text-white hover:bg-surface"
          }`}
          title="Titre 2"
        >
          <Heading2 className="w-4 h-4" />
        </button>

        <div className="ml-auto flex items-center gap-2">
          {isSaving ? (
            <div className="flex items-center gap-1.5 text-accent animate-pulse">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span className="text-[10px] uppercase tracking-widest font-semibold">
                Sauvegarde
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-text-muted opacity-50">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span className="text-[10px] uppercase tracking-widest font-semibold">
                À jour
              </span>
            </div>
          )}
        </div>
      </div>

      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Titre du document"
        className="w-full bg-transparent text-4xl md:text-5xl font-extrabold text-white placeholder:text-border-dim border-none outline-none mb-8 resize-none tracking-tight"
      />

      <EditorContent editor={editor} />
    </div>
  );
};
