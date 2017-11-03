/*

  Concurrence.js is the off-chain library developers can use to interface with the on-chain Concurrence fleet

  https://concurrence.io
  austin@concurrence.io

*/

const fs = require('fs')
const Web3 = require('web3')
const _ = require('lodash');
const net = require('net')
const socketClient = net.Socket()
const Request = require('request')


/// --- CONFIG ------------------------------------------------------------------------

let concurrence = {
  version: "0.0.1",
  storage: "./.concurrence/",
  server: "relay.concurrence.io",
  gas: 350000,
  gasPrice: 22,
  contracts: [],
  combinerContracts: [],
  blacklist: [],
  defaultProtocol: "raw",
  blocksPerRead: 10000,
  AMOUNT_TO_STAKE: 10,
  DEBUG_MINER: true,
  DEBUG_COMBINE: true,
  BUSY: false
}


/// --- INIT ------------------------------------------------------------------------

concurrence.init = function(config,callback){
  concurrence.config = config

  if(concurrence.config.DEBUG) console.log("Initializing storage...")
  initStorage()

  if(concurrence.config.DEBUG) console.log("Connecting to Ethereum network...")
  connectToEthereumNetwork()

  if(concurrence.config.DEBUG) console.log("Loading accounts...")
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
    concurrence.contracts["Token"].interface.methods.symbol().call().then((symbol)=>{
      concurrence.symbol = symbol;
      callback(null);
    })
  }).catch((err)=>{
    if(concurrence.config.DEBUG) console.log("\n!!!!!!!!!!!!!\n",err,"!!!!!!!!!\n")
    callback(err);
  })

}

module.exports = concurrence

/// --- MINER ------------------------------------------------------------------------

concurrence.startMining = (interval) => {
  if(!interval) interval=5000;
  concurrence.syncRequests(interval)
  concurrence.syncReserved(interval)
  concurrence.syncMineQueue(interval)
  concurrence.syncCombineQueue(interval)
  //mine interval
  setInterval(()=>{
    if(!concurrence.BUSY){
      if(concurrence.config.DEBUG) console.log("#*")
      for(let i in concurrence.mineQueue){
        let requestToMine = concurrence.mineQueue[i]
        if(concurrence.config.DEBUG) console.log("#* MINE REQUEST: "+requestToMine+"")
        concurrence.BUSY = requestToMine
        mineRequest(concurrence.BUSY)
        break
      }
    }
  },interval)
  //combine interval
  setInterval(()=>{
    if(!concurrence.BUSY){
      if(concurrence.config.DEBUG) console.log("#%")
      for(let i in concurrence.combineQueue){
        let requestToCombine = concurrence.combineQueue[i]
        if(concurrence.config.DEBUG) console.log("#% COMBINE REQUEST: "+requestToCombine+"")
        concurrence.BUSY = requestToCombine
        combineRequest(concurrence.BUSY)
        break
      }
    }
  },interval)
}


/// --- INTERVALS ------------------------------------------------------------------------

concurrence.syncRequests = (interval) => {
  setInterval(checkForNewRequests,interval)
  checkForNewRequests()
}
concurrence.syncReserved = (interval) => {
  setInterval(checkForReserved,interval)
  setTimeout(checkForReserved,interval/3)
}
concurrence.syncMineQueue = (interval) => {
  setInterval(ResponsesToMineQueue,interval)
  setTimeout(ResponsesToMineQueue,interval/5)
}
concurrence.syncCombineQueue = (interval) => {
  setInterval(CombinerReadyQueue,interval)
  setTimeout(CombinerReadyQueue,interval/7)
}


/// --- ACCOUNT ------------------------------------------------------------------------

concurrence.selectAccount = (account)=>{
  if(typeof account == "String"){
    concurrence.selectedAddress = account
  }else{
    concurrence.selectedAddress = concurrence.accounts[account]
  }
}


/// --- TOKEN ------------------------------------------------------------------------

concurrence.balanceOf = (address)=>{
  if(typeof address == "undefined"){
    address=concurrence.selectedAddress
  }
  if(concurrence.config.DEBUG) console.log("Getting "+concurrence.symbol+" balance of address "+address+" ...")
  return concurrence.contracts["Token"].interface.methods.balanceOf(address).call()
}

