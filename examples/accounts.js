/*
  Get list of accounts

  usage:
  node accounts
*/

let concurrence = require("../concurrence.js")
concurrence.init({},(err)=>{
  console.log(concurrence.accounts)
});
