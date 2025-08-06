"use client";

import React from "react";
import { CopyButton } from "~~/components/import";
import { useGlobalState } from "~~/services/store/store";

const ReceiveDialog = ({ className, id }: { className?: string; id: string }) => {
  const walletAddress = useGlobalState(state => state.walletAddress);

  return (
    <dialog id={id} className={`modal ${className ?? ""}`}>
      <div className="modal-box w-[460px]">
        <h3 className="font-bold text-lg">Your wallet information</h3>
        <p className="mb-4">
          {walletAddress} <CopyButton value={walletAddress ?? ""} />
        </p>
        {walletAddress && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={`https://api.qrserver.com/v1/create-qr-code/?size=380x380&data=${encodeURIComponent(walletAddress)}`}
            alt="Wallet QR Code"
            className="w-full"
          />
        )}
        <form method="dialog" className="flex justify-center mt-4">
          <button className="btn btn-dash">Close</button>
        </form>
      </div>
    </dialog>
  );
};

export default ReceiveDialog;
