"use client";

import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";

type PasswordInputProps = {
  id: string;
  name: string;
  required?: boolean;
};

export function PasswordInput({ id, name, required }: PasswordInputProps) {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div className="relative mt-2">
      <input
        id={id}
        name={name}
        type={isVisible ? "text" : "password"}
        required={required}
        className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 pr-11 text-sm text-zinc-950 outline-none placeholder:text-zinc-400 focus:border-teal-700"
      />
      <button
        type="button"
        aria-label={isVisible ? "Hide password" : "Show password"}
        onClick={() => setIsVisible((current) => !current)}
        className="absolute right-2 top-1/2 grid size-8 -translate-y-1/2 place-items-center rounded-md text-zinc-500 hover:bg-zinc-100 hover:text-zinc-950"
      >
        {isVisible ? <EyeOff size={18} /> : <Eye size={18} />}
      </button>
    </div>
  );
}
