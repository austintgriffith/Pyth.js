
let requestId = "0xc37629d5d280cc97b202f8e833eb741a70923880b2f78793225613133cba22ed"

require("../pyth.js")({DEBUG: true},(err,pyth)=>{
  pyth.getRequest(requestId).then((request)=>{
    console.log(request)
  })
});