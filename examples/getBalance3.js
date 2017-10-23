require("../pyth.js")({},(err,pyth)=>{
  pyth.balanceOf("0xC257274276a4E539741Ca11b590B9447B26A8051").then((balance)=>{
    console.log("Balance: "+balance+" "+pyth.symbol)
  })
});
