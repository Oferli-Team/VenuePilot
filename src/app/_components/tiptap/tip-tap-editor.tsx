"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import { useEffect } from "react";
import { MenuBar } from "./menu-bar";

export const Tiptap = ({
  content,
  onChange,
}: {
  content: string;
  onChange: (value: string) => void;
}) => {
  const editorContainer =
    "bg-card/20 p-2 border border-input rounded-md mt-2 focus-none min-h-52 h-full w-full";

  const extensions = [
    StarterKit.configure({
      bulletList: {
        HTMLAttributes: {
          class: "list-disc ml-3",
        },
      },
      orderedList: {
        HTMLAttributes: {
          class: "list-decimal ml-3",
        },
      },
    }),
    Underline.configure({
      HTMLAttributes: {
        class: "underline",
      },
    }),
  ];
  const editorProps = {
    attributes: {
      class: editorContainer,
      spellcheck: "false",
    },
  };

  const editor = useEditor({
    editorProps,
    extensions,
    content: "",
    onUpdate({ editor }) {
      onChange(editor.getHTML());
    },
    immediatelyRender: true,
  });

  useEffect(() => {
    if (editor && !editor.isDestroyed && editor.getHTML() !== content) {
      editor.commands.setContent(content);
    }
  }, [editor, content]);

  return (
    <>
      <MenuBar editor={editor} />
      <EditorContent editor={editor} className="touch-manipulation text-base" />
    </>
  );
};
