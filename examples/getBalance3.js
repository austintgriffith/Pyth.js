require("../concurrence.js")({},(err,concurrence)=>{
  concurrence.balanceOf(process.argv[2]).then((balance)=>{
    console.log("Balance of "+process.argv[2]+": "+balance+" "+concurrence.symbol)
  })
});
