## Used Design Pattern
1. Factory
One address can make many bounties. I think Factory Design Pattern like TokenFactory example is perfect for bounty-dapp.

2. Restricting Access  
Some functions should run by owner. So I use Restrict Access Pattern by using modifier onlyOwner inherited from openzeppelin Owner.sol.
```solidity
modifier onlyOwner {
  require(msg.sender == owner);
}
```

3. Circuit Breaker

In emergency, Circuit Breaker will work and All the functions stopped. Only Owner can use the contract in emergency, so Circuit Breaker contract inherits Owner contract.

4. State machines

Bounty State is work by State. Now there are two state "Posted" and "Finished".  
In Posted state, hunters can submit work and bounty owner can accept their work.  
In Finished state, hunters can't submit work and bounty Owner send ether to their account.  
I will add more state like "Expired" to add 
