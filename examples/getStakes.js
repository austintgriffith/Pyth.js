const Request = require('request');
let responseId = "0x523c92dc6cbb4e80ed109e82c8b4a8bf6e27d553c7867cb910201df8612d101a"

require("../pyth.js")({DEBUG: true},(err,pyth)=>{

  pyth.staked(pyth.selectedAddress,responseId).then((staked)=>{
    console.log("Account "+pyth.selectedAddress+" has "+staked+" PTH staked on response "+responseId)
  })

});
