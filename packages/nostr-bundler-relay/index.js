const { useWebSocketImplementation, SimplePool } = require('nostr-tools/pool');
// or import { useWebSocketImplementation } from 'nostr-tools/relay' if you're using the Relay directly

const {generateSecretKey, getPublicKey, finalizeEvent} = require('nostr-tools/pure');
const WebSocket = require('ws');
useWebSocketImplementation(WebSocket);

const { createPublicClient, http, keccak256, encodeAbiParameters, encodePacked, hashTypedData, domainSeparator,
    hashStruct
} = require('viem');
const { sepolia } = require('viem/chains');
const {entryPoint08Abi, entryPoint08Address} = require("viem/account-abstraction");

const bundlerRpcUrl = 'https://api.pimlico.io/v2/8453/rpc?apikey=pim_X5CHVGtEhbJLu7Wj4H8fDC';
const bundlerClient = createPublicClient({
    chain: sepolia,
    transport: http(bundlerRpcUrl),
});

const pool = new SimplePool()

const relays = ["wss://relay.primal.net", "wss://nos.lol", "wss://relay.damus.io"];

// let's publish a new event while simultaneously monitoring the relay for it
let sk = generateSecretKey()
let pk = getPublicKey(sk)

const chainId = 8453n;

function parseWithBigInt(json) {
    return JSON.parse(json, (_, value) =>
        value && typeof value === 'object' && '__bigint__' in value
            ? BigInt(value.__bigint__)
            : value
    );
}

// async function getOpHash(operation) {
//     const userOp = {
//         ...operation,
//         accountGasLimits: "0x"+((operation.verificationGasLimit << 128n) | operation.callGasLimit).toString(16).padStart(64, "0"),
//         gasFees: "0x"+((operation.maxFeePerGas << 128n) | operation.maxPriorityFeePerGas).toString(16).padStart(64, "0")
//     };
//     userOp.initCode ??= "0x";
//     userOp.paymasterAndData ??= "0x";
//
//     const domain = {
//         name: 'ERC4337',
//         version: '1',
//         chainId,
//         verifyingContract: entryPoint08Address,
//     };
//
//     const types = {
//         PackedUserOperation: [
//             { name: 'sender', type: 'address' },
//             { name: 'nonce', type: 'uint256' },
//             { name: 'initCode', type: 'bytes' },
//             { name: 'callData', type: 'bytes' },
//             { name: 'accountGasLimits', type: 'bytes32' },
//             { name: 'preVerificationGas', type: 'uint256' },
//             { name: 'gasFees', type: 'bytes32' },
//             { name: 'paymasterAndData', type: 'bytes' },
//         ],
//     };
//
//     console.log(domainSeparator({domain}));
//     console.log(hashStruct({data: userOp, primaryType: "PackedUserOperation", types}));
//
//     const userOpHash = await hashTypedData({
//         domain,
//         types,
//         primaryType: 'PackedUserOperation',
//         message: userOp
//     });
//
//     return userOpHash;
// }

