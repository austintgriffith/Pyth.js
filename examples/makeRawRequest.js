const Request = require('request');

if(!process.argv[2]){
  console.log("Please provide a url")
  process.exit(1)
}
let url = process.argv[2];

Request(url,(error, response, body)=>{
  console.log(error,body)
})
