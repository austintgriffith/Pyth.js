require("../concurrence.js")({},(err,concurrence)=>{
  console.log(concurrence.version)
  console.log(concurrence.contracts["Main"].address)
});
