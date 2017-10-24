const fs = require("fs")
let combinerAddress = fs.readFileSync("../../Combiner/basic/Combiner.address").toString().trim()

require("../pyth.js")({},(err,pyth)=>{
  pyth.debugCombiner(combinerAddress).then((debugEvents)=>{
    console.log(debugEvents)
    pyth.debugCombinerGas(combinerAddress).then((debugEvents)=>{
      console.log(debugEvents)
    })
  })
});
