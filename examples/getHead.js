if(!process.argv[2]){
  console.log("Please provide a request id.")
  process.exit(1)
}
let requestId = process.argv[2];

require("../concurrence.js")({DEBUG: true},(err,concurrence)=>{
  concurrence.getHead(requestId).then((head)=>{
    console.log(head)
  })
});
