---
---

It's interesting how, when you take a different career path, some things which are from a completely different .

my junior year, I took CE192 in berkeley . The course was on using software optimizaiton to do things like interger programming, . Though these were interesting applications - applied to things like predicting earthquakes and storms(bayesian modeling), minimizing construction timelines (mixed interger programming), and optmiizing water supplies (lienar programming), and maximizing economic value of transportation systems. This is tin

- It's interesting to see these problem-solving tools pop up again in my career, even though I'm not quite working on anything remotely related to.
  I actually ended up using quite a similar thigng .
- Collateralized stablecoins are where you mint stablecoin. The supply is backed by certain.

  - For example, let's say you have your stablecoin pegged to usd. Typically, each collateral (other crypto tokens in this case), will have a collateralization ratio (usually greater than 1) that dictates how much of a collateral. For over collateralized tokens, you typically have a collateralization ratio greater than one - that means that the value of collateral you deposit to should be greater than. So let's say you have a minimum collateralization ratio of 1.1, the stablecoin protocol would assert that the amount of stablecoin you deposit would have to be at least (e.g. if you wnated to mint $10k usd worth of stablecoin, you'd have to deposit at least $1.1k worth of collateral, whatever that collateral might be).
  - That's all great and simple. You want x amount, you need to escrow at least 1.1x that much before you can min that. The hardest thing about this is multiplying/dividing by factors of 1.1.
  - But what happens when you have _multiple_ types of assets, each with their own unique collateralization facotr, backing the same stablecoin? E.g. if you have asset , how much would you have? And what happens when you want to _rebalance_?
    The typical use case in this is, when you want to . But when you want to? This is simple for the case of. But when you have multiple vaults you are drawing form (e.g. how you have in AAVE), this math can become pretty tedius.
    - This is where linear programming comes in.
      Linear programming is a way to optimize a linear objective function, subject to linear constraints.
    - In this case, we want to optimize the amount of stablecoin we can mint, subject to the constraint that we have to deposit at least 1.1x the value of the stablecoin we mint. But afte rdepositing, how much of addiional?

- In practice, each collateral tends to have it's own stablecoin.

Certain collateralized protocols might have
