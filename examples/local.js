/*
  Get version and main contract address but from a local server

  usage:
  node local
*/

let concurrence = require("../concurrence.js")
concurrence.init({DEBUG:true,server:"localhost"},(err)=>{
  console.log(concurrence.version)
  console.log(concurrence.contracts["Main"].address)
});
