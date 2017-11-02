/*
  Get the head of the responses linked list

  usage:
  node getHead ##REQUESTID##

  example:
  node getHead 0x147b833db65b9d9a4321ba3fa0f476265ebb178531de166477822204268f6d88
*/

if(!process.argv[2]){
  console.log("Please provide a request id.")
  process.exit(1)
}
let requestId = process.argv[2];

let concurrence = require("../concurrence.js")
concurrence.init({},(err)=>{
  concurrence.getHead(requestId).then((head)=>{
    console.log(head)
  })
});
