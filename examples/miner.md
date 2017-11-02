---
title: "Request Miner"
date: 2017-09-21T05:00:00-06:00
---
The **Miner** performs off chain requests and forms a consensus using IPFS pubsub. It also requires a running version of Geth with either an IPC or RPC connection.

Later versions will have fallback layers that will allow miners to contact **Concurrence** servers instead of talking directly to the Ethereum and IPFS networks. This will enable different layers of connectivity and give basic miners direct access without having the blockchain downloaded locally.  

<!--RQC CODE javascript concurrence.js/concurrence.js -->
