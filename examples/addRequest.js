
let request = {url: "http://localhost/"}
let parser = {type:"raw"}
let combiner = "0xD82327E25758191Ba91BC3b5755493D1F68e0E81"
let tokens = 5

require("../pyth.js")({DEBUG: true},(err,pyth)=>{
  pyth.selectAccount(1)
  pyth.addRequest(request,parser,combiner).then((addResult)=>{
    console.log(addResult.transactionHash,addResult.events.AddRequest.returnValues.id)
    pyth.reserve(addResult.events.AddRequest.returnValues.id,tokens).then((reserveResult)=>{
      console.log(reserveResult)
    })
  })
});
