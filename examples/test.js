let concurrence = require("../concurrence.js")

concurrence.init({},(err)=>{
  console.log(concurrence.contracts["Main"].address)
  console.log(concurrence.version)
});
