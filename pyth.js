
const fs = require('fs')
const Web3 = require('web3')
const net = require('net')
const socketClient = net.Socket()
const Request = require('request')


/// --- CONFIG ------------------------------------------------------------------------

let pyth = {
  version: "0.0.1",
  storage: "./.pyth/",
  server: "localhost",
  gas: 200000,
  gasPrice: 22,
  contracts: [],
  defaultParser: "raw",
  blocksPerRead: 10000,
}


/// --- INIT ------------------------------------------------------------------------

module.exports = function(config,callback){
  pyth.config = config

  if(pyth.config.DEBUG) console.log("Initializing storage...")
  initStorage()

  if(pyth.config.DEBUG) console.log("Connecting to Ethereum network...")
  connectToEthereumNetwork()

  if(pyth.config.DEBUG) console.log("Loading accounts...")
  getAccounts().then(()=>{
    return loadContract("Main");
  }).then(()=>{
    return loadContract("Auth");
  }).then(()=>{
    return loadContract("Token");
  }).then(()=>{
    return loadContract("Requests");
  }).then(()=>{
    return loadContract("Responses");
  }).then(()=>{
    pyth.contracts["Token"].interface.methods.symbol().call().then((symbol)=>{
      pyth.symbol = symbol;
      callback(null,pyth);
    })
  }).catch((err)=>{
    if(pyth.config.DEBUG) console.log("\n!!!!!!!!!!!!!\n",err,"!!!!!!!!!\n")
    callback(err);
  })

}



/// --- INTERVALS ------------------------------------------------------------------------

pyth.syncRequests = (interval) => {
  if(!interval) interval=18000
  setInterval(checkForNewRequests,interval)
  checkForNewRequests()
}

pyth.syncReserved = (interval) => {
  if(!interval) interval=15000
  setInterval(checkForReserved,interval)
  setTimeout(checkForReserved,interval/10)
}


pyth.syncMineQueue = (interval) => {
  if(!interval) interval=16000
  setInterval(ResponsesToMineQueue,interval)
  setTimeout(ResponsesToMineQueue,interval/5)
}

/*
look through requests and find out if there are any responses yet
particularly from this miner or many of them and then make a decision on
whether or not to add it to the mineQueue
*/
function ResponsesToMineQueue(){
  for(let r in pyth.requests){
    //console.log("Checking request ",pyth.requests[r])
    if( pyth.requests[r].reserved > 0){
      //console.log("FOUND a request "+pyth.requests[r].id+" with some coin...")
      pyth.listResponses(pyth.requests[r].id).then((responseEvents)=>{
        console.log("responseEvents",responseEvents)
        if(responseEvents.length==0){////right now we only respond to empty requests
                  //but later you'll want to check 1) did I respond 2) how many people responded 3) what is the total staked response
          if(!pyth.mineQueue) pyth.mineQueue = [];
          if(!pyth.mineQueue[pyth.requests[r].id]){
            pyth.mineQueue[pyth.requests[r].id] = pyth.requests[r];
          }
        }
      })
    }
  }
}

/// --- ACCOUNT ------------------------------------------------------------------------

pyth.selectAccount = (account)=>{
  if(typeof account == "String"){
    pyth.selectedAddress = account
  }else{
    pyth.selectedAddress = pyth.accounts[account]
  }
}


/// --- TOKEN ------------------------------------------------------------------------

pyth.balanceOf = (address)=>{
  if(typeof address == "undefined"){
    address=pyth.selectedAddress
  }
  if(pyth.config.DEBUG) console.log("Getting "+pyth.symbol+" balance of address "+address+"...")
  return pyth.contracts["Token"].interface.methods.balanceOf(address).call()
}

pyth.transfer = (address,amount)=>{
  if(pyth.config.DEBUG) console.log("Transferring "+amount+""+pyth.symbol+" from "+pyth.selectedAddress+" to "+address+"...")
  return pyth.contracts["Token"].interface.methods.transfer(address,amount).send({
    from: pyth.selectedAddress,
    gas: pyth.gas,
    gasPrice: pyth.web3.utils.toWei(pyth.gasPrice,'gwei')
  })
}

pyth.reserved = (requestId)=>{
  return pyth.contracts["Token"].interface.methods.reserved(requestId).call()
}

