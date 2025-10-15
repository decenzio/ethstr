import { getSenderAddress } from "./getSenderAddress";
import {
  type Address,
  type Assign,
  type Chain,
  type Client,
  type Hex,
  type JsonRpcAccount,
  type LocalAccount,
  type Transport,
  decodeFunctionData,
  encodeFunctionData,
  hashTypedData,
} from "viem";
import {
  type EntryPointVersion,
  type SmartAccount,
  type SmartAccountImplementation,
  type UserOperation,
  entryPoint08Abi,
  entryPoint08Address,
  getUserOperationHash,
  getUserOperationTypedData,
  toSmartAccount,
} from "viem/account-abstraction";
import { getChainId } from "viem/actions";
import { readContract } from "viem/actions";
import { getAction } from "viem/utils";

export type GetAccountNonceParams = {
  address: Address;
  entryPointAddress: Address;
};

/**
 * Returns the nonce of the account with the entry point.
 *
 * - Docs: https://docs.pimlico.io/permissionless/reference/public-actions/getAccountNonce
 *
 * @param client {@link client} that you created using viem's createPublicClient.
 * @param args {@link GetAccountNonceParams} address, entryPoint & key
 * @returns bigint nonce
 *
 * @example
 * import { createPublicClient } from "viem"
 * import { getAccountNonce } from "permissionless/actions"
 *
 * const client = createPublicClient({
 *      chain: goerli,
 *      transport: http("https://goerli.infura.io/v3/your-infura-key")
 * })
 *
 * const nonce = await getAccountNonce(client, {
 *      address,
 *      entryPoint,
 *      key
 * })
 *
 * // Return 0n
 */
export const getAccountNonce = async (client: Client, args: GetAccountNonceParams): Promise<bigint> => {
  const { address, entryPointAddress } = args;

  return await getAction(
    client,
    readContract,
    "readContract",
  )({
    address: entryPointAddress,
    abi: [
      {
        inputs: [
          {
            name: "sender",
            type: "address",
          },
          {
            name: "key",
            type: "uint192",
          },
        ],
        name: "getNonce",
        outputs: [
          {
            name: "nonce",
            type: "uint256",
          },
        ],
        stateMutability: "view",
        type: "function",
      },
    ],
    functionName: "getNonce",
    args: [address, 0n],
  });
};

const getAccountInitCode = async (owner: string, index = BigInt(0)): Promise<Hex> => {
  if (!owner) throw new Error("Owner account not found");

  return encodeFunctionData({
    abi: [
      {
        inputs: [
          {
            internalType: "uint256",
            name: "owner",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "salt",
            type: "uint256",
          },
        ],
        name: "createAccount",
        outputs: [
          {
            internalType: "contract NostrAccount",
            name: "ret",
            type: "address",
          },
        ],
        stateMutability: "nonpayable",
        type: "function",
      },
    ],
    functionName: "createAccount",
    args: [BigInt(owner), index],
  });
};

export type ToSimpleSmartAccountParameters<entryPointVersion extends EntryPointVersion> = {
  client: Client<Transport, Chain | undefined, JsonRpcAccount | LocalAccount | undefined>;
  owner: `0x${string}`;
  factoryAddress?: Address;
  entryPoint?: {
    address: Address;
    version: entryPointVersion;
  };
  index?: bigint;
  address?: Address;
};

const getFactoryAddress = (entryPointVersion: EntryPointVersion, factoryAddress?: Address): Address => {
  if (factoryAddress) return factoryAddress;

  switch (entryPointVersion) {
    case "0.8":
      return "0xaCeEF9bf23b41D4898516D2Fdcd7b4BDc22444D7";
    default:
      throw new Error("Unsupported entrypoint version");
  }
};

const getEntryPointAbi = (entryPointVersion: EntryPointVersion) => {
  switch (entryPointVersion) {
    case "0.8":
      return entryPoint08Abi;
    default:
      throw new Error("Unsupported entrypoint version");
  }
};

