import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

// EntryPoint v0.7.0 - canonical address on most networks
const ENTRY_POINT_V07 = "0x0000000071727De22E5E9d8BAf0edAc6f37da032";

const NpubContractsModule = buildModule("NpubContracts", m => {
  // Deploy NpubAccountFactory with EntryPoint address
  const factory = m.contract("NpubAccountFactory", [ENTRY_POINT_V07]);

  return { factory };
});

export default NpubContractsModule;
