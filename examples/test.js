const Request = require('request');

require("../pyth.js")({DEBUG: true},(err,pyth)=>{
  pyth.syncRequests();
  pyth.syncReserved();
  pyth.syncMineQueue();
  setInterval(()=>{
    for(let id in pyth.mineQueue){
      if(pyth.mineQueue[id]){
        console.log(id)
        try{
          let request = JSON.parse(pyth.mineQueue[id].request);
          //let parser = JSON.parse(pyth.mineQueue[id].parser)
          Request(request.url,(error, response, body)=>{
            console.log(body);
            pyth.addResponse(id,body).then((result)=>{
              console.log(result)
            })
          });
        }catch(e){console.log(e)}

        pyth.mineQueue[id]=false;
        break;
      }
    }
  },1000)
});
