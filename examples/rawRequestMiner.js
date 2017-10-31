const Request = require('request');

let concurrence = require("../concurrence.js")
concurrence.init({},(err)=>{
  concurrence.selectAccount(1)
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
            }else{
              concurrence.getCombinerMode(id,combiner).then((mode)=>{
                console.log("Combiner Mode: ",mode)
              })
            }

          })

        }else{
          console.log("Combiner "+combiner+" is not ready to combine, let's see if it's open...");
          concurrence.isCombinerOpen(id,combiner).then((open)=>{
            if(open){
              console.log("Mining request "+request)
              try{
                request = JSON.parse(request)
                console.log(request)
                Request(request.url,(error, response, body)=>{
                  console.log("Adding Response:",body)
                  concurrence.addResponse(id,body).then((result)=>{
                    console.log("TX:"+result.transactionHash)
                    console.log(result.events.AddResponse.returnValues)
                  })
                })
              }catch(e){console.log(e)}
            }else{
              console.log("Maybe we can combine?")
              //isCombinerReady
            }
          })
        }

      })



    }

  })
});
