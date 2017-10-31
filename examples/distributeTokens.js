let concurrence = require("../concurrence.js")
concurrence.init({},(err)=>{
  concurrence.selectAccount(1)
  for(let i=0;i<10;i++){
    concurrence.transfer(concurrence.accounts[i],100).then((result)=>{
      console.log(result.transactionHash)
    })
  }

});
