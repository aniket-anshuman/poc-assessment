"use client";
import * as React from "react";

export const EditorHeader: React.FC = () => {
  return (
    <header className="flex flex-wrap gap-5 justify-between px-6 py-3.5 w-full tracking-normal bg-white border border-solid border-neutral-200 max-md:px-5 max-md:max-w-full">
      <h1 className="my-auto text-xl font-bold text-sky-700">Online Editor</h1>
      <div className="flex gap-2.5 text-sm font-medium text-neutral-900">
        <img
          src="https://cdn.builder.io/api/v1/image/assets/TEMP/7d894b4f74696e02a96f78494172cb3255c3dcf2?placeholderIfAbsent=true&apiKey=03460e0d144340f9a86fe9f595bda60a"
          alt="User avatar"
          className="object-contain shrink-0 w-8 aspect-square"
        />
        <div className="flex gap-1.5 my-auto">
          <span className="grow my-auto">John William</span>
          <img
            src="https://cdn.builder.io/api/v1/image/assets/TEMP/903a18f2d15173500b0f174fda0eb6497843040b?placeholderIfAbsent=true&apiKey=03460e0d144340f9a86fe9f595bda60a"
            alt="Dropdown icon"
            className="object-contain shrink-0 aspect-square w-[22px]"
          />
        </div>
      </div>
    </header>
  );
};
