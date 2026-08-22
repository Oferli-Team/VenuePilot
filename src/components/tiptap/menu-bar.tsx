import { type Editor } from "@tiptap/react";
import {
  Bold,
  Heading1,
  Heading2,
  Heading3,
  Italic,
  List,
  ListOrdered,
  Minus,
  PiIcon,
  Redo,
  Underline,
  Undo,
} from "lucide-react";
import { BsBlockquoteLeft } from "react-icons/bs";
import { Toggle } from "../ui/toggle";
import { cn } from "@/lib/utils";

export const MenuBar = ({
  editor,
  className,
}: {
  editor: Editor | null;
  className?: string;
}) => {
  if (!editor) {
    return null;
  }

  const buttons = [
    {
      icon: Bold,
      onClick: () => editor.chain().focus().toggleBold().run(),
      pressed: editor.isActive("bold"),
    },
    {
      icon: Italic,
      onClick: () => editor.chain().focus().toggleItalic().run(),
      pressed: editor.isActive("italic"),
    },
    {
      icon: Underline,
      onClick: () => editor.chain().focus().toggleUnderline().run(),
      pressed: editor.isActive("underline"),
    },
    {
      icon: Heading1,
      onClick: () => editor.chain().focus().toggleHeading({ level: 1 }).run(),
      pressed: editor.isActive("heading", { level: 1 }),
    },
    {
      icon: Heading2,
      onClick: () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
      pressed: editor.isActive("heading", { level: 2 }),
    },
    {
      icon: Heading3,
      onClick: () => editor.chain().focus().toggleHeading({ level: 3 }).run(),
      pressed: editor.isActive("heading", { level: 3 }),
    },
    {
      icon: List,
      onClick: () => editor.chain().focus().toggleBulletList().run(),
      pressed: editor.isActive("bulletList"),
    },
    {
      icon: ListOrdered,
      onClick: () => editor.chain().focus().toggleOrderedList().run(),
      pressed: editor.isActive("orderedList"),
    },
    {
      icon: BsBlockquoteLeft,
      onClick: () => editor.chain().focus().toggleBlockquote().run(),
      pressed: editor.isActive("blockquote"),
    },
    {
      icon: Minus,
      onClick: () => editor.chain().focus().setHorizontalRule().run(),
    },
    {
      icon: Undo,
      onClick: () => editor.chain().focus().undo().run(),
    },
    {
      icon: Redo,
      onClick: () => editor.chain().focus().redo().run(),
    },
  ];

  return (
    <div
      className={cn(
        "flex flex-wrap gap-2 rounded-md border border-input bg-card/20 p-2",
        className,
      )}
    >
      {buttons.map((button, i) => (
        <Toggle
          key={i + 1}
          pressed={button.pressed}
          onPressedChange={button.onClick}
        >
          {<button.icon className="size-4" />}
        </Toggle>
      ))}
    </div>
  );
};
