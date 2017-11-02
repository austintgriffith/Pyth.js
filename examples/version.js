/*
  Get version and main contract address

  usage:
  node version
*/

let concurrence = require("../concurrence.js")
concurrence.init({},(err)=>{
  console.log(concurrence.version)
  console.log(concurrence.contracts["Main"].address)
});