async function subscribeToEvents() {
    pool.subscribe(
        relays,
        {
            kinds: [96124]
        },
        {
            async onevent(event) {
                try {
                    // console.log('got event:', event);
                    const parsedObj = parseWithBigInt(event.content);
                    console.log("parsed object: ", parsedObj);

                    // // 1. Hash the PackedUserOperation struct
                    // const userOpHashInner = keccak256(
                    //     encodeAbiParameters(
                    //         [
                    //             { type: 'address', name: 'sender' },
                    //             { type: 'uint256', name: 'nonce' },
                    //             { type: 'bytes', name: 'initCode' },
                    //             { type: 'bytes', name: 'callData' },
                    //             { type: 'bytes32', name: 'accountGasLimits' },
                    //             { type: 'uint256', name: 'preVerificationGas' },
                    //             { type: 'bytes32', name: 'gasFees' },
                    //             { type: 'bytes', name: 'paymasterAndData' },
                    //             // { type: 'bytes', name: 'signature' },
                    //         ],
                    //         [
                    //             userOp.sender,
                    //             userOp.nonce,
                    //             userOp.initCode,
                    //             userOp.callData,
                    //             userOp.accountGasLimits,
                    //             userOp.preVerificationGas,
                    //             userOp.gasFees,
                    //             userOp.paymasterAndData,
                    //             // userOp.signature,
                    //         ]
                    //     )
                    // );
                    //
                    // // 2. Hash with EntryPoint and chainId to get final userOpHash
                    // const userOpHash = keccak256(
                    //     encodePacked(
                    //         ['bytes32', 'address', 'uint256'],
                    //         [userOpHashInner, entryPoint08Address, 8453n]
                    //     )
                    // );

                    // console.log("Submitted user operation, opHash: ", await getOpHash(parsedObj));

                    // const userOpHash = await bundlerClient.readContract({
                    //     address: entryPoint08Address,
                    //     abi: entryPoint08Abi,
                    //     functionName: 'getUserOpHash',
                    //     args: [opObject],
                    // });

                    for(let key in parsedObj) {
                        if(typeof(parsedObj[key])==="bigint") parsedObj[key] = "0x"+parsedObj[key].toString(16);
                    }

                    const txHash = await bundlerClient.request({
                        method: 'eth_sendUserOperation',
                        params: [
                            parsedObj, // UserOperation type object
                            "0x4337084D9E255Ff0702461CF8895CE9E3b5Ff108"
                        ],
                    });

                    console.log("Submitted user operation, txHash: ", txHash);
                } catch (e) {
                    console.error("Error during tx sending", e);
                }
            }
        }
    );

    console.log("Subscribed!");
}

async function main() {
    await subscribeToEvents();

    //Expected hash: 0x7bf4db156a99559d5d4ba3cb865ab2bd217ec20b1b88759f440ecb83a8afed2f
    // const testObj = {
    //     maxFeePerGas: 19465545n,
    //     maxPriorityFeePerGas: 1250000n,
    //     sender: '0xDFcd7d99Ef9C162F0DB4feb74be6ccd59638B144',
    //     callData: '0xb61d27f60000000000000000000000009c2a96d6838ae8b6c42a18f437ed371b30cce59a000000000000000000000000000000000000000000000000000009184e72a00000000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000000',
    //     nonce: 7n,
    //     signature: '0x76c822fdc005dedc4ccdfbcc57011a8f89f9bd4c95ce7454e08f0d57b5c69acee7536f735689f92db0dd185aa414b9082bbc67104a399fb80990bfb1dcaa8b22',
    //     callGasLimit: 17955n,
    //     preVerificationGas: 54503n,
    //     verificationGasLimit: 173563n,
    //     paymasterPostOpGasLimit: 0n,
    //     paymasterVerificationGasLimit: 0n
    // };
    //
    // console.log(await getOpHash(testObj));

    // let eventTemplate = {
    //     kind: 96124,
    //     created_at: Math.floor(Date.now() / 1000),
    //     tags: [],
    //     content: '{"maxFeePerGas":{"__bigint__":"13109280"},"maxPriorityFeePerGas":{"__bigint__":"1250000"},"sender":"0xDFcd7d99Ef9C162F0DB4feb74be6ccd59638B144","callData":"0xb61d27f600000000000000000000000066bad48301609adaa01cb3140d1b1d92bfa03dd5000000000000000000000000000000000000000000000000000009184e72a00000000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000000","nonce":{"__bigint__":"1"},"signature":"0xb5533bb0228f32f856c664b6792027678be3ba1afe24a5a1245ceafebc4f88e7a95fffd774aa62b9de6136a4d7828f96a068d206960288b3342782ff42674f65","callGasLimit":{"__bigint__":"17955"},"preVerificationGas":{"__bigint__":"54094"},"verificationGasLimit":{"__bigint__":"173563"},"paymasterPostOpGasLimit":{"__bigint__":"0"},"paymasterVerificationGasLimit":{"__bigint__":"0"}}'
    // }
    //
    // // this assigns the pubkey, calculates the event id and signs the event in a single step
    // const signedEvent = finalizeEvent(eventTemplate, sk)
    // await Promise.any(pool.publish(relays, signedEvent));

}

main();
