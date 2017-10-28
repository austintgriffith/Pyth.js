const Request = require('request');
let requestId = "0xf570c082d7e98e79b973942228bfd4ed17fba18abb20c2a1c54c478562854b04"
require("../concurrence.js")({DEBUG: true},(err,concurrence)=>{
  concurrence.getHead(requestId).then((head)=>{
    console.log("HEAD:"+head)
    concurrence.listResponses(requestId).then((responses)=>{
      console.log(responses)
    })
  })
});