export type SimpleSmartAccountImplementation<entryPointVersion extends EntryPointVersion = "0.8"> = Assign<
  SmartAccountImplementation<ReturnType<typeof getEntryPointAbi>, entryPointVersion>,
  { sign: NonNullable<SmartAccountImplementation["sign"]> }
>;

export type ToSimpleSmartAccountReturnType<entryPointVersion extends EntryPointVersion = "0.8"> = SmartAccount<
  SimpleSmartAccountImplementation<entryPointVersion>
>;

/**
 * @description Creates an Simple Account from a private key.
 *
 * @returns A Private Key Simple Account.
 */
export async function toNostrSmartAccount<entryPointVersion extends EntryPointVersion>(
  parameters: ToSimpleSmartAccountParameters<entryPointVersion>,
): Promise<ToSimpleSmartAccountReturnType<entryPointVersion>> {
  const { client, owner, factoryAddress: _factoryAddress, index = BigInt(0), address } = parameters;

  const entryPoint = parameters.entryPoint
    ? {
        address: parameters.entryPoint.address,
        abi: getEntryPointAbi(parameters.entryPoint.version),
        version: parameters.entryPoint.version,
      }
    : ({
        address: entryPoint08Address,
        abi: getEntryPointAbi("0.8"),
        version: "0.8",
      } as const);

  const factoryAddress = getFactoryAddress(entryPoint.version, _factoryAddress);

  let accountAddress: string | undefined = address;

  let chainId: number;

  const getMemoizedChainId = async () => {
    if (chainId) return chainId;
    chainId = client.chain ? client.chain.id : await getAction(client, getChainId, "getChainId")({});
    return chainId;
  };

  const getFactoryArgs = async () => {
    return {
      factory: factoryAddress,
      factoryData: await getAccountInitCode(owner, index),
    };
  };

  return toSmartAccount({
    client,
    entryPoint,
    getFactoryArgs,
    async getAddress() {
      if (accountAddress) return accountAddress;

      const { factory, factoryData } = await getFactoryArgs();

      // Get the sender address based on the init code
      accountAddress = await getSenderAddress(client, {
        factory,
        factoryData,
        entryPointAddress: entryPoint.address,
      });

      return accountAddress;
    },
    async encodeCalls(calls) {
      if (calls.length > 1) {
        if (entryPoint.version === "0.8") {
          return encodeFunctionData({
            abi: executeBatch08Abi,
            functionName: "executeBatch",
            args: [
              calls.map(a => ({
                target: a.to,
                value: a.value ?? 0n,
                data: a.data ?? "0x",
              })),
            ],
          });
        }

        if (entryPoint.version === "0.7") {
          return encodeFunctionData({
            abi: executeBatch07Abi,
            functionName: "executeBatch",
            args: [calls.map(a => a.to), calls.map(a => a.value ?? 0n), calls.map(a => a.data ?? "0x")],
          });
        }

        return encodeFunctionData({
          abi: executeBatch06Abi,
          functionName: "executeBatch",
          args: [calls.map(a => a.to), calls.map(a => a.data ?? "0x")],
        });
      }

      const call = calls.length === 0 ? undefined : calls[0];

      if (!call) {
        throw new Error("No calls to encode");
      }

      // 0.6, 0.7 and 0.8 all use the same for "execute"
      return encodeFunctionData({
        abi: executeSingleAbi,
        functionName: "execute",
        args: [call.to, call.value ?? 0n, call.data ?? "0x"],
      });
    },
    //@ts-ignore
    decodeCalls: async callData => {
      try {
        const calls: {
          to: Address;
          data: Hex;
          value?: bigint;
        }[] = [];

        if (entryPoint.version === "0.8") {
          const decodedV8 = decodeFunctionData({
            abi: executeBatch08Abi,
            data: callData,
          });

          for (const call of decodedV8.args[0]) {
            calls.push({
              to: call.target,
              data: call.data,
              value: call.value,
            });
          }

          return calls;
        }

        if (entryPoint.version === "0.7") {
          const decodedV7 = decodeFunctionData({
            abi: executeBatch07Abi,
            data: callData,
          });

          const destinations = decodedV7.args[0];
          const values = decodedV7.args[1];
          const datas = decodedV7.args[2];

          for (let i = 0; i < destinations.length; i++) {
            calls.push({
              to: destinations[i],
              data: datas[i],
              value: values[i],
            });
          }

          return calls;
        }

        if (entryPoint.version === "0.6") {
          const decodedV6 = decodeFunctionData({
            abi: executeBatch06Abi,
            data: callData,
          });

          const destinations = decodedV6.args[0];
          const datas = decodedV6.args[1];

          for (let i = 0; i < destinations.length; i++) {
            calls.push({
              to: destinations[i],
              data: datas[i],
              value: 0n,
            });
          }

          return calls;
        }

        return calls;
      } catch {
        const decodedSingle = decodeFunctionData({
          abi: executeSingleAbi,
          data: callData,
        });

        return [
          {
            to: decodedSingle.args[0],
            value: decodedSingle.args[1],
            data: decodedSingle.args[2],
          },
        ];
      }
    },
    async getNonce() {
      return getAccountNonce(client, {
        address: await this.getAddress(),
        entryPointAddress: entryPoint.address,
      }).catch(e => {
        console.error(e);
        return 0n;
      });
    },
    async getStubSignature() {
      return "0xfffffffffffffffffffffffffffff0000000000000000000000000000000007aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa1c";
    },
    async sign({ hash }) {
      return this.signMessage({ message: hash });
    },
    signMessage: async () => {
      throw new Error("Simple account isn't 1271 compliant");
    },
    signTypedData: async () => {
      throw new Error("Simple account isn't 1271 compliant");
    },
    async signUserOperation(parameters) {
      const { chainId = await getMemoizedChainId(), ...userOperation } = parameters;

      // 0.8 Signs using typed data
      let sigHash: `0x${string}`;
      if (entryPoint.version === "0.8") {
        const typedData = getUserOperationTypedData({
          chainId,
          entryPointAddress: entryPoint.address,
          userOperation: {
            ...userOperation,
            sender: userOperation.sender ?? (await this.getAddress()),
            signature: "0x",
          },
        });
        sigHash = hashTypedData(typedData);
      } else {
        sigHash = getUserOperationHash({
          userOperation: {
            ...userOperation,
            sender: userOperation.sender ?? (await this.getAddress()),
            signature: "0x",
          } as UserOperation<entryPointVersion>,
          entryPointAddress: entryPoint.address,
          entryPointVersion: entryPoint.version,
          chainId: chainId,
        });
      }

      //@ts-ignore
      const result = await window.nostr.signEvent({
        created_at: 0,
        kind: 96024,
        tags: [],
        content: sigHash.substring(2),
      });
      return `0x${result.sig}`;
    },
  }) as Promise<ToSimpleSmartAccountReturnType<entryPointVersion>>;
}

