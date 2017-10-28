require("../concurrence.js")({},(err,concurrence)=>{
  concurrence.selectAccount(1)
  for(let i=0;i<10;i++){
    concurrence.transfer(concurrence.accounts[i],100).then((result)=>{
      console.log(result.transactionHash)
    })
  }

});
