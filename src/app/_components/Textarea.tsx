"use client";
import { type TextareaHTMLAttributes } from "react";
import { useFormContext } from "react-hook-form";

type TextareaProps = {
  name?: string;
} & TextareaHTMLAttributes<HTMLTextAreaElement>;

export function Textarea({ name, ...props }: TextareaProps) {
  const { register } = useFormContext();
  return (
    <>
      <textarea
        className="block max-h-[12rem] min-h-10 bg-background w-full outline-none rounded-sm border-0 p-2 shadow-sm ring-1 ring-input ring-inset focus:ring-1 focus:ring-inset focus:ring-ring sm:leading-6"
        rows={4}
        {...register(name!)}
        {...props}
      ></textarea>
    </>
  );
}
