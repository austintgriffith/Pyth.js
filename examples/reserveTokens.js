/*
  Reserve tokens behind a request to incentivize miners

  usage:
  nnode reserveTokens ##REQUESTID## ##AMOUNT##

  example:
  node reserveTokens 0x0b54d5da066a0c753ddd0510d445e131cb21f9373f4c3609100419ae4d95908d 100
*/

const fs = require("fs")

if(!process.argv[2]){
  console.log("Please provide a request id.")
  process.exit(1)
}
let requestId = process.argv[2];

if(!process.argv[3]){
  console.log("Please provide a number of tokens to reserve.")
  process.exit(1)
}
let tokens = process.argv[3];

let concurrence = require("../concurrence.js")
concurrence.init({},(err)=>{
  concurrence.selectAccount(2)
  concurrence.reserve(requestId,tokens).then((reserveResult)=>{
    console.log(reserveResult)
  })
});
