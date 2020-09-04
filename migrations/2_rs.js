// ============ Contracts ============

// Token
// deployed first
const RAMENImplementation = artifacts.require("RAMENDelegate");
const RAMENProxy = artifacts.require("RAMENDelegator");

// Rs
// deployed second
const RAMENReserves = artifacts.require("RAMENReserves");
const RAMENRebaser = artifacts.require("RAMENRebaser");

// ============ Main Migration ============

const migration = async (deployer, network, accounts) => {
  await Promise.all([
    deployRs(deployer, network),
  ]);
};

module.exports = migration;

// ============ Deploy Functions ============


async function deployRs(deployer, network) {
  let reserveToken = "0x514910771AF9Ca656af840dff83E8264EcF986CA";
  let uniswap_factory = "0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f";
  await deployer.deploy(RAMENReserves, reserveToken, RAMENProxy.address);
  await deployer.deploy(RAMENRebaser,
      RAMENProxy.address,
      reserveToken,
      uniswap_factory,
      RAMENReserves.address
  );
  let rebase = new web3.eth.Contract(RAMENRebaser.abi, RAMENRebaser.address);

  let pair = await rebase.methods.uniswap_pair().call();
  console.log("RAMENProxy address is " + RAMENProxy.address);
  console.log("Uniswap pair is " + pair);
  let ramen = await RAMENProxy.deployed();
  await ramen._setRebaser(RAMENRebaser.address);
  let reserves = await RAMENReserves.deployed();
  await reserves._setRebaser(RAMENRebaser.address)
}
