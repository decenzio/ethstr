"use client";

import type { NextPage } from "next";

const Home: NextPage = () => {
  return (
    <>
      <div className="flex items-center flex-col grow pt-10">
        <div className="w-full max-w-xl px-4">
          <h1 className="text-2xl font-semibold mb-4">Welcome</h1>
          <p className="text-sm opacity-80">Use the Explorer to resolve an EVM address from a Nostr npub.</p>
        </div>
      </div>
    </>
  );
};

export default Home;
