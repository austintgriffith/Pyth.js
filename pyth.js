
const fs = require('fs')
const Web3 = require('web3')
const _ = require('lodash');
const net = require('net')
const socketClient = net.Socket()
const Request = require('request')


/// --- CONFIG ------------------------------------------------------------------------

let pyth = {
  version: "0.0.1",
  storage: "./.pyth/",
  server: "localhost",
  gas: 250000,
  gasPrice: 22,
  contracts: [],
  combinerContracts: [],
  blacklist: [],
  defaultParser: "raw",
  blocksPerRead: 10000,
  AMOUNT_TO_STAKE: 1,
  DEBUG_MINER: false,
  DEBUG_COMBINE: true,
  BUSY: false
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

/// --- MINER ------------------------------------------------------------------------

pyth.startMining = (interval) => {
  if(!interval) interval=5000;
  pyth.syncRequests(interval)
  pyth.syncReserved(interval)
  pyth.syncMineQueue(interval)
  pyth.syncCombineQueue(interval)
  //mine interval
  setInterval(()=>{
    if(!pyth.BUSY){
      if(pyth.config.DEBUG) console.log("#*")
      for(let i in pyth.mineQueue){
        let requestToMine = pyth.mineQueue[i]
        if(pyth.config.DEBUG) console.log("#* MINE REQUEST: "+requestToMine+"")
        pyth.BUSY = requestToMine
        mineRequest(pyth.BUSY)
        break
      }
    }
  },interval)
  //combine interval
  setInterval(()=>{
    if(!pyth.BUSY){
      if(pyth.config.DEBUG) console.log("#%")
      for(let i in pyth.combineQueue){
        let requestToCombine = pyth.combineQueue[i]
        if(pyth.config.DEBUG) console.log("#% COMBINE REQUEST: "+requestToCombine+"")
        pyth.BUSY = requestToCombine
        combineRequest(pyth.BUSY)
        break
      }
    }
  },interval)
}


/// --- INTERVALS ------------------------------------------------------------------------

pyth.syncRequests = (interval) => {
  setInterval(checkForNewRequests,interval)
  checkForNewRequests()
}
pyth.syncReserved = (interval) => {
  setInterval(checkForReserved,interval)
  setTimeout(checkForReserved,interval/3)
}
pyth.syncMineQueue = (interval) => {
  setInterval(ResponsesToMineQueue,interval)
  setTimeout(ResponsesToMineQueue,interval/5)
}
pyth.syncCombineQueue = (interval) => {
  setInterval(CombinerReadyQueue,interval)
  setTimeout(CombinerReadyQueue,interval/7)
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
  if(pyth.config.DEBUG) console.log("Getting "+pyth.symbol+" balance of address "+address+" ...")
  return pyth.contracts["Token"].interface.methods.balanceOf(address).call()
}

pyth.transfer = (address,amount)=>{
  if(pyth.config.DEBUG) console.log("Transferring "+amount+""+pyth.symbol+" from "+pyth.selectedAddress+" to "+address+" ...")
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
  if(pyth.config.DEBUG) console.log("Reserving "+amount+" "+pyth.symbol+" for request id "+requestId+" ...")
  return pyth.contracts["Token"].interface.methods.reserve(requestId,amount).send({
    from: pyth.selectedAddress,
    gas: pyth.gas,
    gasPrice: pyth.web3.utils.toWei(pyth.gasPrice,'gwei')
  })
}

pyth.staked = (address,requestId,responseId)=>{
  return pyth.contracts["Token"].interface.methods.staked(address,requestId,responseId).call()
}

pyth.stake = (requestId,responseId,amount)=>{
  if(pyth.config.DEBUG) console.log("Staking "+amount+" "+pyth.symbol+" on response id "+responseId+" (in request "+requestId+") from account "+pyth.selectedAddress+" ...")
  return pyth.contracts["Token"].interface.methods.stake(requestId,responseId,amount).send({
    from: pyth.selectedAddress,
    gas: pyth.gas,
    gasPrice: pyth.web3.utils.toWei(pyth.gasPrice,'gwei')
  })
}

pyth.listStakes = (address)=>{
  return pyth.contracts["Responses"].interface.getPastEvents({id:id},{ //you could probably even filter down to the selectedAddress
      fromBlock: pyth.contracts["Requests"].blockNumber,
      toBlock: 'latest'
  })
}


/// --- REQUESTS ------------------------------------------------------------------------

pyth.addRequest = (request,parser,combiner)=>{
  request=JSON.stringify(request)
  parser=JSON.stringify(parser)
  if(pyth.config.DEBUG) console.log("Creating request \""+request+"\" parsed with \""+parser+"\" to combiner "+combiner)
  console.log( pyth.contracts["Requests"].interface.methods)
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

pyth.getCombiner = (requestId)=>{
  return pyth.contracts["Requests"].interface.methods.getCombiner(requestId).call()
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
  return pyth.contracts["Responses"].interface.getPastEvents("AddResponse",{ //you could probably even filter down to the selectedAddress
      filter:{request:id},
      fromBlock: pyth.contracts["Requests"].blockNumber,
      toBlock: 'latest'
  })
}

pyth.getResponse = (responseId)=>{
  return pyth.contracts["Responses"].interface.methods.getResponse(responseId).call()
}

pyth.getHead = (id)=>{
  return pyth.contracts["Responses"].interface.methods.heads(id).call()
}


/// --- COMBINER ------------------------------------------------------------------------

pyth.getCombinerMode = (requestid,address)=>{
  if(!pyth.combinerContracts[address]) loadCombiner(address)
  return pyth.combinerContracts[address].methods.mode(requestid).call()
}

pyth.getCombinerBestResult = (requestid,address)=>{
  if(!pyth.combinerContracts[address]) loadCombiner(address)
  return pyth.combinerContracts[address].methods.bestResult(requestid).call()
}

pyth.getCombinerMostStaked = (requestid,address)=>{
  if(!pyth.combinerContracts[address]) loadCombiner(address)
  return pyth.combinerContracts[address].methods.mostStaked(requestid).call()
}

pyth.isCombinerOpen = (requestid,address) => {
  if(!pyth.combinerContracts[address]) loadCombiner(address)
  return pyth.combinerContracts[address].methods.open(requestid).call()
}

pyth.isCombinerReady = (requestid,address) => {
  if(!pyth.combinerContracts[address]) loadCombiner(address)
  return pyth.combinerContracts[address].methods.ready(requestid).call()
}

pyth.mineReport = ()=>{}

function combineRequest(requestId){
  if(pyth.DEBUG_COMBINE) console.log(" # ### COMBINE request "+requestId)
  try{
    pyth.combine(requestId,pyth.requests[requestId].combiner).on('error',(err)=>{
      console.log("ERROR",err)
        pyth.blacklist.push(requestId)
      clearRequestOutOfCombineQueue(requestId)
    }).then((result)=>{
      if(pyth.DEBUG_COMBINE) console.log(" ### COMBINE BACK:",result.transactionHash)
      if(pyth.DEBUG_COMBINE){
        fs.writeFileSync("debug/"+result.transactionHash,JSON.stringify(result.events))
         console.log(" ### COMBINE EVENTS WRITTEN TO FILE")
      }
      clearRequestOutOfCombineQueue(requestId)
    })
  }catch(e){console.log(e);console.log("SETTING BUSY TO FALSE:");pyth.BUSY=false;}
}

function clearRequestOutOfCombineQueue(requestId){
  for(let i in pyth.combineQueue){
    if(pyth.combineQueue[i]==requestId){
      pyth.combineQueue.splice(i, 1)
      break
    }
  }
  pyth.BUSY=false;
  return;
}

pyth.combine = (requestid,address)=>{
  if(!pyth.combinerContracts[address]) loadCombiner(address)
  return pyth.combinerContracts[address].methods.combine(requestid).send({
    from: pyth.selectedAddress,
    gas: pyth.gas,
    gasPrice: pyth.web3.utils.toWei(pyth.gasPrice,'gwei')
  })
}

pyth.debugCombiner = (address)=>{
  if(!pyth.combinerContracts[address]) loadCombiner(address)
  return pyth.combinerContracts[address].getPastEvents("Debug",{ //you could probably even filter down to the selectedAddress
      fromBlock: 0,
      toBlock: 'latest'
  })
}
pyth.debugCombinerGas = (address)=>{
  if(!pyth.combinerContracts[address]) loadCombiner(address)
  return pyth.combinerContracts[address].getPastEvents("DebugGas",{ //you could probably even filter down to the selectedAddress
      fromBlock: 0,
      toBlock: 'latest'
  })
}

function loadCombiner(address){
  if(pyth.config.DEBUG) console.log("Loading Combiner "+address)
  //combiner abi should probably be hardcoded in software, the should all be exactly the same
  try{
    let combinerAbi = JSON.parse(fs.readFileSync("../../Combiner/basic/Combiner.abi").toString().trim())
    let combinerContract = new pyth.web3.eth.Contract(combinerAbi,address)
    pyth.combinerContracts[address] = combinerContract
    return pyth.combinerContracts[address]
  }catch(e){console.log(e)}

}


/// --- HELPERS ------------------------------------------------------------------------

/*
look through requests and find out if any of them are ready for the combiner to run
*/
function CombinerReadyQueue(){
  for(let r in pyth.requests){
    if( pyth.requests[r].reserved > 0){

      //first, check to see if the combiner is

      //second, check to see if the combiner is ready to combine
      pyth.isCombinerReady(r,pyth.requests[r].combiner).then((ready)=>{
        //console.log(" >> combiner ready: ",ready)
        if(ready){
          if(pyth.blacklist.indexOf(r)<0){
            if(!pyth.combineQueue) {pyth.combineQueue = [];}
            if(pyth.combineQueue.indexOf(r)<0){
              //console.log("!!!!!! PUSH")
              pyth.combineQueue.push(r)
            }
          }
        }
      })


    }
  }
}

/*
look through requests and find out if there are any responses yet
particularly from this miner or many of them and then make a decision on
whether or not to add it to the mineQueue
*/
function ResponsesToMineQueue(){
  for(let r in pyth.requests){
    if( pyth.requests[r].reserved > 0){
      //console.log(" >> FOUND a request "+r+" with some coin...")
      pyth.listResponses(r).then((responseEvents)=>{
        let foundMyAddressInResponses = false
        for(let r in responseEvents){
          if(responseEvents[r].returnValues.sender == pyth.selectedAddress) {
            foundMyAddressInResponses = true;
            break;
          }
        }
        if(responseEvents.length==0 || !foundMyAddressInResponses){
          if(!pyth.mineQueue) {pyth.mineQueue = [];}
          if(pyth.mineQueue.indexOf(r)<0){
            pyth.mineQueue.push(r)
          }
        }
      })
    }else{
      //console.log(" >> request "+r+" has no tokens reserved")
    }
  }
}




function mineRequest(requestId){
  if(pyth.DEBUG_MINER) console.log(" # ### MINING request "+requestId)
  try{
    let request = JSON.parse(pyth.requests[requestId].request);
    let parser = JSON.parse(pyth.requests[requestId].parser)
    if(pyth.config.DEBUG) console.log(" ## URL: "+request.url)
    Request(request.url,(error, response, body)=>{
      if(pyth.DEBUG_MINER) console.log(body);
      pyth.addResponse(requestId,body).on('error',(err)=>{
        console.log("ERROR",err)
        pyth.blacklist.push(requestId)
        clearRequestOutOfMineQueue(requestId)
      }).then((result)=>{
        if(pyth.DEBUG_MINER) console.log(result)
        if(pyth.DEBUG_MINER) console.log(" ## RETURNED:",result.events.AddResponse.returnValues)
        let responseId = result.events.AddResponse.returnValues.id
        if(pyth.DEBUG_MINER) console.log(" ## RESPONSE ID: "+responseId)
        pyth.stake(requestId,responseId,pyth.AMOUNT_TO_STAKE).on('error',(err)=>{
          console.log("ERROR",err)
          pyth.blacklist.push(requestId)
          clearRequestOutOfMineQueue(requestId)
        }).then((result)=>{
          if(pyth.DEBUG_MINER) console.log(result)
          clearRequestOutOfMineQueue(requestId)
        })
      })
    });
  }catch(e){console.log(e);pyth.BUSY=false;}
}

function clearRequestOutOfMineQueue(requestId){
  for(let i in pyth.mineQueue){
    if(pyth.mineQueue[i]==requestId){
      pyth.mineQueue.splice(i, 1)
      break
    }
  }
  pyth.BUSY=false;
}


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
  try{
    if (!fs.existsSync("debug")){
      fs.mkdirSync("debug");
    }
  }catch(e){}

  try{fs.mkdirSync(pyth.storage)}catch(e){}
  try{fs.mkdirSync(pyth.storage+"abis")}catch(e){}
}

function connectToEthereumNetwork(){
  if(pyth.config.IPC){
    if(pyth.config.DEBUG) console.log("Using IPC ("+config.IPC+") ...")
    connectionString = config.IPC// ex: '/Users/austingriffith/Library/Ethereum/testnet/geth.ipc'
    pyth.web3 = new Web3(new Web3.providers.IpcProvider(connectionString, socketClient))
  } else if(pyth.config.RPC){
    if(pyth.config.DEBUG) console.log("Using RPC ("+config.RPC+") ...")
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
    if(pyth.config.DEBUG) console.log("Loading contract "+name+" ...")
    let address
    let abi
    //first, check to see if we can load the contract address from the main contract
    if(pyth.contracts["Main"]){
      if(pyth.config.DEBUG) console.log("Connecting to Main contract to get "+name+" address ...")
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
        if(pyth.config.DEBUG) console.log("Connecting to "+addressUrl+" ...")
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
    if(pyth.config.DEBUG) console.log("Connecting to "+abiUrl+" ...")
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
    if(pyth.config.DEBUG) console.log("Connecting to "+abiUrl+" ...")
    Request(abiUrl,(error, response, body)=>{
      if(!error){
        callback(null,body)
      }
    })
  }
}
