const Request = require('request');
let address = "0x320A214e29026976EC020CFf207336c2D6F673b8"
require("../concurrence.js")({DEBUG: true},(err,concurrence)=>{

  concurrence.debugCombiner(address).then((list)=>{
    console.log(list)
  })
});
