"use client";

import { EvmAddressResolver } from "./_components/EvmAddressResolver";
import type { NextPage } from "next";

const ExplorerPage: NextPage = () => {
  return (
    <>
      <div className="flex items-center flex-col grow pt-10">
        <EvmAddressResolver />
      </div>
    </>
  );
};

export default ExplorerPage;
