const Request = require('request');
let requestId = "0x2365f7f8bce9a1f15da3ea8bd3d415a828766bf1525969eb758e7174809dacef"
require("../pyth.js")({DEBUG: true},(err,pyth)=>{
console.log("Listing responses with to request:"+requestId)
  pyth.listResponses(requestId).then((responses)=>{
    console.log(responses)
  })
});
