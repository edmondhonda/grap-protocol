// ============ Contracts ============

// Token
// deployed first
const GLUEImplementation = artifacts.require("GLUEDelegate");
const GLUEProxy = artifacts.require("GLUEDelegator");

// Rs
// deployed second
const GLUEReserves = artifacts.require("GLUEReserves");
const GLUERebaser = artifacts.require("GLUERebaser");

// ============ Main Migration ============

const migration = async (deployer, network, accounts) => {
  await Promise.all([
    deployRs(deployer, network),
  ]);
};

module.exports = migration;

// ============ Deploy Functions ============


async function deployRs(deployer, network) {
  let reserveToken = "0xdF5e0e81Dff6FAF3A7e52BA697820c5e32D806A8";
  let uniswap_factory = "0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f";
  await deployer.deploy(GLUEReserves, reserveToken, GLUEProxy.address);
  await deployer.deploy(GLUERebaser,
      GLUEProxy.address,
      reserveToken,
      uniswap_factory,
      GLUEReserves.address
  );
  let rebase = new web3.eth.Contract(GLUERebaser.abi, GLUERebaser.address);

  let pair = await rebase.methods.uniswap_pair().call();
  console.log("GLUEProxy address is " + GLUEProxy.address);
  console.log("Uniswap pair is " + pair);
  let glue = await GLUEProxy.deployed();
  await glue._setRebaser(GLUERebaser.address);
  let reserves = await GLUEReserves.deployed();
  await reserves._setRebaser(GLUERebaser.address)
}
