
let url = "https://ifconfig.co/"
let tokens = 5

require("../pyth.js")({DEBUG: true},(err,pyth)=>{
  pyth.selectAccount(1)
  pyth.addRequest(url).then((addResult)=>{
    console.log(addResult.transactionHash,addResult.events.AddRequest.returnValues.id)
    pyth.reserve(addResult.events.AddRequest.returnValues.id,tokens).then((reserveResult)=>{
      console.log(reserveResult)
    })
  })
});