pyth.reserve = (requestId,amount)=>{
  if(pyth.config.DEBUG) console.log("Reserving "+amount+" "+pyth.symbol+" for request id "+requestId+"...")
  return pyth.contracts["Token"].interface.methods.reserve(requestId,amount).send({
    from: pyth.selectedAddress,
    gas: pyth.gas,
    gasPrice: pyth.web3.utils.toWei(pyth.gasPrice,'gwei')
  })
}


/// --- REQUESTS ------------------------------------------------------------------------

pyth.addRequest = (request,parser,combiner)=>{
  request=JSON.stringify(request)
  parser=JSON.stringify(parser)
  if(pyth.config.DEBUG) console.log("Creating request \""+request+"\" parsed with \""+parser+"\" to combiner "+combiner)
  return pyth.contracts["Requests"].interface.methods.addRequest(combiner,request,parser).send({
    from: pyth.selectedAddress,
    gas: pyth.gas,
    gasPrice: pyth.web3.utils.toWei(pyth.gasPrice,'gwei')
  })
}

pyth.listRequests = ()=>{
  return pyth.contracts["Requests"].interface.getPastEvents('AddRequest',{
      fromBlock: pyth.contracts["Requests"].blockNumber,
      toBlock: 'latest'
  })
}

pyth.getRequest = (requestId)=>{
  return pyth.contracts["Requests"].interface.methods.getRequest(requestId).call()
}

/// --- RESPONSE ------------------------------------------------------------------------

pyth.addResponse = (request,response)=>{
  if(pyth.config.DEBUG) console.log("Adding response to request id \""+request+"\": "+response)
  return pyth.contracts["Responses"].interface.methods.addResponse(request,pyth.web3.utils.fromAscii(response)).send({
    from: pyth.selectedAddress,
    gas: pyth.gas,
    gasPrice: pyth.web3.utils.toWei(pyth.gasPrice,'gwei')
  })
}

pyth.listResponses = (id)=>{
  return pyth.contracts["Responses"].interface.getPastEvents({id:id},{ //you could probably even filter down to the selectedAddress
      fromBlock: pyth.contracts["Requests"].blockNumber,
      toBlock: 'latest'
  })
}

pyth.getHead = (id)=>{
  return pyth.contracts["Responses"].interface.methods.heads(id).call()
}


/// --- COMBINER ------------------------------------------------------------------------


pyth.combine = (id,address)=>{
  /*return pyth.contracts["Co"].interface.getPastEvents({id:id},{ //you could probably even filter down to the selectedAddress
      fromBlock: pyth.contracts["Requests"].blockNumber,
      toBlock: 'latest'
  })*/
  if(pyth.config.DEBUG) console.log("Loading Combiner "+address)

  //combiner abi should probably be hardcoded in software, the should all be exactly the same
  try{
    let combinerAbi = JSON.parse(fs.readFileSync("../../Combiner/basic/Combiner.abi").toString().trim())
    let combinerContract = new pyth.web3.eth.Contract(combinerAbi,address)
    return combinerContract.methods.combine(id).call()
  }catch(e){console.log(e)}

}


/// --- HELPERS ------------------------------------------------------------------------

function checkForReserved(){
  for(let id in pyth.requests) {
    pyth.reserved(id).then((reserved)=>{
      pyth.requests[id].reserved = reserved
    })
  }
}

function checkForNewRequests(){
  if(!pyth.requests) pyth.requests=[];
  pyth.listRequests().then((requests)=>{
    let count = 0
    let total = 0
    for(let r in requests){
      total++
      if(!pyth.requests[requests[r].returnValues.id]) {
        pyth.requests[requests[r].returnValues.id] = requests[r].returnValues;
        count++
      }
    }
    if(pyth.config.DEBUG) console.log("# Synced "+count+" new requests out of "+total)
  })
}

function getAccounts(){
  return new Promise((resolve, reject) => {
    pyth.web3.eth.getAccounts().then((accounts)=>{
      if(accounts) {
        pyth.accounts=accounts
        if(pyth.config.DEBUG) console.log("Selecting default (coinbase) account...")
        pyth.selectedAddress=accounts[0]
        resolve(accounts)
      }else{
        reject(err)
        return
      }
    })
  })
}

function initStorage(){
  try{fs.mkdirSync(pyth.storage)}catch(e){}
  try{fs.mkdirSync(pyth.storage+"abis")}catch(e){}
}

