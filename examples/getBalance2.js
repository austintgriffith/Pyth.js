let concurrence = require("../concurrence.js")
concurrence.init({},(err)=>{
  concurrence.selectAccount(1)
  concurrence.balanceOf().then((balance)=>{
    console.log("Balance: "+balance+" "+concurrence.symbol)
  })
});
