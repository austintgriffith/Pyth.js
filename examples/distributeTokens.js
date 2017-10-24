require("../pyth.js")({},(err,pyth)=>{
  pyth.selectAccount(1)
  for(let i=0;i<10;i++){
    pyth.transfer(pyth.accounts[i],100).then((result)=>{
      console.log(result.transactionHash)
    })
  }

});