function connectToEthereumNetwork(){
  if(pyth.config.IPC){
    if(pyth.config.DEBUG) console.log("Using IPC ("+config.IPC+")...")
    connectionString = config.IPC// ex: '/Users/austingriffith/Library/Ethereum/testnet/geth.ipc'
    pyth.web3 = new Web3(new Web3.providers.IpcProvider(connectionString, socketClient))
  } else if(pyth.config.RPC){
    if(pyth.config.DEBUG) console.log("Using RPC ("+config.RPC+")...")
    connectionString = config.RPC// ex: "http://localhost:8545"
    pyth.web3 = new Web3(new Web3.providers.HttpProvider(connectionString))
  } else {
    if(pyth.config.DEBUG) console.log("Using Default RPC...")
    connectionString = "http://localhost:8545"
    pyth.web3 = new Web3(new Web3.providers.HttpProvider(connectionString))
  }
}

function loadContract(name){
  return new Promise((resolve, reject) => {
    if(pyth.config.DEBUG) console.log("Loading contract "+name+"...")
    let address
    let abi
    //first, check to see if we can load the contract address from the main contract
    if(pyth.contracts["Main"]){
      if(pyth.config.DEBUG) console.log("Connecting to Main contract to get "+name+" address...")
      pyth.contracts["Main"].interface.methods.getContract(
          pyth.web3.utils.fromAscii(name)
        ).call().then((contractAddress)=>{
          if(!contractAddress){
            reject("Failed to load "+name+" address from Main contract.")
          }else{
            address = contractAddress;
            onceMainAddressLoadRest(name,address,reject,resolve)
          }
        }
      )
    }else{
      //next, attempt to load from local file caching
      try{
        address = fs.readFileSync(pyth.storage+name+".address").toString().trim()
        abi = JSON.parse(fs.readFileSync(pyth.storage+"abis/"+address+".abi").toString())
        pyth.contracts[name] = {address: address,abi: abi,interface: new pyth.web3.eth.Contract(abi,address)}
        resolve(pyth.contracts[name])
      }catch(e){
        //finally, go to the webserver since can't find it anywhere locally
        let addressUrl = 'http://'+pyth.server+'/address/'+name
        if(pyth.config.DEBUG) console.log("Connecting to "+addressUrl+"...")
        Request(addressUrl,(error, response, body)=>{
          if(error){
            reject("Failed to load "+name+" address from "+addressUrl+"!")
          }else{
            address = body.trim()
            onceMainAddressLoadRest(name,address,reject,resolve)
          }
        })
      }
    }
  })
}

function onceMainAddressLoadRest(name,address,reject,resolve){
  loadContractAbi(name,address,(err,abi)=>{
    if(err) {
      reject(err)
    }else{
      loadContractBlockNumber(name,address,(err,blockNumber)=>{
        if(err) {
          reject(err)
        }else{
          fs.writeFileSync(pyth.storage+name+".address",address)
          fs.writeFileSync(pyth.storage+"abis/"+address+".abi",JSON.stringify(abi))
          fs.writeFileSync(pyth.storage+"abis/"+address+".blockNumber",blockNumber)
          pyth.contracts[name] = {
            address: address,
            abi: abi,
            blockNumber: blockNumber,
            interface: new pyth.web3.eth.Contract(abi,address)
          }
          resolve(pyth.contracts[name])
        }
      })
    }
  })
}


function loadContractAbi(name,address,callback){
  let abi
  try{
    abi = JSON.parse(fs.readFileSync(pyth.storage+"abis/"+address+".abi").toString())
    callback(null,abi)
  }catch(e){
    let abiUrl = 'http://'+pyth.server+'/abi/'+name
    if(pyth.config.DEBUG) console.log("Connecting to "+abiUrl+"...")
    Request(abiUrl,(error, response, body)=>{
      if(!error){
        try{
          abi = JSON.parse(body)
          callback(null,abi)
        }catch(e){
          callback("Failed to parse "+name+" ABI from "+abiUrl+"!")
        }
      }
    })
  }
}

function loadContractBlockNumber(name,address,callback){
  let blockNumber
  try{
    blockNumber = fs.readFileSync(pyth.storage+"abis/"+address+".blockNumber").toString()
    callback(null,blockNumber)
  }catch(e){
    let abiUrl = 'http://'+pyth.server+'/blockNumber/'+name
    if(pyth.config.DEBUG) console.log("Connecting to "+abiUrl+"...")
    Request(abiUrl,(error, response, body)=>{
      if(!error){
        callback(null,body)
      }
    })
  }
}
