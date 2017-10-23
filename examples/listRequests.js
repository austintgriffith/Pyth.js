require("../pyth.js")({},(err,pyth)=>{
  pyth.listRequests().then((requests)=>{
    console.log(requests)
  })
});
