# Concurrence.js
Javascript library for interacting with [Concurrence](http://concurrence.io) smart contract fleet




## Troubleshooting

Concurrence.js keeps a file cache at ".concurrence" and sometimes during development this cache grows stale. You may see messages about contracts not being there:
```Unhandled rejection Error: Given address "0x" is not a valid Ethereum address.```
First try removing the .concurrence folder to prevent these errors and force your machine to lookup the contract addresses.
