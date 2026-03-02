import React from "react";

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className="border border-black rounded-md px-3 py-2 w-full outline-none focus:ring-0"
    />
  )
}   