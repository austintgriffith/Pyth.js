require("../concurrence.js")({},(err,concurrence)=>{
  console.log(concurrence.contracts["Main"].address)
  console.log(concurrence.version)
});