concurrence.transfer = (address,amount)=>{
  if(concurrence.config.DEBUG) console.log("Transferring "+amount+" "+concurrence.symbol+" from "+concurrence.selectedAddress+" to "+address+" ...")
  return concurrence.contracts["Token"].interface.methods.transfer(address,amount).send({
    from: concurrence.selectedAddress,
    gas: concurrence.gas,
    gasPrice: concurrence.web3.utils.toWei(concurrence.gasPrice,'gwei')
  })
}

concurrence.reserved = (requestId)=>{
  return concurrence.contracts["Token"].interface.methods.reserved(requestId).call()
}

concurrence.reserve = (requestId,amount)=>{
  if(concurrence.config.DEBUG) console.log("Reserving "+amount+" "+concurrence.symbol+" for request id "+requestId+" ...")
  return concurrence.contracts["Token"].interface.methods.reserve(requestId,amount).send({
    from: concurrence.selectedAddress,
    gas: concurrence.gas,
    gasPrice: concurrence.web3.utils.toWei(concurrence.gasPrice,'gwei')
  })
}

concurrence.staked = (address,requestId,responseId)=>{
  return concurrence.contracts["Token"].interface.methods.staked(address,requestId,responseId).call()
}

concurrence.stake = (requestId,responseId,amount)=>{
  if(concurrence.config.DEBUG) console.log("Staking "+amount+" "+concurrence.symbol+" on response id "+responseId+" (in request "+requestId+") from account "+concurrence.selectedAddress+" ...")
  return concurrence.contracts["Token"].interface.methods.stake(requestId,responseId,amount).send({
    from: concurrence.selectedAddress,
    gas: concurrence.gas,
    gasPrice: concurrence.web3.utils.toWei(concurrence.gasPrice,'gwei')
  })
}

concurrence.listStakes = (address)=>{
  return concurrence.contracts["Responses"].interface.getPastEvents({id:id},{ //you could probably even filter down to the selectedAddress
      fromBlock: concurrence.contracts["Requests"].blockNumber,
      toBlock: 'latest'
  })
}


/// --- REQUESTS ------------------------------------------------------------------------

concurrence.addRequest = (combiner,request,protocol,callback)=>{
  request=JSON.stringify(request)
  if(concurrence.config.DEBUG) console.log("Creating request \""+request+"\" with protocol \""+protocol+"\" to combiner "+combiner)
  //address _combiner, string _request, bytes32 _protocol, address _callback
  return concurrence.contracts["Requests"].interface.methods.addRequest(
    combiner,request,concurrence.web3.utils.fromAscii(protocol),callback
  ).send({
    from: concurrence.selectedAddress,
    gas: concurrence.gas,
    gasPrice: concurrence.web3.utils.toWei(concurrence.gasPrice,'gwei')
  })
}

//this gets the list every time by whaling the local blockchain
//it would probably be better to fire off a thread that runs down
//the chain just once and then keeps up with the latest blocks
concurrence.listRequests = ()=>{
  return concurrence.contracts["Requests"].interface.getPastEvents('AddRequest',{
      fromBlock: concurrence.contracts["Requests"].blockNumber,
      toBlock: 'latest'
  })
}

concurrence.getRequest = (requestId)=>{
  return concurrence.contracts["Requests"].interface.methods.getRequest(requestId).call()
}

concurrence.getCombiner = (requestId)=>{
  return concurrence.contracts["Requests"].interface.methods.getCombiner(requestId).call()
}

concurrence.getCallback = (requestId)=>{
  return concurrence.contracts["Requests"].interface.methods.getCallback(requestId).call()
}



/// --- RESPONSE ------------------------------------------------------------------------

concurrence.addResponse = (request,response)=>{
  if(concurrence.config.DEBUG) console.log("Adding response to request id \""+request+"\": "+response)
  return concurrence.contracts["Responses"].interface.methods.addResponse(request,concurrence.web3.utils.fromAscii(response)).send({
    from: concurrence.selectedAddress,
    gas: concurrence.gas,
    gasPrice: concurrence.web3.utils.toWei(concurrence.gasPrice,'gwei')
  })
}

concurrence.listResponses = (id)=>{
  return concurrence.contracts["Responses"].interface.getPastEvents("AddResponse",{ //you could probably even filter down to the selectedAddress
      filter:{request:id},
      fromBlock: concurrence.contracts["Requests"].blockNumber,
      toBlock: 'latest'
  })
}

