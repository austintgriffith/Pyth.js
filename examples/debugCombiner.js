const fs = require("fs")
let combinerAddress = fs.readFileSync("../../Combiner/basic/Combiner.address").toString().trim()

let concurrence = require("../concurrence.js")
concurrence.init({},(err)=>{
  concurrence.debugCombiner(combinerAddress).then((debugEvents)=>{
    console.log(debugEvents)
    concurrence.debugCombinerGas(combinerAddress).then((debugEvents)=>{
      console.log(debugEvents)
    })
  })
});
