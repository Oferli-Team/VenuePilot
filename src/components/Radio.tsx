"use client";

import { type InputHTMLAttributes } from "react";
import { useFormContext } from "react-hook-form";

type RadioValue = string;

type RadioProps = {
  name?: string;
  label?: string;
  labelFor?: string;
  onCheck?: (value: RadioValue) => void;
  value?: RadioValue;
} & InputHTMLAttributes<HTMLInputElement>;

export default function Radio({
  name,
  label,
  labelFor,
  value,
  ...props
}: RadioProps) {
  const { register } = useFormContext();

  return (
    <>
      <input
        className="relative mr-2 flex h-[1rem] w-[1rem] cursor-pointer appearance-none items-center justify-center rounded-full border border-input bg-background outline-none transition-colors duration-200 before:h-2 before:w-2 before:rounded-full before:bg-primary before:opacity-0 before:transition-opacity checked:border-primary checked:bg-transparent checked:before:opacity-100 focus:shadow-md"
        type="radio"
        id={`${name}-${labelFor}`}
        value={value}
        {...register(name!)}
        {...props}
      />
      <label
        htmlFor={`${name}-${labelFor}`}
        className="mr-3 cursor-pointer text-sm tracking-wide"
      >
        {label}
      </label>
    </>
  );
}
