const Request = require('request');

let responseId = "0xfa6df6e4892eb6a2e272d3deafe1ddd1161bdf8f830ff446725a440d5c37b6ff"

require("../pyth.js")({DEBUG: true},(err,pyth)=>{

  pyth.selectAccount(1)

  pyth.stake(responseId,1).then((result)=>{
    console.log(result)
  })

});
