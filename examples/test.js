require("../pyth.js")({DEBUG: true},(err,pyth)=>{
  pyth.syncRequests();
  pyth.syncReserved();


  setTimeout(()=>{

    pyth.mineNextRequest(()=>{})

  },3000)
});
