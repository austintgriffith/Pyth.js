
let requestId = "0xcc68a6404df5cb2eb027eed462540a824d8ac35374548ac6ff01ae84f6effbea"

require("../concurrence.js")({DEBUG: true},(err,concurrence)=>{
  concurrence.getCombiner(requestId).then((combiner)=>{
    console.log(combiner)
  })
});
