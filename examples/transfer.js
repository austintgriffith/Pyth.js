require("../concurrence.js")({},(err,concurrence)=>{
  concurrence.selectAccount(1)
  concurrence.transfer(concurrence.accounts[0],1).then((result)=>{
    console.log(result.transactionHash)
  })
});
