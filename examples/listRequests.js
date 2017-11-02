/*
  List all the requests by events triggered

  usage:
  node listRequests
*/

let concurrence = require("../concurrence.js")
concurrence.init({},(err)=>{
  concurrence.listRequests().then((requests)=>{
    console.log(requests)
  })
});
