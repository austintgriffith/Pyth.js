const fs = require("fs")

let DEBUG = false;

let request = { url: "http://relay.concurrence.io/email" }
let protocol  = "raw"
let combiner = fs.readFileSync("../../Combiner/basic/Combiner.address").toString().trim()
let callback = fs.readFileSync("../../Callback/Callback.address").toString().trim()


let concurrence = require("../concurrence.js")
concurrence.init({DEBUG:true},(err)=>{
  distrubute(1000,6,()=>{
    requestAndReserve(0,100,(requestId)=>{
      makeSureCombinerIsOpen(requestId,()=>{
        mineResponses(requestId,()=>{
          listResponses(requestId,()=>{
            console.log("Back")
          })
        })
      })
    });
  });
});

/*
list responses
*/
function listResponses(requestId,cb){
  concurrence.listResponses(requestId).then((responses)=>{
    for(let r in responses){
      let sender = responses[r].returnValues.sender
      let request = responses[r].returnValues.request
      let id = responses[r].returnValues.id
      let response = responses[r].returnValues.response
      let count = responses[r].returnValues.count
      console.log("#"+count+" ("+id+") from ["+sender+"] "+request+" => "+concurrence.web3.utils.toAscii(response))
    }
  })
}

/*
send in real data
*/
function mineResponses(requestId,cb){
  makeRequest(requestId,(result)=>{
    addResponseAndStake(2,requestId,result,100,(responseId)=>{
      makeRequest(requestId,(result)=>{
        addResponseAndStake(3,requestId,result,100,(responseId)=>{
          makeRequest(requestId,(result)=>{
            addResponseAndStake(4,requestId,result,100,(responseId)=>{
              cb()
            })
          })
        })
      })
    })
  })
}

/*
add response and stake
*/
function addResponseAndStake(accountIndex,requestId,responseBody,stakeToken,cb){
  concurrence.selectAccount(accountIndex)
  concurrence.addResponse(requestId,responseBody).then((result)=>{
    if(DEBUG) console.log("TX:"+result.transactionHash)
    if(DEBUG) console.log(result.events.AddResponse.returnValues)
    let responseId = result.events.AddResponse.returnValues.id;
    concurrence.stake(requestId,responseId,stakeToken).then((result)=>{
      if(DEBUG) console.log(result)
      cb(responseId)
    })

  })
}

/*
make request
*/
function makeRequest(requestId,cb){
  concurrence.getRequest(requestId).then((request)=>{
    try{
      let requestObject = JSON.parse(request[1])
      if(!requestObject.url){
        console.log("ERROR, NO URL IN REQUEST")
      }else{
        const Request = require('request');
        Request(requestObject.url,(error, response, body)=>{
          if(DEBUG) console.log(error,body)
          cb(body);
        })
      }
    }catch(e){
      console.log("ERROR FAILED TO PARSE JSON")
      process.exit(1)
    }
  })
}

/*
make sure combiner is open
*/
function makeSureCombinerIsOpen(requestId,cb){
  concurrence.isCombinerOpen(requestId,combiner).then((open)=>{
    console.log("COMBINER OPEN: "+open)
    if(!open){
      console.log("ERROR: combiner is not open!")
      process.exit(1)
    }else{
      cb();
    }
  })
}

/*
add a request and reserve some token
*/
function requestAndReserve(accountIndex,tokens,cb){
  console.log("Adding request with account 0...")
  concurrence.selectAccount(accountIndex)
  concurrence.addRequest(combiner,request,protocol,callback).then((addResult)=>{
    if(DEBUG) console.log("TX:"+addResult.transactionHash)
    if(DEBUG) console.log(addResult.events.AddRequest.returnValues)
    let requestId = addResult.events.AddRequest.returnValues.id;
    console.log("======= Reserving "+tokens+" "+concurrence.symbol+" for request "+requestId)
    concurrence.reserve(requestId,tokens).then((reserveResult)=>{
      if(DEBUG) console.log(reserveResult)
      concurrence.reserved(requestId).then((reserved)=>{
        console.log("Request "+requestId+" has "+reserved+" "+concurrence.symbol+" reserved")
        if(reserved<tokens){
          console.log("ERROR: FAILED TO RESERVE")
          process.exit(1)
        }else{
          cb(requestId)
        }
      })
    })
  })
}

/*
make sure all count accounts have at least amount token and then callback
*/
function distrubute(amount,count,cb){
  console.log("Distribute "+amount+" "+concurrence.symbol+" to "+count+" accounts...")
  concurrence.selectAccount(1)
  let open = 0
  for(let i=0;i<count;i++){
    if(i!=concurrence.selectedAddress){
      open++
      concurrence.balanceOf(concurrence.accounts[i]).then((balance)=>{
        if(balance<amount){
          concurrence.transfer(concurrence.accounts[i],amount-balance).then((result)=>{
            if(DEBUG) console.log(result.transactionHash)
            concurrence.balanceOf(concurrence.accounts[i]).then((balance)=>{
              console.log("Account "+i+" has "+balance+" "+concurrence.symbol)
              open--
              if(open<=0) cb()
            })
          })
        }
        else{
          console.log("Account "+i+" has "+balance+" "+concurrence.symbol)
          open--
          if(open<=0) cb()
        }
      })
    }
  }
}
