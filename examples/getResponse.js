/*
  Get a response's details

  usage:
  node getResponse ##RESPONSEID##

  example:
  node getResponse 0xd8293d3302f88fcc7f940ef5d00542416c46d89daaaf5c51aa14e0c89d45200b
*/

if(!process.argv[2]){
  console.log("Please provide a response id.")
  process.exit(1)
}
let responseId = process.argv[2];

let concurrence = require("../concurrence.js")
concurrence.init({},(err)=>{
  concurrence.getResponse(responseId).then((response)=>{
    console.log(response)
    console.log("RESPONSE:"+concurrence.web3.utils.toAscii(response[1]))
  })
});
