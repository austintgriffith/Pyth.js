let concurrence = require("../concurrence.js")
concurrence.init({},(err)=>{
  concurrence.balanceOf(process.argv[2]).then((balance)=>{
    console.log("Balance of "+process.argv[2]+": "+balance+" "+concurrence.symbol)
  })
});