concurrence.getResponse = (responseId)=>{
  return concurrence.contracts["Responses"].interface.methods.getResponse(responseId).call()
}

concurrence.getHead = (id)=>{
  return concurrence.contracts["Responses"].interface.methods.heads(id).call()
}


/// --- COMBINER ------------------------------------------------------------------------

concurrence.getCombinerMode = (requestid,address)=>{
  if(!concurrence.combinerContracts[address]) loadCombiner(address)
  return concurrence.combinerContracts[address].methods.mode(requestid).call()
}

concurrence.getCombinerConcurrence = (requestid,address)=>{
  if(!concurrence.combinerContracts[address]) loadCombiner(address)
  return concurrence.combinerContracts[address].methods.concurrence(requestid).call()
}

concurrence.getCombinerWeight = (requestid,address)=>{
  if(!concurrence.combinerContracts[address]) loadCombiner(address)
  return concurrence.combinerContracts[address].methods.weight(requestid).call()
}

concurrence.getCombinerTimestamp = (requestid,address)=>{
  if(!concurrence.combinerContracts[address]) loadCombiner(address)
  return concurrence.combinerContracts[address].methods.timestamp(requestid).call()
}

concurrence.isCombinerOpen = (requestid,address) => {
  if(!concurrence.combinerContracts[address]) loadCombiner(address)
  return concurrence.combinerContracts[address].methods.open(requestid).call()
}

concurrence.isCombinerReady = (requestid,address) => {
  if(!concurrence.combinerContracts[address]) loadCombiner(address)
  return concurrence.combinerContracts[address].methods.ready(requestid).call()
}

concurrence.mineReport = ()=>{}

function combineRequest(requestId){
  if(concurrence.DEBUG_COMBINE) console.log(" # ### COMBINE request "+requestId)
  try{
    concurrence.combine(requestId,concurrence.requests[requestId].combiner).on('error',(err)=>{
      console.log("ERROR",err)
      concurrence.blacklist.push(requestId)
      clearRequestOutOfCombineQueue(requestId)
    }).then((result)=>{
      if(concurrence.DEBUG_COMBINE) console.log(" ### COMBINE BACK:",result.transactionHash)
      if(concurrence.DEBUG_COMBINE){
        fs.writeFileSync("debug/"+result.transactionHash,JSON.stringify(result.events))
         console.log(" ### COMBINE EVENTS WRITTEN TO FILE")
      }
      clearRequestOutOfCombineQueue(requestId)
    })
  }catch(e){console.log(e);console.log("SETTING BUSY TO FALSE:");concurrence.BUSY=false;}
}

function clearRequestOutOfCombineQueue(requestId){
  for(let i in concurrence.combineQueue){
    if(concurrence.combineQueue[i]==requestId){
      concurrence.combineQueue.splice(i, 1)
      break
    }
  }
  concurrence.BUSY=false;
  return;
}

concurrence.combine = (requestid,address)=>{
  if(!concurrence.combinerContracts[address]) loadCombiner(address)
  if(concurrence.DEBUG_COMBINE) console.log(" # ### COMBINING: "+requestid+" in "+address+" with account index "+concurrence.selectedAddress)
  return concurrence.combinerContracts[address].methods.combine(requestid).send({
    from: concurrence.selectedAddress,
    gas: concurrence.gas,
    gasPrice: concurrence.web3.utils.toWei(concurrence.gasPrice,'gwei')
  })
}

concurrence.debugCombiner = (address)=>{
  if(!concurrence.combinerContracts[address]) loadCombiner(address)
  return concurrence.combinerContracts[address].getPastEvents("Debug",{ //you could probably even filter down to the selectedAddress
      fromBlock: 0,
      toBlock: 'latest'
  })
}
concurrence.debugCombinerGas = (address)=>{
  if(!concurrence.combinerContracts[address]) loadCombiner(address)
  return concurrence.combinerContracts[address].getPastEvents("DebugGas",{ //you could probably even filter down to the selectedAddress
      fromBlock: 0,
      toBlock: 'latest'
  })
}

