
let requestId = "0xcc68a6404df5cb2eb027eed462540a824d8ac35374548ac6ff01ae84f6effbea"

require("../pyth.js")({DEBUG: true},(err,pyth)=>{
  pyth.getCombiner(requestId).then((combiner)=>{
    console.log(combiner)
  })
});
