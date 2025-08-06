"use client";

import React from "react";
import { DocumentDuplicateIcon } from "@heroicons/react/24/outline";

const CopyButton = ({ className, value }: { className?: string; value: string }) => {
  const handleCopy = async (value: string) => {
    navigator.clipboard.writeText(value);
    const toast = document.createElement("div");
    toast.className = "toast toast-bottom toast-end z-50";
    toast.innerHTML = `
                    <div class="alert alert-success">
                      <span>Copied to clipboard</span>
                    </div>
                  `;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
  };

  return (
    <button className={className + " tooltip"} data-tip="Copy">
      <DocumentDuplicateIcon
        onClick={() => handleCopy(value)}
        className="h-[15px] opacity-[.4] hover:opacity-100 cursor-pointer transition-all"
      />
    </button>
  );
};

export default CopyButton;
