"use client";

import { useEditor, EditorContent, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import React, { useEffect } from "react";
import { MenuBar } from "../tiptap/menu-bar";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Separator } from "../ui/separator";

export const VARIABLES = [
  {
    id: "NR_TOP",
    label: "Número de inscrição",
    description: "Exibe o número do TOP",
  },
  {
    id: "DATA_INICIO_EVENTO",
    label: "Data do evento",
    description: "Exibe a data que iniciará o evento",
  },
  {
    id: "DATA_FIM_EVENTO",
    label: "Data do evento",
    description: "Exibe a data que o evento finaliza",
  },
  {
    id: "PISTA",
    label: "Pista",
    description: "Exibe o nome da pista do evento",
  },
];

type Variable = {
  id: string;
  label: string;
  description: string;
};

export const TermsEditor = ({
  content,
  onChange,
}: {
  content: string;
  onChange: (value: string) => void;
}) => {
  const [showSuggestions, setShowSuggestions] = React.useState(false);
  const [popoverPosition, setPopoverPosition] = React.useState({
    top: 0,
    left: 0,
  });
  const triggerRef = React.useRef(null);
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
    onSelectionUpdate({ editor }) {
      onSelectionUpdate(editor);
    },
  });

  const onSelectionUpdate = (editor: Editor) => {
    const { from } = editor.state.selection;
    const text = editor.state.doc.textBetween(Math.max(0, from - 2), from);

    if (text === "{{") {
      const view = editor.view;
      const { left } = view.coordsAtPos(from);

      const editorRect = editorRef.current?.getBoundingClientRect() ?? {
        top: 0,
        left: 0,
      };

      const scrollY = window.scrollY;
      setPopoverPosition({
        top: scrollY + 20,
        left: left - editorRect.left + 20,
      });
      setShowSuggestions(true);
    } else if (showSuggestions && (text.includes("}") || text.includes(" "))) {
      setShowSuggestions(false);
    }
  };

  const insertVariable = (variable: Variable) => {
    if (!editor) return;

    const position = editor.state.selection.from;

    // remove "{{" and add the variable
    editor.commands.deleteRange({
      from: position - 2,
      to: position,
    });

    editor.commands.insertContent(`{{${variable.id}}}`);

    const newPosition = position - 2 + `{{${variable.id}}}`.length;

    setShowSuggestions(false);

    requestAnimationFrame(() => {
      editor.commands.focus();
      editor.commands.setTextSelection(newPosition);
    });
  };

  useEffect(() => {
    if (editor && !editor.isDestroyed && editor.getHTML() !== content) {
      editor.commands.setContent(content);
    }
  }, [editor, content]);

  return (
    <div className="relative">
      <MenuBar editor={editor} className="bg-card" />

      <div className="max-h-screen space-y-2 overflow-auto p-1" ref={editorRef}>
        <EditorContent editor={editor} className="text-base" />

        <Popover open={showSuggestions} onOpenChange={setShowSuggestions}>
          <PopoverTrigger asChild>
            <button
              ref={triggerRef}
              className="absolute opacity-0"
              style={{
                top: `${popoverPosition.top}px`,
                left: `${popoverPosition.left}px`,
              }}
            />
          </PopoverTrigger>
          <PopoverContent className="w-60 p-0" align="start">
            <h5 className="p-2 text-sm font-medium">Variáveis Disponíveis</h5>
            <Separator />
            <div className="space-y-1 p-2">
              {VARIABLES.map((variable) => (
                <button
                  key={variable.id}
                  className="flex w-full flex-col items-start rounded-md bg-background px-2 py-3 duration-150 hover:bg-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  onClick={(e) => {
                    insertVariable(variable);
                    e.preventDefault();
                  }}
                >
                  <span className="font-medium">{variable.id}</span>
                  <span className="text-xs text-muted-foreground">
                    {variable.description}
                  </span>
                </button>
              ))}
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
};
