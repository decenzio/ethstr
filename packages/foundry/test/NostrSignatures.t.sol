// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "../lib/forge-std/src/Test.sol";
import "../src/NostrSignatures.sol";

/*
{
"created_at": 0,
"kind": 96024,
"tags": [],
"content": "0000000000000000000000000000000000000000000000000000000000000000",
"pubkey": "2e7b0e5aae374d0ed1fab6cc877a969716ea48a710176a035398635e5d660dc1",
"id": "54ffbfbb8a4f76991c9f2401943b9b4d4f10084863ec7ea538bad2ded3d56892",
"sig": "a35749d6174451de16fb286096858cb33d7b66c9583024fd2a5cd7b57a763ec85d99ddb0711044498c362be7c82e524a9845e09f634bbf11d87fccc2bcfe2202"
}
*/

contract NostrSignaturesTest is Test {

  function test_nostrSignature() pure public {
    require(NostrSignatures.verifyNostrSignature(
      0x2e7b0e5aae374d0ed1fab6cc877a969716ea48a710176a035398635e5d660dc1,
      hex'a35749d6174451de16fb286096858cb33d7b66c9583024fd2a5cd7b57a763ec85d99ddb0711044498c362be7c82e524a9845e09f634bbf11d87fccc2bcfe2202',
      0x0000000000000000000000000000000000000000000000000000000000000000
    ), "invalid signature");
  }
}

