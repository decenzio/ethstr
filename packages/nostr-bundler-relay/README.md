# Nostr Bundler Relay

A Node.js service that bridges Nostr protocol with Ethereum Account Abstraction (ERC-4337) by listening for UserOperations published as Nostr events and forwarding them to a bundler service.

## Overview

This service acts as a relay between the Nostr network and Ethereum bundlers, enabling the submission of UserOperations through Nostr events. It monitors specific Nostr relays for events of kind `96124` (custom event type for UserOperations) and automatically forwards them to a Pimlico bundler for execution on the Ethereum network.

## Features

- **Nostr Integration**: Connects to multiple Nostr relays for event monitoring
- **ERC-4337 Support**: Handles UserOperation objects for Account Abstraction
- **BigInt Serialization**: Properly handles BigInt values in JSON serialization
- **Error Handling**: Robust error handling for transaction submission
- **Multi-Relay Support**: Connects to multiple Nostr relays for redundancy

## Architecture

```
Nostr Relays → nostr-bundler-relay → Pimlico Bundler → Ethereum Network
```

The service:
1. Subscribes to Nostr events of kind `96124` from multiple relays
2. Parses the event content containing UserOperation data
3. Converts BigInt values to hexadecimal format
4. Submits the UserOperation to the Pimlico bundler
5. Logs the transaction hash upon successful submission

## Installation

```bash
npm install
```

## Dependencies

- **nostr-tools**: Nostr protocol implementation
- **viem**: Ethereum library for blockchain interactions
- **ws**: WebSocket implementation for Node.js
- **permissionless**: Account Abstraction utilities

## Configuration

### Environment Variables

The service uses the following configuration:

- **Bundler RPC URL**: `https://api.pimlico.io/v2/8453/rpc?apikey=pim_X5CHVGtEhbJLu7Wj4H8fDC`
- **Chain ID**: `8453` (Base Sepolia)
- **Entry Point**: `0x4337084D9E255Ff0702461CF8895CE9E3b5Ff108`
- **Nostr Relays**: 
  - `wss://relay.primal.net`
  - `wss://nos.lol`
  - `wss://relay.damus.io`

### Event Format

The service expects Nostr events with:
- **Kind**: `96124`
- **Content**: JSON string containing UserOperation data with BigInt serialization

Example event content:
```json
{
  "maxFeePerGas": {"__bigint__": "13109280"},
  "maxPriorityFeePerGas": {"__bigint__": "1250000"},
  "sender": "0xDFcd7d99Ef9C162F0DB4feb74be6ccd59638B144",
  "callData": "0xb61d27f600000000000000000000000066bad48301609adaa01cb3140d1b1d92bfa03dd5000000000000000000000000000000000000000000000000000009184e72a00000000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000000",
  "nonce": {"__bigint__": "1"},
  "signature": "0xb5533bb0228f32f856c664b6792027678be3ba1afe24a5a1245ceafebc4f88e7a95fffd774aa62b9de6136a4d7828f96a068d206960288b3342782ff42674f65",
  "callGasLimit": {"__bigint__": "17955"},
  "preVerificationGas": {"__bigint__": "54094"},
  "verificationGasLimit": {"__bigint__": "173563"},
  "paymasterPostOpGasLimit": {"__bigint__": "0"},
  "paymasterVerificationGasLimit": {"__bigint__": "0"}
}
```

## Usage

### Running the Service

```bash
node index.js
```

The service will:
1. Connect to the configured Nostr relays
2. Subscribe to events of kind `96124`
3. Process incoming UserOperations
4. Submit them to the Pimlico bundler
5. Log transaction hashes

### Monitoring

The service provides console output for:
- Subscription confirmation
- Parsed UserOperation objects
- Transaction submission results
- Error messages

## API Reference

### Functions

#### `parseWithBigInt(json)`
Parses JSON strings containing BigInt serialized values and converts them back to BigInt objects.

**Parameters:**
- `json` (string): JSON string with BigInt serialization

**Returns:**
- Parsed object with BigInt values restored

#### `subscribeToEvents()`
Main function that subscribes to Nostr events and processes UserOperations.

**Process:**
1. Subscribes to kind `96124` events from configured relays
2. Parses event content using `parseWithBigInt`
3. Converts BigInt values to hexadecimal strings
4. Submits UserOperation to bundler via `eth_sendUserOperation` RPC call

## Error Handling

The service includes comprehensive error handling:
- Try-catch blocks around UserOperation processing
- Console error logging for debugging
- Graceful handling of malformed events

## Development

### Code Structure

- **Main Entry Point**: `index.js`
- **Dependencies**: Defined in `package.json`
- **Configuration**: Hardcoded in the main file (consider moving to environment variables)

### Future Improvements

- Environment variable configuration
- UserOperation hash validation
- Retry logic for failed submissions
- Metrics and monitoring
- Docker containerization
