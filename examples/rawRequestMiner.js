const Request = require('request');

let concurrence = require("../concurrence.js")
concurrence.init({},(err)=>{
  concurrence.listRequests().then((requests)=>{
    for(let r in requests){
      let id = requests[r].returnValues.id
      let combiner = requests[r].returnValues.combiner
      let request = requests[r].returnValues.request
      let protocol = requests[r].returnValues.protocol
      let callback = requests[r].returnValues.callback
      console.log("Found request "+id)
      console.log("Checking combiner "+combiner);
      concurrence.isCombinerOpen(id,combiner).then((open)=>{
        if(open){
          console.log("Mining request "+request)
          try{
            request = JSON.parse(request)
            console.log(request)
            Request(request.url,(error, response, body)=>{
              console.log("body:",body)
            })
          }catch(e){console.log(e)}
        }else{
          console.log("Maybe we can combine?")
        }
      })

    }

  })
});
