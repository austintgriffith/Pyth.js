const fs = require("fs")
let combinerAddress = fs.readFileSync("../../Combiner/basic/Combiner.address").toString().trim()

require("../concurrence.js")({},(err,concurrence)=>{
  concurrence.debugCombiner(combinerAddress).then((debugEvents)=>{
    console.log(debugEvents)
    concurrence.debugCombinerGas(combinerAddress).then((debugEvents)=>{
      console.log(debugEvents)
    })
  })
});
