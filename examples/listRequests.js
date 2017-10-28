require("../concurrence.js")({},(err,concurrence)=>{
  concurrence.listRequests().then((requests)=>{
    console.log(requests)
  })
});
