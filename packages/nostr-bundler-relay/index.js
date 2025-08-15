const { useWebSocketImplementation, SimplePool } = require('nostr-tools/pool');
const { generateSecretKey, getPublicKey, finalizeEvent } = require('nostr-tools/pure');
const WebSocket = require('ws');
useWebSocketImplementation(WebSocket);

const { createPublicClient, http } = require('viem');

// Load chain configuration
const chainsConfig = require('../../chains.config.json');

// Create clients for all supported chains
const chainClients = {};

console.log(`🚀 Initializing clients for ${chainsConfig.supportedChains.length} chains...`);

for (const chainName of chainsConfig.supportedChains) {
    const config = chainsConfig.chains[chainName];
    
    chainClients[chainName] = {
        config,
        bundlerClient: createPublicClient({
            chain: {
                id: config.chainId,
                name: config.name,
                rpcUrls: { default: { http: [config.rpcUrl] } }
            },
            transport: http(config.bundlerUrl),
        })
    };
    
    console.log(`✅ ${chainName}: ${config.name} (ID: ${config.chainId})`);
}

const pool = new SimplePool();
const relays = ["wss://relay.primal.net", "wss://nos.lol", "wss://relay.damus.io"];

// Default chain
let currentChain = chainsConfig.defaultChain;

/**
 * Get chain for event (checks event tags, falls back to current chain)
 */
function getChainForEvent(event) {
    // Look for chain in event tags
    if (event.tags) {
        const chainTag = event.tags.find(tag => tag[0] === 'chain' && tag[1]);
        if (chainTag && chainsConfig.supportedChains.includes(chainTag[1])) {
            return chainTag[1];
        }
    }
    
    return currentChain;
}

/**
 * Submit user operation to chain
 */
async function submitUserOperation(userOp, chainName) {
    const chainClient = chainClients[chainName];
    if (!chainClient) {
        throw new Error(`Chain ${chainName} not available`);
    }
    
    const { bundlerClient, config } = chainClient;
    
    console.log(`🚀 Submitting to ${chainName} (${config.name})`);
    
    // Convert bigint to hex
    const processedOp = { ...userOp };
    for (let key in processedOp) {
        if (typeof(processedOp[key]) === "bigint") {
            processedOp[key] = "0x" + processedOp[key].toString(16);
        }
    }
    
    const txHash = await bundlerClient.request({
        method: 'eth_sendUserOperation',
        params: [processedOp, config.contracts.entryPoint],
    });
    
    console.log(`✅ Transaction: ${txHash} on ${chainName}`);
    return txHash;
}

function parseWithBigInt(json) {
    return JSON.parse(json, (_, value) =>
        value && typeof value === 'object' && '__bigint__' in value
            ? BigInt(value.__bigint__)
            : value
    );
}

async function subscribeToEvents() {
    pool.subscribe(
        relays,
        { kinds: [96124] },
        {
            async onevent(event) {
                try {
                    console.log('📨 Received Nostr event:', event.id);
                    
                    const userOp = parseWithBigInt(event.content);
                    const chainName = getChainForEvent(event);
                    
                    console.log(`🔗 Using chain: ${chainName}`);
                    
                    const txHash = await submitUserOperation(userOp, chainName);
                    console.log(`🎉 Success: ${txHash}`);
                    
                } catch (error) {
                    console.error("❌ Error:", error.message);
                }
            }
        }
    );

    console.log("🎯 Listening for user operations...");
    console.log(`� Chains: ${chainsConfig.supportedChains.join(", ")}`);
    console.log(`🔗 Default: ${currentChain}`);
}

async function main() {
    await subscribeToEvents();
}

main();
