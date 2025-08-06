"use client";

import React from "react";

const ErrorDialog = ({
  className,
  id,
  title,
  description,
}: {
  className?: string;
  id: string;
  title?: string;
  description?: string;
}) => {
  return (
    <dialog id={id} className={`modal ${className ?? ""}`}>
      <div className="modal-box bg-secondary w-[460px]">
        <h3 className="font-bold text-lg">{title}</h3>
        <p>{description}</p>

        <form method="dialog" className="flex justify-center mt-4">
          <button className="btn btn-dash">Close</button>
        </form>
      </div>
    </dialog>
  );
};

export default ErrorDialog;
