
let requestId = "0xf570c082d7e98e79b973942228bfd4ed17fba18abb20c2a1c54c478562854b04";
let combinerAddress = "0xcDB53D826d2A6b0c525bC1475687d520B34EbDE9";

require("../pyth.js")({DEBUG: true},(err,pyth)=>{
  pyth.combine(requestId,combinerAddress).then((result)=>{
    console.log(pyth.contracts['Responses'].address)
    console.log(pyth.web3.utils.toAscii(result))
  });
});
