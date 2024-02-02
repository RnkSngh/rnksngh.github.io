---
title: Protecting against Reentrancy Attacks isn't as Simple as Following CEI
---

in 2016, [a reentrancy attack](https://www.coindesk.com/consensus-magazine/2023/05/09/coindesk-turns-10-how-the-dao-hack-changed-ethereum-and-crypto/) drained a smart contract of 3.6 million Ether (now worth $billions) and caused a hard-fork of the Ethereum network. In this case, the ordering of three lines of code was the the root of the vulnerability. Because the attack was so substantial, and because it used quite an interesting exploit, most Solidity developers are familiar with this attack and use the common Checks-Effects-Pattern (CEI) to prevent against it. But I've also encountered (both myself and from others) quite a bit of confusion on exactly how following this pattern prevents against attacks. So I wanted to write about it, and in a way that non-Solidity devs can also understand. 

In this post, I'll review what reentrancy attacks are and why they are protected by following CEI, so that I can then talk about why it's not the only way to protect against reentrancy attacks.



# Checks, Effects, and Interactions

Ok. So how does it work?

Let's say you have a smart contract that allows users to deposit ETH and get some shares in return. It's not entirely relevant what these shares represent - it can be anything, from shares of an token, or voting power in a DAO, or how many times people will launch another NFT platform. But the main point is that users deposit ETH to the smart contract, and there's shares accounting done to keep track of how much everyone is owed. 

Everyone pools their money into the same smart contract, and gets shares in return. You or any user can exchange ETH for shares by depositing ETH to this contract, or you can exchange shares for ETH by withdrawing ETH. Let's assume these shares are stored in an internal mapping called `shares` that maps addresses to how many shares they own, and that each share is worth 1 wei of ETH. 

A (seemingly) sensible withdraw function for this contract might look like this:

<div class="codeDiv">
  <code >
    <pre>

  contract ImportantUnHackableContract {
    ...
    Other Irrelevant stuff
    ...

      function withdraw(uint amount) public {
        require(amount <= shares[msg.sender], "Insufficient balance");
        (bool success, ) = msg.sender.call{value: amount}("");
        shares[msg.sender] -= amount;
    }
  }
    </pre>
  </code>
</div>

Let's go through the `withdraw` function line-by-line:

<div class="codeDiv">
  <code >
    <pre>
    <span>// Reverts the tx if you don't have enough shares</span>
    require(amount <= shares[msg.sender], "Insufficient balance");
    </pre>
  </code>
</div>



This line ***checks*** that the amount of shares any user can withdraw is less than the amount they own, and reverts the transaction if anyone tries to withdraw more shares than they own. Pretty straightforward.

<div class="codeDiv">
  <code >
    <pre>
    <span>// Transfer ETH to sender </span>
    (bool success, ) = msg.sender.call{value: amount}("");
    </pre>
  </code>
</div>

`msg.sender.call{value:amount}` is Solidity code for "send `amount` of ETH to the transaction sender (i.e. the person who is withdrawing their shares)". We decrement the user's shares in the next line, so we send them their ETH on this line. We send it by ***interacting*** with the sender of the transaction. Also pretty straightforward.

<div class="codeDiv" >
  <code >
    <pre>
    <span>// Update share accounting </span>
    shares[msg.sender] -= amount;
    </pre>
  </code>
</div>

This line updates our accounting of how many shares each user is owed. In other words, it implements the ***effects*** of the withdrawal. Also straightforward.

Seems simple enough, right? Real grade-A, airtight logic here right? You'd trust this with arbitrary amounts of your and your users' crypto right? Smart contracts are secure right? Web3 is the next internet right?

Not quite.

# YARAE (Yet Another Reentrancy Attack Explanation)

So what's unsafe about this? This all falls apart if you consider that every time you transfer ETH in a smart contract, the transaction sender can trigger callback functions. Imagine that, instead of an end user, it was another smart contract (which Solidity is designed to be able to do!) that initialized the `withdraw` call. This attacking contract can do malicious, naughty things in the callback of the `withdraw` call during the transfer.

Specifically, an attacking contract can wreak havoc if it recursively calls the withdraw function _again_ in the transfer callback. This is what's known as a _reentrancy_. Why is this bad? If an attacking contract re-enters after we've preformed the shares balance _check_ but before we've actually decremented the shares, the user gets free ETH transferred to them.

In code, this is how the reentrancy would look like:

<div class="codeDiv" >
  <code style="max-width:100px">
    <pre >
    <span >// Attacker starts by calling the withdraw function </span>
    function withdraw(uint amount) public {
        require(amount <= shares[msg.sender], "Insufficient balance");
        <span>/* Transfer ETH to sender */</span>
        (bool success, ) = msg.sender.call{value: amount}(""); 

        <span >/* The above line triggers a callback, which the attacker uses to 
        recursively call this function before running the effects*/</span>
        function withdraw(uint amount) public {
            require(amount <= shares[msg.sender], "Insufficient balance");

            <span>/* Transfer ETH sender ⚠️AGAIN⚠️ */</span>
            (bool success, ) = msg.sender.call{value: amount}(""); 
                  
            <span >
              /* The above line triggers a callback, which the attacker uses to 
              recursively call this function */</span>
              function withdraw(uint amount) public {
                require(amount <= shares[msg.sender], "Insufficient balance");

                <span>/* Transfer ETH sender ⚠️AGAIN⚠️ */</span>
                (bool success, ) = msg.sender.call{value: amount}(""); 

                  ...... and so on
              }
          }


        <span>// Once we finally get to to the line below, the user has already 
        transferred ETH many many times! </span>
        shares[msg.sender] -= amount;
    }
    </pre>
  </code>
</div>

# How does CEI prevent this?

CEI is a pattern that refers to the ordering of each of the 3 lines. Following the pattern means that you do your checks first, then your effects, then your interactions. So that if someone does re-enter the contract, they only do so _after_ you've already done your checks.

For our example, code that correctly follows the CEI pattern would look like this:

<div style="background-color: #FAF9F6; " class="codeDiv" >
  <code >
    <pre>
  function withdraw(uint amount) public {
    require(amount <= shares[msg.sender], "Insufficient balance"); <span>// Checks </span>
    shares[msg.sender] -= amount; <span>// Effects </span>
    (bool success, ) = msg.sender.call{value: amount}(""); <span>// Interactions </span>
  }
    </pre>
  </code>
</div>

With this code, even if an attacking contract recursively calls the `withdraw` function, it would look like this:

<div style="background-color: #FAF9F6; " class="codeDiv" >
  <code >
    <pre>
    <span>// Attacker calls the withdraw function </span>
    function withdraw(uint amount) public {
        require(amount <= shares[msg.sender], "Insufficient balance");
        shares[msg.sender] -= amount;
        <span>/* Transfer ETH to the sender */</span>
        (bool success, ) = msg.sender.call{value: amount}(""); 

        <span>// The above line triggers a callback, but only after we ran the
        effects line </span>
        function withdraw(uint amount) public {
        <span>/* This time around, the tx is reverted if the attacker 
        withdraws more than they own, since the shares were already updated */</span>
          require(amount <= shares[msg.sender], "Insufficient balance");

        }
    }
    </pre>
  </code>
</div>

In this case, even though the attacker can re-enter the contract, they can't actually withdraw more than they own, since the shares accounting is kept up to date between each recursive call.

## Other Patterns that can also Prevent Reentrancy Attacks

If you really think about it, CEI isn't the only pattern which you have to follow to protect against this attack. For example, following an I-E-C (interactions, effects, checks) or I-C-E (interactions, checks, effects) are also theoretically ok patterns to use.

I-E-C:

<div style="background-color: #FAF9F6; " class="codeDiv">
  <code >
    <pre>
    function withdraw(uint amount) public {
        (bool success, ) = msg.sender.call{value: amount}(""); <span>// Interactions </span>
        shares[msg.sender] -= amount; <span>// Effects</span> 
        require(amount <= shares[msg.sender], "Insufficient balance"); <span>// Checks</span>
    }
    </pre>
  </code>
</div>

In this case, an attacker can technically re-enter the contract after the first line is executed, but this is just equivalent to calling the function multiple times. All recursive calls where the attacker withdraws more up reverting due to the check, so no ETH is transferred in those calls.

I-C-E:

<div style="background-color: #FAF9F6; " class="codeDiv">
  <code >
    <pre>
    function withdraw(uint amount) public {
        (bool success, ) = msg.sender.call{value: amount}(""); <span>// Interactions </span>
        require(amount <= shares[msg.sender], "Insufficient balance");<span>// Checks </span> 
        shares[msg.sender] -= amount; <span>// Effects </span>
    }
    </pre>
  </code>
</div>

Similar to IEC, this is also similar to just calling the function many times, and each call where the user tries to withdraw more than they have ends up reverting, as was originally intended.

### Why Does This Matter?

I never like to advocate for following a new pattern to be different. Just because you _can_ follow another reentrancy-resistant pattern doesn't mean that you should. There's still many many good reasons to follow the CEI pattern - it's the widely used convention, and code is easier to reason about when you don't have to think about injecting other code between the lines of your functions. You should absolutely follow CEI whenever you can. Following another pattern creates friction when other people try to understand your code, so you should only do it if you have good reason to.  

But there *are* good reasons to - you can't always follow CEI. Some tokens have [rounding errors](https://parse.rnksngh.com/2023/08/20/MinimizingRoundingErrors.html) or will otherwise yield differing amounts between *requested* transfer amounts and *actual* transfer amounts, meaning you have to preform the interaction first to know what effects it should have. In these cases, it might make sense to do effects first, but still follow a reentrancy-resistant pattern.

### Other Best Practices to Follow For Avoiding Reentrancy Attacks

Even if it is sufficient, following the CEI pattern isn't the *only* pattern you should use to protect your code. When dealing with important smart contracts, it's wise to have many fail-safes. In addition to following safe patterns, Other good practices to protect against reentrancy attacks are:

- • Inherit your contracts from [Open Zeppelin's Reentrancy Guard](https://docs.openzeppelin.com/contracts/4.x/api/security#ReentrancyGuard)
- • Avoid using tokens that trigger callbacks (e.g. use wETH or most ERC20 tokens) 
- • Use proxy contracts to limit the balance of any single smart contract
- • Use invariant testing to test properties of your contracts that should never be invalidated!

Happy coding! 
