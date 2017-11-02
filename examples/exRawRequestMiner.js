const Request = require('request');
let concurrence = require("../concurrence.js")
concurrence.init({DEBUG:true},(err)=>{
  concurrence.selectAccount(1)
  concurrence.balanceOf().then((balance)=>{
    console.log("Current balance: "+balance)
    let stake = balance*0.1
    if(stake>100) stake=100;
    if(balance<=0){
      console.log("No token to stake")
      stake=0
    }else{
      console.log("Willing to stake "+stake)
      concurrence.listRequests().then((requests)=>{
        for(let r in requests){
          let id = requests[r].returnValues.id
          let combiner = requests[r].returnValues.combiner
          let request = requests[r].returnValues.request
          let protocol = requests[r].returnValues.protocol
          let callback = requests[r].returnValues.callback
          console.log("Found request "+id)
          console.log("First let's check if the combiner is ready...")
          concurrence.isCombinerReady(id,combiner).then((ready)=>{
            if(ready){
              console.log("Combiner "+combiner+" is ready to combine.")
              concurrence.combine(id,combiner).on('error',(err)=>{
                if(err){
                  console.log(err)
                }
              }).then((result)=>{
                console.log("COMBINE DONE",result)
                console.log("Getting new state...")
                concurrence.getCombinerMode(id,combiner).then((mode)=>{
                  console.log("Combiner Mode: ",mode)
                })
              })
            }else{
              console.log("Combiner "+combiner+" is not ready to combine, let's see if it's open...");
              concurrence.isCombinerOpen(id,combiner).then((open)=>{
                if(open){
                  console.log("Combiner open, mining request "+request)
                  try{
                    request = JSON.parse(request)
                    console.log(request)
                    Request(request.url,(error, response, body)=>{
                      console.log("Adding Response:",body)
                      if(response.statusCode == 200 && body.length>0 && body.length<50){
                        console.log("Looks good enough...")
                        concurrence.addResponse(id,body).then((result)=>{
                          console.log("TX:"+result.transactionHash)
                          console.log(result.events.AddResponse.returnValues)
                          console.log("Now we need to stake some amount of token on our answer...")
                          let responseId = result.events.AddResponse.returnValues.id
                          concurrence.stake(id,responseId,stake).then((result)=>{
                            console.log(result)
                          })
                        })
                      }else{
                        console.log("Skipping response because something seems wrong...")
                      }
                    })
                  }catch(e){console.log(e)}
                }else{
                  console.log("Combiner is closed.")
                }
              })
            }
          })
        }
      })
    }
  })
});
