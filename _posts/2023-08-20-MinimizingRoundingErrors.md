---
title: Arithmetic in Solidity is a Headache
---

TLDR: Dealing with Solidity arithmetic is non-trivial. I built a [tiny JavaScript library](https://www.npmjs.com/package/solidity-fixed-point-arithmetic) to help with this.

Solidity is weird because it doesn't have a float primitive. I imagine this is because integer types are much easier to reason about and implement. Smart contracts are designed to be auditable and transparent and Solidity opcodes consume crypto to run on the blockchain, so adding a float primitive might add more complexity than it's worth.

## Decimal Formatting

But what happens when we need to deal with decimals? The standard solution is to use large integers, and allocate the right most digits as the decimals. ERC20 tokens have a required [`decimal`](https://docs.openzeppelin.com/contracts/4.x/erc20#a-note-on-decimals) field which represents the amount of digits allocated for decimals. For most tokens (e.g. [wrapped Ether](https://etherscan.io/token/0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2)), this is is equal to 18 - meaning the 18 right most digits of a token balance represent the decimals. Tokens which don't need as much precision can have lower decimals (e.g. USDC, which has 6 decimals). For example, a balance of 5 Wrapped Ether would be represented as 5e18 (that is, 5 with 18 zeroes following it). This is basically [fixed point arithmetic](https://en.wikipedia.org/wiki/Fixed-point_arithmetic), except we don't have the benefit of a language implementing the abstraction for us, so we're stuck with having to deal with this formatting ourselves.

### Solidity Arithmetic Libraries

Problems quickly arise when we need to do arithmetic on integers formatted as decimals - naively using \* or / to multiply or divide would yield numbers that are incorrect by orders of magnitude. If we naively multiplied 5 wETH (represented on-chain as 5e18) with 5 wETH (represented on-chain as 5e18), we'd get 25e36 , while the correct answer should have been 25e18 (we're off by a factor of 1e18!). Similar problems arise for division, but instead of overly large numbers, we get overly small numbers.

Luckily, for Solidity code, there are on-chain libraries like [AAVE's Wad Ray Math](https://github.com/aave/aave-protocol/blob/master/contracts/libraries/WadRayMath.sol), or [Open Zeppelin's Math library](https://docs.openzeppelin.com/contracts/2.x/api/math) that add and remove decimal padding for arithmetic operations. These libraries correct the errors that occur when doing arithmetic on large integers, and also round the results correctly (Solidity by default always rounds down, which doesn't maximize precision).

## Maximizing Precision

### Multiplying and Dividing

Though if you're using these libraries, it's important to know how they work under the hood, so that you can maximize precision. For example, if you're multiplying by a factor and then dividing by another factor, which operation should you do first to maximize precision? To preserve precision in regular arithmetic, you should always _maximize_ immediate numbers between operations before you minimize them. So, if you were multiplying by a factor greater than 1 and then dividing by a factor greater than 1, you should multiply first and then divide to maximize your precision. The converse applies for for dividing.

With fixed point arithmetic and using Solidity libraries, this becomes slightly more complicated. Instead of the factor you multiply with being greater than 1, it needs to be greater than _1 formatted to the decimals you're working with_. So for example, if you were multiplying using `wadMul` from the `WadRayMath` library, you should only multiply first if the factor you are multiplying with is greater than `1 wad`.

### Additional Accuracy

If you're dividing or multiplying by really large numbers, you can lose a lot of precision. One way to combat this is to store intermediate state that is in a higher decimal precision than the operation inputs and outputs. For example, if you're multiplying or dividing balances that are formatted to 18 decimals, you can gain some precision by first formatting the inputs to 27 decimals by padding 9 extra digits, doing the operations, and then formatting back to 18 decimals by removing the padding of 9 digits.

## Precision Bounds and Significant Figures

It's generally a good idea to know how different operations impact precision. I'd recommend brushing up on the rules of [significant figures](https://en.wikipedia.org/wiki/Significant_figures) to get a sense of how precision is impacted by arithmetic. This can help you make tradeoffs between low precision and higher code complexity and gas costs.

# Solidity Arithmetic In Javascript

Though Solidity libraries are themselves quite comprehensive, sometimes you need to do this arithmetic in Javascript - for example, if you have a React frontend that needs to send transactions that require computing token balances. Sadly, I haven't yet encountered a good solution to this - so I built my own [here](https://www.npmjs.com/package/Solidity-fixed-point-arithmetic)!