const executeSingleAbi = [
  {
    inputs: [
      {
        internalType: "address",
        name: "dest",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "value",
        type: "uint256",
      },
      {
        internalType: "bytes",
        name: "func",
        type: "bytes",
      },
    ],
    name: "execute",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
] as const;

const executeBatch06Abi = [
  {
    inputs: [
      {
        internalType: "address[]",
        name: "dest",
        type: "address[]",
      },
      {
        internalType: "bytes[]",
        name: "func",
        type: "bytes[]",
      },
    ],
    name: "executeBatch",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
] as const;

const executeBatch07Abi = [
  {
    inputs: [
      {
        internalType: "address[]",
        name: "dest",
        type: "address[]",
      },
      {
        internalType: "uint256[]",
        name: "value",
        type: "uint256[]",
      },
      {
        internalType: "bytes[]",
        name: "func",
        type: "bytes[]",
      },
    ],
    name: "executeBatch",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
] as const;

const executeBatch08Abi = [
  {
    type: "function",
    name: "executeBatch",
    inputs: [
      {
        name: "calls",
        type: "tuple[]",
        internalType: "struct BaseAccount.Call[]",
        components: [
          {
            name: "target",
            type: "address",
            internalType: "address",
          },
          {
            name: "value",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "data",
            type: "bytes",
            internalType: "bytes",
          },
        ],
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
] as const;
