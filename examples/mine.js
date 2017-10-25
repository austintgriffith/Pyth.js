const Request = require('request');
require("../pyth.js")({DEBUG: true},(err,pyth)=>{
  pyth.selectAccount(1)
  pyth.startMining(10000)


  setInterval(()=>{
    console.log("!")
  },10000)

});
