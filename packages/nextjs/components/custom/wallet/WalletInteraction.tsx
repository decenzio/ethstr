"use client";

import React from "react";

const WalletInteraction = ({ className }: { className?: string }) => {
  const handleOpenModal = (id: string) => {
    const modal = document.getElementById(id) as HTMLDialogElement | null;
    if (modal) {
      modal.showModal();
    }
  };

  return (
    <div className={className}>
      <div className="flex w-full flex-col lg:flex-row items-center justify-center gap-4">
        <button className="btn btn-warning flex-1 text-lg font-medium" onClick={() => handleOpenModal("send-modal")}>
          Send
        </button>
        <button className="btn btn-accent flex-1 text-lg font-medium" onClick={() => handleOpenModal("receive-modal")}>
          Receive
        </button>
      </div>
    </div>
  );
};

export default WalletInteraction;
