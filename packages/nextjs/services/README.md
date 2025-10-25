# Nostr Services Architecture

This directory contains a well-structured, type-safe Nostr service layer that eliminates code duplication and follows NextJS best practices. The architecture integrates seamlessly with global state management and provides robust error handling.

## Architecture Overview

### 📁 File Structure

```
services/
├── nostrCore.ts              # Core business logic (pure functions)
├── nostrService.types.ts     # TypeScript interfaces & error types
├── nostrService.ts           # Client-side service (uses global state)
├── nostrService.server.ts    # Server-side service (API routes)
├── evmAddressService.ts      # EVM address API client service
└── README.md                 # This documentation
```

### 🏗️ Design Principles

1. **Single Responsibility**: Each file has a clear, single purpose
2. **DRY Principle**: No code duplication between client and server
3. **Type Safety**: Full TypeScript support with interfaces and custom error types
4. **Separation of Concerns**: Business logic separated from environment-specific code
5. **Error Handling**: Consistent error handling with custom error classes
6. **Global State Integration**: Client services use global state for configuration
7. **Server-Safe**: Server services avoid client-side dependencies

## 📋 Service Layers

### 1. `nostrCore.ts` - Core Business Logic
- **Purpose**: Pure functions that work everywhere (client/server)
- **Contains**: 
  - `decodeNpub()` - Decode npub to hex public key
  - `encodeNpub()` - Encode hex public key to npub
  - `getChainById()` - Chain selection using Scaffold-ETH utilities
  - `getEthAddressFromNpub()` - Core address resolution logic
- **No Dependencies**: No client/server specific imports

### 2. `nostrService.types.ts` - TypeScript Interfaces & Error Types
- **Purpose**: Type safety and consistent API contracts
- **Contains**:
  - `NostrServiceInterface` - Base interface
  - `ClientNostrServiceInterface` - Client-specific methods
  - `ServerNostrServiceInterface` - Server-specific methods
  - `NostrServiceError` - Custom error class with error codes
  - `NostrServiceConfig` - Configuration interface

### 3. `nostrService.ts` - Client Service
- **Purpose**: Browser-specific functionality with global state integration
- **Features**:
  - Nostr extension integration
  - Global state synchronization
  - Event dispatching
  - Cached public key management
  - Automatic chain ID resolution from global state
- **Implements**: `ClientNostrServiceInterface`

### 4. `nostrService.server.ts` - Server Service
- **Purpose**: API route functionality (server-safe)
- **Features**:
  - Server-safe operations
  - Chain ID parameter validation
  - No client dependencies
  - Robust error handling
- **Implements**: `ServerNostrServiceInterface`

### 5. `evmAddressService.ts` - EVM Address API Client
- **Purpose**: Client-side API communication
- **Features**:
  - Global state integration for base URL configuration
  - Type-safe API responses
  - Error handling with error codes
  - Abort signal support for request cancellation

## 🚀 Usage Examples

### Client-Side Usage
```typescript
import { nostrService } from "~~/services/nostrService";
import { getEvmAddressFromNpub } from "~~/services/evmAddressService";

// Connect to Nostr extension (updates global state)
const pubkey = await nostrService.connect();

// Get npub (from global state if available)
const npub = nostrService.getNostrNpub();

// Get ETH address (uses current network from global state)
const ethAddress = await nostrService.getEthAddress(npub);

// Or use API client service
const ethAddress2 = await getEvmAddressFromNpub(npub, 8453);
```

### Server-Side Usage (API Routes)
```typescript
import { nostrServiceServer } from "~~/services/nostrService.server";

// Get ETH address for specific chain (with validation)
const ethAddress = await nostrServiceServer.getEthAddress(npub, 8453); // Base
```

### Direct Core Usage
```typescript
import { decodeNpub, getEthAddressFromNpub } from "~~/services/nostrCore";

// Pure function usage
const pubkey = decodeNpub(npub);
const ethAddress = await getEthAddressFromNpub(npub, 8453);
```

### Error Handling
```typescript
import { NostrServiceError } from "~~/services/nostrService.types";

try {
  const address = await nostrService.getEthAddress(npub);
} catch (error) {
  if (error instanceof NostrServiceError) {
    console.error(`Error ${error.code}: ${error.message}`);
    // Handle specific error codes
    switch (error.code) {
      case 'INVALID_NPUB':
        // Handle invalid npub
        break;
      case 'CONNECTION_FAILED':
        // Handle connection issues
        break;
    }
  }
}
```

## ✅ Benefits

1. **Zero Duplication**: All shared logic is in `nostrCore.ts`
2. **Type Safety**: Full TypeScript support with interfaces and custom error types
3. **Maintainability**: Changes to core logic only need to be made once
4. **Testability**: Pure functions can be easily unit tested
5. **Scalability**: Easy to add new chains or functionality
6. **NextJS Best Practices**: Proper separation of client/server code
7. **Error Handling**: Consistent error handling with custom error classes
8. **Global State Integration**: Seamless integration with app-wide state management
9. **Server-Safe**: Server services avoid client-side dependencies
10. **API Client**: Dedicated service for API communication with proper error handling

## 🔧 Adding New Features

1. **Core Logic**: Add pure functions to `nostrCore.ts`
2. **Types**: Update interfaces in `nostrService.types.ts`
3. **Client**: Add client-specific methods to `nostrService.ts`
4. **Server**: Add server-specific methods to `nostrService.server.ts`

This architecture ensures maintainable, scalable, and type-safe Nostr integration across your NextJS application.
