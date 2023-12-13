---
---

- Solidity is weird because you don't have any floats. On one hand, this is quite annoying for
- The standard solution - coins like ethereum, and many . Coins which don't need as much precision (e.g. usd.) can have (e.g. usdc, a stablecoin pegged after the U.S. Dollar, has 6 decimals)
  - For example, a balance of 10e18 (that is, 1 with 19 zeroes) corresponds with a float value of 10.0 ETHER.
- This is all fine and great, but now we're left with having to implement the on-chain arithmetic. Usually you can use pre-built solutions for this like AAVE's wadRayMul. Where a wad is the standard 1e18 (e.g. ) and for even more accurate decimal needs, you can use a ray, which formats decimals to 27 decimals. This is useful for
- But what happens when you have to _chain_ operations together? The are
