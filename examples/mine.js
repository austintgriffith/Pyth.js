const Request = require('request');
const AMOUNT_TO_STAKE = 1
const DEBUG_MINER = true;

let MINING = false

let pyth;

require("../pyth.js")({DEBUG: true},(err,_pyth)=>{
  pyth=_pyth;

  pyth.selectAccount(1)
  pyth.syncRequests(6000)
  pyth.syncReserved(6000)
  pyth.syncMineQueue(6000)

  setInterval(()=>{
    if(!MINING){
      if(DEBUG_MINER) console.log("#")
      for(let i in pyth.mineQueue){
        let requestToMine = pyth.mineQueue[i]
        if(DEBUG_MINER) console.log("# MINE REQUEST: "+requestToMine+"")
        MINING = requestToMine
        mineRequest(MINING)
        break
      }
    }
  },1000)
});


function mineRequest(requestId){
  console.log(" # ### MINING request "+requestId)
  try{
    let request = JSON.parse(pyth.requests[requestId].request);
    let parser = JSON.parse(pyth.requests[requestId].parser)
    console.log(" ## URL: "+request.url)
    Request(request.url,(error, response, body)=>{
      console.log(body);
      pyth.addResponse(requestId,body).then((result)=>{
        console.log(result)
        console.log(" ## RETURNED:",result.events.AddResponse.returnValues)
        let responseId = result.events.AddResponse.returnValues.id
        console.log(" ## RESPONSE ID: "+responseId)
        pyth.stake(responseId,1).then((result)=>{
          console.log(result)
          //remove this id from the mine queue
          for(let i in pyth.mineQueue){
            if(pyth.mineQueue[i]==requestId){
              pyth.mineQueue.splice(i, 1)
              break
            }
          }
          MINING=false;
        })
      })
    });
  }catch(e){console.log(e);MINING=false;}
}
