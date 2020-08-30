import {ethers} from 'ethers'

import BigNumber from 'bignumber.js'

import {PROPOSALSTATUSCODE} from '../ramen/lib/constants'

BigNumber.config({
  EXPONENTIAL_AT: 1000,
  DECIMAL_PLACES: 80,
});

const GAS_LIMIT = {
  STAKING: {
    DEFAULT: 200000,
    SNX: 850000,
  }
};

export const getPoolStartTime = async (poolContract) => {
  return await poolContract.methods.starttime().call()
}

export const stake = async (poolContract, amount, account, tokenName) => {
  let now = new Date().getTime() / 1000;
  const gas = GAS_LIMIT.STAKING[tokenName.toUpperCase()] || GAS_LIMIT.STAKING.DEFAULT;
  if (now >= 1597172400) {
    return poolContract.methods
      .stake((new BigNumber(amount).times(new BigNumber(10).pow(18))).toString())
      .send({ from: account, gas })
      .on('transactionHash', tx => {
        console.log(tx)
        return tx.transactionHash
      })
  } else {
    alert("pool not active");
  }
}

export const unstake = async (poolContract, amount, account) => {
  let now = new Date().getTime() / 1000;
  if (now >= 1597172400) {
    return poolContract.methods
      .withdraw((new BigNumber(amount).times(new BigNumber(10).pow(18))).toString())
      .send({ from: account, gas: 200000 })
      .on('transactionHash', tx => {
        console.log(tx)
        return tx.transactionHash
      })
  } else {
    alert("pool not active");
  }
}

export const harvest = async (poolContract, account) => {
  let now = new Date().getTime() / 1000;
  if (now >= 1597172400) {
    return poolContract.methods
      .getReward()
      .send({ from: account, gas: 400000 })
      .on('transactionHash', tx => {
        console.log(tx)
        return tx.transactionHash
      })
  } else {
    alert("pool not active");
  }
}

export const redeem = async (poolContract, account) => {
  let now = new Date().getTime() / 1000;
  if (now >= 1597172400) {
    return poolContract.methods
      .exit()
      .send({ from: account, gas: 200000 })
      .on('transactionHash', tx => {
        console.log(tx)
        return tx.transactionHash
      })
  } else {
    alert("pool not active");
  }
}

export const approve = async (tokenContract, poolContract, account) => {
  return tokenContract.methods
    .approve(poolContract.options.address, ethers.constants.MaxUint256)
    .send({ from: account, gas: 80000 })
}

export const rebase = async (ramen, account) => {
  return ramen.contracts.rebaser.methods.rebase().send({ from: account })
}

export const getPoolContracts = async (ramen) => {
  const pools = Object.keys(ramen.contracts)
    .filter(c => c.indexOf('_pool') !== -1)
    .reduce((acc, cur) => {
      const newAcc = { ...acc }
      newAcc[cur] = ramen.contracts[cur]
      return newAcc
    }, {})
  return pools
}

export const getEarned = async (ramen, pool, account) => {
  const scalingFactor = new BigNumber(await ramen.contracts.ramen.methods.ramensScalingFactor().call())
  const earned = new BigNumber(await pool.methods.earned(account).call())
  return earned.multipliedBy(scalingFactor.dividedBy(new BigNumber(10).pow(18)))
}

export const getStaked = async (ramen, pool, account) => {
  return ramen.toBigN(await pool.methods.balanceOf(account).call())
}

export const getCurrentPrice = async (ramen) => {
  // FORBROCK: get current RAMEN price
  return ramen.toBigN(await ramen.contracts.rebaser.methods.getCurrentTWAP().call())
}

export const getTargetPrice = async (ramen) => {
  return ramen.toBigN(1).toFixed(2);
}

export const getCirculatingSupply = async (ramen) => {
  let now = await ramen.web3.eth.getBlock('latest');
  let scalingFactor = ramen.toBigN(await ramen.contracts.ramen.methods.ramensScalingFactor().call());
  let starttime = ramen.toBigN(await ramen.contracts.eth_pool.methods.starttime().call()).toNumber();
  let timePassed = now["timestamp"] - starttime;
  if (timePassed < 0) {
    return 0;
  }
  let ramensDistributed = ramen.toBigN(8 * timePassed * 250000 / 625000); //ramens from first 8 pools
  let starttimePool2 = ramen.toBigN(await ramen.contracts.ycrvUNIV_pool.methods.starttime().call()).toNumber();
  timePassed = now["timestamp"] - starttime;
  let pool2Yams = ramen.toBigN(timePassed * 1500000 / 625000); // ramens from second pool. note: just accounts for first week
  let circulating = pool2Yams.plus(ramensDistributed).times(scalingFactor).div(10**36).toFixed(2)
  return circulating
}

