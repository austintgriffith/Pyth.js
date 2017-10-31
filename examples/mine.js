const Request = require('request');
require("../concurrence.js")({DEBUG: true},(err,concurrence)=>{
  concurrence.selectAccount(1)
  concurrence.startMining(10000)
  setInterval(()=>{
    console.log("!")
  },10000)
});
