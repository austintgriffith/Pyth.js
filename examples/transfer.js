let concurrence = require("../concurrence.js")
concurrence.init({},(err)=>{
  concurrence.selectAccount(1)
  concurrence.transfer(concurrence.accounts[0],1).then((result)=>{
    console.log(result.transactionHash)
  })
});