export const getNextRebaseTimestamp = async (yam) => {
  try {
    let now = await yam.web3.eth.getBlock('latest').then(res => res.timestamp);
    let interval = 86400; // 24 hours
    let offset = 0; // 0AM utc
    let secondsToRebase = 0;
    if (await yam.contracts.rebaser.methods.rebasingActive().call()) {
      if (now % interval > offset) {
          secondsToRebase = (interval - (now % interval)) + offset;
       } else {
          secondsToRebase = offset - (now % interval);
      }
    } else {
      let twap_init = yam.toBigN(await yam.contracts.rebaser.methods.timeOfTWAPInit().call()).toNumber();
      if (twap_init > 0) {
        let delay = yam.toBigN(await yam.contracts.rebaser.methods.rebaseDelay().call()).toNumber();
        let endTime = twap_init + delay;
        if (endTime % interval > offset) {
            secondsToRebase = (interval - (endTime % interval)) + offset;
         } else {
            secondsToRebase = offset - (endTime % interval);
        }
        return endTime + secondsToRebase;
      } else {
        return now + 13*60*60; // just know that its greater than 12 hours away
      }
    }
    return now + secondsToRebase
  } catch (e) {
    console.log(e)
  }
}

export const getTotalSupply = async (ramen) => {
  return await ramen.contracts.ramen.methods.totalSupply().call();
}

export const getStats = async (ramen) => {
  const curPrice = await getCurrentPrice(ramen)
  const circSupply = await getCirculatingSupply(ramen)
  const nextRebase = await getNextRebaseTimestamp(ramen)
  const targetPrice = await getTargetPrice(ramen)
  const totalSupply = await getTotalSupply(ramen)
  return {
    circSupply,
    curPrice,
    nextRebase,
    targetPrice,
    totalSupply
  }
}


// gov
export const getProposals = async (ramen) => {
  let proposals = []
  const filter = {
    fromBlock: 0,
    toBlock: 'latest',
  }
  const events = await ramen.contracts.gov.getPastEvents("allEvents", filter)
  for (let i = 0; i < events.length; i++) {
    const event = events[i]
    console.log(event)
    if (event.removed === false) {
      switch (event.event) {
        case "ProposalCreated":
          proposals.push(
            {
              id: event.returnValues.id,
              proposer: event.returnValues.proposer,
              description: event.returnValues.description,
              startBlock: Number(event.returnValues.startBlock),
              endBlock: Number(event.returnValues.endBlock),
              targets: event.returnValues.targets,
              values: event.returnValues.values,
              signatures: event.returnValues.signatures,
              status: PROPOSALSTATUSCODE.CREATED,
              transactionHash: event.transactionHash
            }
          )
          break
        // TODO
        case "ProposalCanceled":
          break
        case "VoteCast":
            break
        case "ProposalExecuted":
          break
        default:
          break
      }
    }
  }
  proposals.sort((a,b) => Number(b.endBlock) - Number(b.endBlock))
  return proposals
}

export const getProposal = async (ramen, id) => {
  const proposals = await getProposals(ramen)
  const proposal = proposals.find(p => p.id === id )
  return proposal
}

export const getProposalStatus = async (ramen, id) => {
  const proposalStatus = (await ramen.contracts.gov.methods.proposals(id).call())
  return proposalStatus
}

export const getQuorumVotes = async (ramen) => {
  return new BigNumber(await ramen.contracts.gov.methods.quorumVotes().call()).div(10**6)
}

export const getProposalThreshold = async (ramen) => {
  return new BigNumber(await ramen.contracts.gov.methods.proposalThreshold().call()).div(10**6)
}

export const getCurrentVotes = async (ramen, account) => {
  return ramen.toBigN(await ramen.contracts.ramen.methods.getCurrentVotes(account).call()).div(10**6)
}

export const delegate = async (ramen, account, from) => {
  return ramen.contracts.ramen.methods.delegate(account).send({from: from, gas: 320000 })
}

export const castVote = async (ramen, id, support, from) => {
  return ramen.contracts.gov.methods.castVote(id, support).send({from: from, gas: 320000 })
}
