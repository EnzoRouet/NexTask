"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import { useEffect, useState } from "react";

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
          "cursor-text before:content-[attr(data-placeholder)] before:text-gray-600 before:float-left before:pointer-events-none",
      }),
    ],
    content: initialContent,
    editorProps: {
      attributes: {
        class:
          "prose prose-invert prose-sm sm:prose-base lg:prose-lg xl:prose-xl focus:outline-none max-w-none text-gray-300",
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

  if (!editor) {
    return null;
  }

  return (
    <div className="w-full max-w-4xl mx-auto py-12">
      <div className="flex items-center gap-2 mb-10 pb-4 border-b border-gray-200 text-sm opacity-60 hover:opacity-100 transition-opacity">
        <button
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`px-3 py-1.5 rounded-md transition-colors ${editor.isActive("bold") ? "bg-gray-700 text-white" : "text-white hover:bg-gray-800 hover:text-gray-200"}`}
        >
          Gras
        </button>
        <button
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`px-3 py-1.5 rounded-md transition-colors ${editor.isActive("italic") ? "bg-gray-700 text-white" : "text-white hover:bg-gray-800 hover:text-gray-200"}`}
        >
          Italique
        </button>
        <button
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          }
          className={`px-3 py-1.5 rounded-md transition-colors ${editor.isActive("heading", { level: 2 }) ? "bg-gray-700 text-white" : "text-white hover:bg-gray-800 hover:text-gray-200"}`}
        >
          Titre 2
        </button>

        <div className="ml-auto flex items-center gap-2">
          {isSaving ? (
            <span className="text-yellow-500/80 animate-pulse text-xs uppercase tracking-widest">
              Sauvegarde...
            </span>
          ) : (
            <span className="text-green-500/50 text-xs uppercase tracking-widest">
              À jour
            </span>
          )}
        </div>
      </div>

      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Titre du document"
        className="w-full bg-transparent text-5xl font-extrabold text-white placeholder-gray-700 border-none outline-none mb-8 resize-none"
      />

      <EditorContent editor={editor} />
    </div>
  );
};
