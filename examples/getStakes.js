const Request = require('request');
let responseId = "0x523c92dc6cbb4e80ed109e82c8b4a8bf6e27d553c7867cb910201df8612d101a"

require("../concurrence.js")({DEBUG: true},(err,concurrence)=>{

  concurrence.staked(concurrence.selectedAddress,responseId).then((staked)=>{
    console.log("Account "+concurrence.selectedAddress+" has "+staked+" PTH staked on response "+responseId)
  })

});
