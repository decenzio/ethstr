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
      <div className="flex w-full flex-col lg:flex-row items-center justify-center gap-5">
        <button
          className="btn btn-soft btn-lg btn-warning flex-1 text-lg tooltip tooltip-bottom"
          data-tip="Send something somewhere"
          onClick={() => handleOpenModal("send-modal")}
        >
          Send
        </button>
        <button
          className="btn btn-soft btn-lg btn-accent flex-1 text-lg tooltip tooltip-right"
          data-tip="Display shareable wallet information"
          onClick={() => handleOpenModal("receive-modal")}
        >
          Receive
        </button>
      </div>
    </div>
  );
};

export default WalletInteraction;