function loadCombiner(address){
  if(concurrence.config.DEBUG) console.log("Loading Combiner "+address)
  //combiner abi should probably be hardcoded in software, the should all be exactly the same
  try{
    let combinerAbi = JSON.parse(fs.readFileSync("../../Combiner/basic/Combiner.abi").toString().trim())
    let combinerContract = new concurrence.web3.eth.Contract(combinerAbi,address)
    concurrence.combinerContracts[address] = combinerContract
    return concurrence.combinerContracts[address]
  }catch(e){console.log(e)}

}

/// --- EXTRAS ------------------------------------------------------------------------

concurrence.listDebug = (debugArray) =>{
  for(let a in debugArray){
    console.log(debugArray[a].returnValues)
  }
}

/// --- HELPERS ------------------------------------------------------------------------

/*
look through requests and find out if any of them are ready for the combiner to run
*/
function CombinerReadyQueue(){
  for(let r in concurrence.requests){
    if( concurrence.requests[r].reserved > 0){

      //first, check to see if the combiner is

      //second, check to see if the combiner is ready to combine
      concurrence.isCombinerReady(r,concurrence.requests[r].combiner).then((ready)=>{
        //console.log(" >> combiner ready: ",ready)
        if(ready){
          if(concurrence.blacklist.indexOf(r)<0){
            if(!concurrence.combineQueue) {concurrence.combineQueue = [];}
            if(concurrence.combineQueue.indexOf(r)<0){
              //console.log("!!!!!! PUSH")
              concurrence.combineQueue.push(r)
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
  for(let r in concurrence.requests){
    if( concurrence.requests[r].reserved > 0){
      //console.log(" >> FOUND a request "+r+" with some coin...")
      concurrence.listResponses(r).then((responseEvents)=>{
        let foundMyAddressInResponses = false
        for(let r in responseEvents){
          if(responseEvents[r].returnValues.sender == concurrence.selectedAddress) {
            foundMyAddressInResponses = true;
            break;
          }
        }
        if(responseEvents.length==0 || !foundMyAddressInResponses){
          if(!concurrence.mineQueue) {concurrence.mineQueue = [];}
          if(concurrence.mineQueue.indexOf(r)<0){
            concurrence.mineQueue.push(r)
          }
        }
      })
    }else{
      //console.log(" >> request "+r+" has no tokens reserved")
    }
  }
}




function mineRequest(requestId){
  if(concurrence.DEBUG_MINER) console.log(" # ### MINING request "+requestId)
  try{
    let request = JSON.parse(concurrence.requests[requestId].request);
    let protocol = concurrence.requests[requestId].protocol
    if(concurrence.config.DEBUG) console.log(" ## URL: "+request.url)
    Request(request.url,(error, response, body)=>{
      if(concurrence.DEBUG_MINER) console.log(body);
      concurrence.addResponse(requestId,body).on('error',(err)=>{
        console.log("ERROR",err)
        concurrence.blacklist.push(requestId)
        clearRequestOutOfMineQueue(requestId)
      }).then((result)=>{
        if(concurrence.DEBUG_MINER) console.log(result)
        if(concurrence.DEBUG_MINER) console.log(" ## RETURNED:",result.events.AddResponse.returnValues)
        let responseId = result.events.AddResponse.returnValues.id
        if(concurrence.DEBUG_MINER) console.log(" ## RESPONSE ID: "+responseId)
        concurrence.stake(requestId,responseId,concurrence.AMOUNT_TO_STAKE).on('error',(err)=>{
          console.log("ERROR",err)
          concurrence.blacklist.push(requestId)
          clearRequestOutOfMineQueue(requestId)
        }).then((result)=>{
          if(concurrence.DEBUG_MINER) console.log(result)
          clearRequestOutOfMineQueue(requestId)
        })
      })
    });
  }catch(e){console.log(e);concurrence.BUSY=false;}
}

function clearRequestOutOfMineQueue(requestId){
  for(let i in concurrence.mineQueue){
    if(concurrence.mineQueue[i]==requestId){
      concurrence.mineQueue.splice(i, 1)
      break
    }
  }
  concurrence.BUSY=false;
}


function checkForReserved(){
  for(let id in concurrence.requests) {
    concurrence.reserved(id).then((reserved)=>{
      concurrence.requests[id].reserved = reserved
    })
  }
}

function checkForNewRequests(){
  if(!concurrence.requests) concurrence.requests=[];
  concurrence.listRequests().then((requests)=>{
    let count = 0
    let total = 0
    for(let r in requests){
      total++
      if(!concurrence.requests[requests[r].returnValues.id]) {
        concurrence.requests[requests[r].returnValues.id] = requests[r].returnValues;
        count++
      }
    }
    if(concurrence.config.DEBUG) console.log("# Synced "+count+" new requests out of "+total)
  })
}

function getAccounts(){
  return new Promise((resolve, reject) => {
    concurrence.web3.eth.getAccounts().then((accounts)=>{
      if(accounts) {
        concurrence.accounts=accounts
        if(concurrence.config.DEBUG) console.log("Selecting default (coinbase) account...")
        concurrence.selectedAddress=accounts[0]
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

  try{fs.mkdirSync(concurrence.storage)}catch(e){}
  try{fs.mkdirSync(concurrence.storage+"abis")}catch(e){}
}

function connectToEthereumNetwork(){
  if(concurrence.config.IPC){
    if(concurrence.config.DEBUG) console.log("Using IPC ("+config.IPC+") ...")
    connectionString = config.IPC// ex: '/Users/austingriffith/Library/Ethereum/testnet/geth.ipc'
    concurrence.web3 = new Web3(new Web3.providers.IpcProvider(connectionString, socketClient))
  } else if(concurrence.config.RPC){
    if(concurrence.config.DEBUG) console.log("Using RPC ("+config.RPC+") ...")
    connectionString = config.RPC// ex: "http://localhost:8545"
    concurrence.web3 = new Web3(new Web3.providers.HttpProvider(connectionString))
  } else {
    if(concurrence.config.DEBUG) console.log("Using Default RPC...")
    connectionString = "http://localhost:8545"
    concurrence.web3 = new Web3(new Web3.providers.HttpProvider(connectionString))
  }
}

function loadContract(name){
  return new Promise((resolve, reject) => {
    if(concurrence.config.DEBUG) console.log("Loading contract "+name+" ...")
    let address
    let abi
    //first, check to see if we can load the contract address from the main contract
    if(concurrence.contracts["Main"]){
      if(concurrence.config.DEBUG) console.log("Connecting to Main contract to get "+name+" address ...")
      concurrence.contracts["Main"].interface.methods.getContract(
          concurrence.web3.utils.fromAscii(name)
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
        address = fs.readFileSync(concurrence.storage+name+".address").toString().trim()
        abi = JSON.parse(fs.readFileSync(concurrence.storage+"abis/"+address+".abi").toString())
        concurrence.contracts[name] = {address: address,abi: abi,interface: new concurrence.web3.eth.Contract(abi,address)}
        resolve(concurrence.contracts[name])
      }catch(e){
        //finally, go to the webserver since can't find it anywhere locally
        let addressUrl = 'http://'+concurrence.server+'/address/'+name
        if(concurrence.config.DEBUG) console.log("Connecting to "+addressUrl+" ...")
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
          fs.writeFileSync(concurrence.storage+name+".address",address)
          fs.writeFileSync(concurrence.storage+"abis/"+address+".abi",JSON.stringify(abi))
          fs.writeFileSync(concurrence.storage+"abis/"+address+".blockNumber",blockNumber)
          concurrence.contracts[name] = {
            address: address,
            abi: abi,
            blockNumber: blockNumber,
            interface: new concurrence.web3.eth.Contract(abi,address)
          }
          resolve(concurrence.contracts[name])
        }
      })
    }
  })
}


function loadContractAbi(name,address,callback){
  let abi
  try{
    abi = JSON.parse(fs.readFileSync(concurrence.storage+"abis/"+address+".abi").toString())
    callback(null,abi)
  }catch(e){
    let abiUrl = 'http://'+concurrence.server+'/abi/'+name
    if(concurrence.config.DEBUG) console.log("Connecting to "+abiUrl+" ...")
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
    blockNumber = fs.readFileSync(concurrence.storage+"abis/"+address+".blockNumber").toString()
    callback(null,blockNumber)
  }catch(e){
    let abiUrl = 'http://'+concurrence.server+'/blockNumber/'+name
    if(concurrence.config.DEBUG) console.log("Connecting to "+abiUrl+" ...")
    Request(abiUrl,(error, response, body)=>{
      if(!error){
        callback(null,body)
      }
    })
  }
}
