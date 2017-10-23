require("../pyth.js")({},(err,pyth)=>{
  pyth.selectAccount(1)
  pyth.transfer(pyth.accounts[0],1).then((result)=>{
    console.log(result.transactionHash)
  })
});
