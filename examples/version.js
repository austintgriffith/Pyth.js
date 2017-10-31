let concurrence = require("../concurrence.js")
concurrence.init({},(err)=>{
  console.log(concurrence.version)
  console.log(concurrence.contracts["Main"].address)
});
