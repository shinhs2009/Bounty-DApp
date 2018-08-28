# Bounty-DApp
Bounty-DApp for Consensys 2018 Developer Course Final Project

Bounty-DApp provide cryptocurrencies(ETH) payment about Real-World Works like Part-time Job(For Example, Part-time Job etc..).

Bounty Owner can post Bounty for their work and Bounty Hunters can participate in Bounty.

## How to start?
1. Create directory and pull all the works.
2. Install ```lite-server``` to use local server.
```bash
$ npm install lite-server --save-dev
```
3. Run ```ganache``` App or ganache-cli
```bash
$ ganache-cli
```
4. Run ```lite-server```
```bash
$ npm run bounty
```

WebApp will run automatically by lite-server. Now you can interact with it!  
If it is not automatically opened, open URL http://localhost:3000/.  

Also I deployed my contract at Rinkeby Test Network. And Using IPFS to make fully decentralised Dapp.
You can visit this URL and interact with it in Rinkeby Test Network :  
https://gateway.ipfs.io/ipfs/QmUNqpaMufLb8F8ftDmpUocgrpfLWRjNf86THohDbFdPEG/

## Test
I create the test for the Ownable, Bounty Hub, Circuit Breaker and Library Demo.

All the functions in Bounty contract is used by BountyHub, so I don't test about it. And Bounty Hub inherits the Circuit Breaker, so I do test Circuit Breaker Design Pattern in the Bounty Hub Test.

And there's failed 3 test. 3 tests are success if it failed.
