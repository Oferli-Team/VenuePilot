"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import React, { useEffect } from "react";
import { MenuBar } from "../tiptap/menu-bar";

export const Editor = ({
  content,
  onChange,
}: {
  content: string;
  onChange: (value: string) => void;
}) => {
  const editorRef = React.useRef<HTMLDivElement>(null);

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
    immediatelyRender: false,
    onUpdate({ editor }) {
      onChange(editor.getHTML());
    },
  });

  useEffect(() => {
    if (editor && !editor.isDestroyed && editor.getHTML() !== content) {
      editor.commands.setContent(content);
    }
  }, [editor, content]);

  return (
    <div className="relative">
      <MenuBar editor={editor} className="bg-card" />

      <div className="max-h-screen space-y-2 overflow-auto" ref={editorRef}>
        <EditorContent editor={editor} className="text-base" />
      </div>
    </div>
  );
};
