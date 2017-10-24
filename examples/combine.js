
let requestId = "0x5a08b2c848bffe9863fa6b898e7df47354a9558c84c46fbe6424819f3fd74527";
let combinerAddress = "0x4959C52f07794d0533871A2fd6fF88b0AA586138";

require("../pyth.js")({DEBUG: true},(err,pyth)=>{
  pyth.combine(requestId,combinerAddress).then((result)=>{
    console.log(result)
  });
});
