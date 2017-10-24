
let requestId = "0x7d8287b31869c735078803afb71d7505bf79d81898d7964c8b38894f90e9ab0c"
let response = "somevalue"

require("../pyth.js")({DEBUG: true},(err,pyth)=>{
  pyth.selectAccount(1)
  pyth.addResponse(requestId,response).then((result)=>{
    console.log(result)
  })
});
