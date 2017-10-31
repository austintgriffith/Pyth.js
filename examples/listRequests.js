let concurrence = require("../concurrence.js")
concurrence.init({},(err)=>{
  concurrence.listRequests().then((requests)=>{
    console.log(requests)
  })
});
