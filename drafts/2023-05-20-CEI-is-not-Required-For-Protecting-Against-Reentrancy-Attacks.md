---
---

Post 1: Why CEI Isn't Always Required to prevent against

- Attack - worth a lot of $$ in 2016
- How to prevent this: CEI
- But it's not the only way to prevent this
- But why do we care? Mainly for cases wehre you won't know how many to interact with

Intro:
in 2016, a reentrancy attack contributed to a hard-fork of the ethereum network. Because the order of three lines was off, a hacker was able to steal millions (now worth billions) of dollars worth of ethereum. Because they are so dangerous, and because the attack itself is quite an interesting one technically, most solidity developers know what they are and know how to solve for them. Typicaly, for interactions with unknown contracts, teh CEI-pattern is often used.

## What is the CEI pattern

The typical, most safe way

What if you didn't follow it?
They could _reenter_ i.e. recursively call your function through an external contract, and call your function again before the first call finished. This could be done by calling the function again within the same transaction, or by calling the function again within a different transaction. The briance of ethereum is that it can

On one hand, this is . But sometimes knowing how to do something in a hackey way can be really useful. After all, it gave the DAO hacker billions.

However, a lot of developers don't know that CEI isn't the only option in solidity code, and when you need to follow a different pattern, is important to know that there are other safe patterns to follow.
Following CEI should prevent reentrancy attacks. Just rearranging the same lines of code can make this happen.

I remember first learning about the checks-effects-interactions pattern when I was working through the open zeppelin's Ethernauts [LINK]; and found it absolutely fascinating that order of three lines of code can determine whether or not your code has a severe vulnerability.
irst, to know why we need this defense, we need to know what we're defending against. What is a reentrancy attack?
A reentrancy attack is one where an attacker can exploit an external call that can trigger. Technically, this can happen with any-open ended. Thoguh a lot of the times, this is specifically with the transfer functions; which can trigger contract callbacks like the onTransfer functions. this is also a danger with events tokens.
Ok; but how does following the CEI pattern somehow magically prevent us from this?
The quintessential example of checks, effects, interactions is modifying some state based on some transfers. The check is that the user has enough shares to withdraw the number of tokens. The effect is that it decrements the shares. The interaction is transferring the shares; and that is the most problematic part.
One with CEI and one without;
Code examples from repo
And yet, there is another pattern that you can use to avoid reentrancy attacks. In fact, there are two other patterns - ICE and CIE, that are both non-vulnerable to these patterns.
Why is this? Reentrancy attacks work by relying on a certain order.
The dangerous things with reentrancies aren't that they are recursively called - you can already do this with multicall contracts; and lumping in multiple function calls within a transaction should always be allowable. The dangerous thing is injecting the order in which transactions are done, and calling functions within a single transaction. It doesn't matter if you do multiple interactions within the same transaction or block, but it does matter if you do them between the checks and the effects- so the number of effects becomes much higher than the number of interactions done.
Thus, you can still . This doesn't mean that technically the contract can reenter the contract can technically cal multiple. But all that would happen is that the attacker can call transfer multiple times. THough the order - so it would be pretty much equivalent of calling the method multiple times; which anyone can already do, even if you use CEI.
Of course, you could just use Openzeppelin's non-reentrant modifier- but one level of defense is sometimes not enough. Even when following the CEI patterns I like to use the nonReentrant modifiers when there is a potential for this, just to have multiple failsafes - which you should definitely have if you are writing immutable code that could potentially handle billions of $$.
As always, it's highly recommended to use sophisticated tools like invariant and fuzz testing to continue to test your smart contracts even in unintuitive ways that you don't intend them to be used in.
When would you need to use CEI?
You should always use CEI if you can. Having a single standard for code makes it more readable (and therefore more auditable). CEI ensures that all of your function logic has executed , so it's as close to as you can get to calling the transfer in a completely seperate method call; thus isolating your smart contract from any unforseen state mutations. Though there are certain situations where you just need to. :
Tokens that don't always gaurantee full transfers of the requested amount
Rebase tokens: if you are working with a protocol that utilizes rebase tokens in some way, not all of them. I'm not talking about - for example AAVE rebase tokens do the same.
A lot of protocols with fee-on-transfer tokens have these as well. -->
