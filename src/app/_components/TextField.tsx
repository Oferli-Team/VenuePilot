"use client";
import { type InputHTMLAttributes, type SelectHTMLAttributes } from "react";

type TextFieldProps = {
  label?: string;
  labelFor?: string;
  name: string;
  isSelect?: boolean;
  options?: number[];
  required?: boolean;
  className?: string;
} & InputHTMLAttributes<HTMLInputElement> &
  SelectHTMLAttributes<HTMLSelectElement>;

export default function TextField({
  label,
  labelFor,
  name,
  isSelect,
  options,
  required,
  className,
  ...props
}: TextFieldProps) {
  return (
    <>
      {isSelect ? (
        <div className="w-full">
          <label
            htmlFor={labelFor}
            className="block font-light leading-6 sm:text-base"
          >
            {label}
          </label>
          <div className="mt-2">
            <select
              id={labelFor}
              name={name}
              className="block w-full cursor-pointer rounded-md border-0 p-1.5 shadow-sm outline-none ring-1 ring-inset ring-input focus:ring-inset focus:ring-ring sm:leading-6"
              {...props}
            >
              {options?.map((option) => (
                <option
                  key={`${option}-${Math.random()}`}
                  className="bg-gray-100"
                  value={option}
                >
                  {option}
                </option>
              ))}
            </select>
          </div>
        </div>
      ) : (
        <div className={` ${className ?? ""}`}>
          <label
            htmlFor={labelFor}
            className="sm:text block text-center leading-6"
          >
            {label}
          </label>
          <div className="mt-2">
            <input
              name={name}
              className="block w-full rounded-md border-0 p-1.5 shadow-sm outline-none ring-1 ring-inset ring-input placeholder:text-input focus:ring-inset focus:ring-ring sm:leading-6"
              required={required}
              {...props}
            />
          </div>
        </div>
      )}
    </>
  );
}
