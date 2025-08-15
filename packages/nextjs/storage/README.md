# Chain Storage Module

This module provides comprehensive chain selection and persistence functionality for the ethstr multichain NextJS application.

## Features

- 🌐 **Multiple Storage Options**: LocalStorage, SessionStorage, and In-Memory
- ⚛️ **React Hooks**: Easy integration with React components
- 🔄 **Real-time Updates**: Event-based chain change notifications
- 🛡️ **Type Safety**: Full TypeScript support with chain validation
- 🖥️ **SSR Compatible**: Works with Next.js server-side rendering

## Quick Start

### Basic Usage

```typescript
import { getSelectedChain, setSelectedChain } from "./storage";

// Get the currently selected chain
const currentChain = getSelectedChain(); // Returns: "sepolia" | "base" | "coredao"

// Set a new chain
setSelectedChain("base");
```

### React Hooks

```typescript
import { useSelectedChain, useCurrentChain, useSelectedChainConfig } from './storage';

function ChainSelector() {
  const [selectedChain, setSelectedChain] = useSelectedChain();

  return (
    <select
      value={selectedChain}
      onChange={(e) => setSelectedChain(e.target.value as SupportedChain)}
    >
      <option value="sepolia">Sepolia Testnet</option>
      <option value="base">Base</option>
      <option value="coredao">CoreDAO Testnet</option>
    </select>
  );
}

function ChainDisplay() {
  const currentChain = useCurrentChain();
  const chainConfig = useSelectedChainConfig();

  return (
    <div>
      <h3>Current Chain: {chainConfig.name}</h3>
      <p>Chain ID: {chainConfig.chainId}</p>
      <p>Currency: {chainConfig.currency}</p>
    </div>
  );
}
```

## API Reference

### Storage Functions

#### `getSelectedChain(): SupportedChain`

Returns the currently selected chain. Defaults to the configured default chain if none is set.

#### `setSelectedChain(chainName: SupportedChain): void`

Sets the selected chain and persists it to storage. Throws an error if the chain is not supported.

#### `clearSelectedChain(): void`

Clears the selected chain from storage and resets to the default chain.

#### `isChainSupported(chainName: string): boolean`

Checks if a chain name is supported by the application.

#### `getAllSupportedChains(): SupportedChain[]`

Returns an array of all supported chain names.

### Storage Classes

#### `createChainStorage(type: "localStorage" | "sessionStorage" | "memory"): ChainStorage`

Factory function to create different types of storage backends.

- **localStorage**: Persists across browser sessions
- **sessionStorage**: Persists only for the current session
- **memory**: In-memory only (useful for testing or SSR)

### React Hooks

#### `useSelectedChain(): [SupportedChain, (chain: SupportedChain) => void]`

React hook that returns the current chain and a setter function. Automatically updates when the chain changes.

#### `useCurrentChain(): SupportedChain`

Read-only hook that returns the current selected chain.

#### `useSelectedChainConfig()`

Returns the full chain configuration object for the currently selected chain.

## Events

The storage system dispatches custom events when chains change:

### `chainChanged`

Fired when a new chain is selected.

```typescript
window.addEventListener("chainChanged", (event: CustomEvent) => {
  console.log("New chain:", event.detail.chainName);
  console.log("Chain config:", event.detail.chainConfig);
});
```

### `chainCleared`

Fired when the chain selection is cleared.

```typescript
window.addEventListener("chainCleared", (event: CustomEvent) => {
  console.log("Reset to default:", event.detail.defaultChain);
});
```

## Advanced Usage

### Custom Storage Backend

```typescript
import { createChainStorage } from "./storage";

// Use session storage instead of local storage
const sessionStorage = createChainStorage("sessionStorage");

// Use in-memory storage (useful for testing)
const memoryStorage = createChainStorage("memory");
```

### Manual Event Handling

```typescript
import { useChainChangeListener } from "./storage";

function MyComponent() {
  useEffect(() => {
    const cleanup = useChainChangeListener(newChain => {
      console.log("Chain changed to:", newChain);
      // Your custom logic here
    });

    return cleanup; // Cleanup listeners on unmount
  }, []);
}
```

## Integration with Chain Configuration

The storage module automatically integrates with your `chains.config.ts` file:

- Validates chain names against supported chains
- Uses the configured default chain
- Provides access to full chain configurations
- Ensures type safety across the application

## Error Handling

The storage system includes comprehensive error handling:

- Invalid chain names throw descriptive errors
- Storage failures are logged and handled gracefully
- SSR compatibility prevents client-only code from running on the server
- Fallback to default chain when stored values are invalid

## Best Practices

1. **Use React Hooks**: Prefer `useSelectedChain()` over direct storage access in components
2. **Handle Loading States**: Account for SSR by checking if the component is mounted
3. **Listen to Events**: Use events for cross-component communication about chain changes
4. **Validate Chains**: Always validate chain names before setting them
5. **Error Boundaries**: Wrap chain-dependent components in error boundaries

## Example: Complete Chain Selector Component

```typescript
import React from 'react';
import { useSelectedChain, getAllSupportedChains } from './storage';
import { getChainConfig } from '../../../chains.config';

export function ChainSelector() {
  const [selectedChain, setSelectedChain] = useSelectedChain();
  const supportedChains = getAllSupportedChains();

  return (
    <div className="chain-selector">
      <label htmlFor="chain-select">Select Network:</label>
      <select
        id="chain-select"
        value={selectedChain}
        onChange={(e) => {
          try {
            setSelectedChain(e.target.value as SupportedChain);
          } catch (error) {
            console.error('Failed to switch chain:', error);
          }
        }}
      >
        {supportedChains.map((chainName) => {
          const config = getChainConfig(chainName);
          return (
            <option key={chainName} value={chainName}>
              {config.name} {config.testnet ? '(Testnet)' : ''}
            </option>
          );
        })}
      </select>
    </div>
  );
}
```

This storage module provides a robust foundation for multichain support in your ethstr application!
