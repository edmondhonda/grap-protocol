var fs = require('fs')

// ============ Contracts ============


// Protocol
// deployed second
const GLUEImplementation = artifacts.require("GLUEDelegate");
const GLUEProxy = artifacts.require("GLUEDelegator");

// deployed third
const GLUEReserves = artifacts.require("GLUEReserves");
const GLUERebaser = artifacts.require("GLUERebaser");

const Gov = artifacts.require("GovernorAlpha");
const Timelock = artifacts.require("Timelock");

// deployed fourth
const GLUE_ETHPool = artifacts.require("GLUEETHPool");
const GLUE_YAMPool = artifacts.require("GLUEYAMPool");
const GLUE_YFIPool = artifacts.require("GLUEYFIPool");
const GLUE_LINKPool = artifacts.require("GLUELINKPool");
const GLUE_MKRPool = artifacts.require("GLUEMKRPool");
const GLUE_LENDPool = artifacts.require("GLUELENDPool");
const GLUE_COMPPool = artifacts.require("GLUECOMPPool");
const GLUE_SNXPool = artifacts.require("GLUESNXPool");
const GLUE_YFIIPool = artifacts.require("GLUEYFIIPool");
const GLUE_CRVPool = artifacts.require("GLUECRVPool");

// deployed fifth
const GLUEIncentivizer = artifacts.require("GLUEIncentivizer");

// ============ Main Migration ============

const migration = async (deployer, network, accounts) => {
  await Promise.all([
    // deployTestContracts(deployer, network),
    deployDistribution(deployer, network, accounts),
    // deploySecondLayer(deployer, network)
  ]);
}

module.exports = migration;

// ============ Deploy Functions ============


async function deployDistribution(deployer, network, accounts) {
  console.log(network)
  let glue = await GLUEProxy.deployed();
  let yReserves = await GLUEReserves.deployed()
  let yRebaser = await GLUERebaser.deployed()
  let tl = await Timelock.deployed();
  let gov = await Gov.deployed();
  if (network != "test") {
    await deployer.deploy(GLUE_ETHPool);
    await deployer.deploy(GLUE_YAMPool);
    await deployer.deploy(GLUE_YFIPool);
    await deployer.deploy(GLUEIncentivizer);
    await deployer.deploy(GLUE_LINKPool);
    await deployer.deploy(GLUE_MKRPool);
    await deployer.deploy(GLUE_LENDPool);
    await deployer.deploy(GLUE_COMPPool);
    await deployer.deploy(GLUE_SNXPool);
    await deployer.deploy(GLUE_YFIIPool);
    await deployer.deploy(GLUE_CRVPool);

    let eth_pool = new web3.eth.Contract(GLUE_ETHPool.abi, GLUE_ETHPool.address);
    let yam_pool = new web3.eth.Contract(GLUE_YAMPool.abi, GLUE_YAMPool.address);
    let yfi_pool = new web3.eth.Contract(GLUE_YFIPool.abi, GLUE_YFIPool.address);
    let lend_pool = new web3.eth.Contract(GLUE_LENDPool.abi, GLUE_LENDPool.address);
    let mkr_pool = new web3.eth.Contract(GLUE_MKRPool.abi, GLUE_MKRPool.address);
    let snx_pool = new web3.eth.Contract(GLUE_SNXPool.abi, GLUE_SNXPool.address);
    let comp_pool = new web3.eth.Contract(GLUE_COMPPool.abi, GLUE_COMPPool.address);
    let link_pool = new web3.eth.Contract(GLUE_LINKPool.abi, GLUE_LINKPool.address);
    let yfii_pool = new web3.eth.Contract(GLUE_YFIIPool.abi, GLUE_YFIIPool.address);
    let crv_pool = new web3.eth.Contract(GLUE_CRVPool.abi, GLUE_CRVPool.address);
    let ycrv_pool = new web3.eth.Contract(GLUEIncentivizer.abi, GLUEIncentivizer.address);

    console.log("setting distributor");
    await Promise.all([
        eth_pool.methods.setRewardDistribution("0xFc00C14b89C475B0237924D0FA99ECc492F7f9D6").send({from: "0xFc00C14b89C475B0237924D0FA99ECc492F7f9D6", gas: 100000}),
        yam_pool.methods.setRewardDistribution("0xFc00C14b89C475B0237924D0FA99ECc492F7f9D6").send({from: "0xFc00C14b89C475B0237924D0FA99ECc492F7f9D6", gas: 100000}),
        yfi_pool.methods.setRewardDistribution("0xFc00C14b89C475B0237924D0FA99ECc492F7f9D6").send({from: "0xFc00C14b89C475B0237924D0FA99ECc492F7f9D6", gas: 100000}),
        lend_pool.methods.setRewardDistribution("0xFc00C14b89C475B0237924D0FA99ECc492F7f9D6").send({from: "0xFc00C14b89C475B0237924D0FA99ECc492F7f9D6", gas: 100000}),
        mkr_pool.methods.setRewardDistribution("0xFc00C14b89C475B0237924D0FA99ECc492F7f9D6").send({from: "0xFc00C14b89C475B0237924D0FA99ECc492F7f9D6", gas: 100000}),
        snx_pool.methods.setRewardDistribution("0xFc00C14b89C475B0237924D0FA99ECc492F7f9D6").send({from: "0xFc00C14b89C475B0237924D0FA99ECc492F7f9D6", gas: 100000}),
        comp_pool.methods.setRewardDistribution("0xFc00C14b89C475B0237924D0FA99ECc492F7f9D6").send({from: "0xFc00C14b89C475B0237924D0FA99ECc492F7f9D6", gas: 100000}),
        link_pool.methods.setRewardDistribution("0xFc00C14b89C475B0237924D0FA99ECc492F7f9D6").send({from: "0xFc00C14b89C475B0237924D0FA99ECc492F7f9D6", gas: 100000}),
        yfii_pool.methods.setRewardDistribution("0xFc00C14b89C475B0237924D0FA99ECc492F7f9D6").send({from: "0xFc00C14b89C475B0237924D0FA99ECc492F7f9D6", gas: 100000}),
        crv_pool.methods.setRewardDistribution("0xFc00C14b89C475B0237924D0FA99ECc492F7f9D6").send({from: "0xFc00C14b89C475B0237924D0FA99ECc492F7f9D6", gas: 100000}),
        ycrv_pool.methods.setRewardDistribution("0xFc00C14b89C475B0237924D0FA99ECc492F7f9D6").send({from: "0xFc00C14b89C475B0237924D0FA99ECc492F7f9D6", gas: 100000}),
      ]);

    let twenty = web3.utils.toBN(10**3).mul(web3.utils.toBN(10**18)).mul(web3.utils.toBN(20));
    let one_five = web3.utils.toBN(10**3).mul(web3.utils.toBN(10**18)).mul(web3.utils.toBN(100));

    console.log("transfering and notifying");
    console.log("eth");
    await Promise.all([
      glue.transfer(GLUE_ETHPool.address, twenty.toString()),
      glue.transfer(GLUE_YAMPool.address, twenty.toString()),
      glue.transfer(GLUE_YFIPool.address, twenty.toString()),
      glue.transfer(GLUE_LENDPool.address, twenty.toString()),
      glue.transfer(GLUE_MKRPool.address, twenty.toString()),
      glue.transfer(GLUE_SNXPool.address, twenty.toString()),
      glue.transfer(GLUE_COMPPool.address, twenty.toString()),
      glue.transfer(GLUE_LINKPool.address, twenty.toString()),
      glue.transfer(GLUE_YFIIPool.address, twenty.toString()),
      glue.transfer(GLUE_CRVPool.address, twenty.toString()),
      glue._setIncentivizer(GLUEIncentivizer.address),
    ]);

    await Promise.all([
      eth_pool.methods.notifyRewardAmount(twenty.toString()).send({from:"0xFc00C14b89C475B0237924D0FA99ECc492F7f9D6"}),
      yam_pool.methods.notifyRewardAmount(twenty.toString()).send({from:"0xFc00C14b89C475B0237924D0FA99ECc492F7f9D6"}),
      yfi_pool.methods.notifyRewardAmount(twenty.toString()).send({from:"0xFc00C14b89C475B0237924D0FA99ECc492F7f9D6"}),
      lend_pool.methods.notifyRewardAmount(twenty.toString()).send({from:"0xFc00C14b89C475B0237924D0FA99ECc492F7f9D6"}),
      mkr_pool.methods.notifyRewardAmount(twenty.toString()).send({from:"0xFc00C14b89C475B0237924D0FA99ECc492F7f9D6"}),
      snx_pool.methods.notifyRewardAmount(twenty.toString()).send({from:"0xFc00C14b89C475B0237924D0FA99ECc492F7f9D6"}),
      comp_pool.methods.notifyRewardAmount(twenty.toString()).send({from:"0xFc00C14b89C475B0237924D0FA99ECc492F7f9D6"}),
      link_pool.methods.notifyRewardAmount(twenty.toString()).send({from:"0xFc00C14b89C475B0237924D0FA99ECc492F7f9D6"}),
      yfii_pool.methods.notifyRewardAmount(twenty.toString()).send({from:"0xFc00C14b89C475B0237924D0FA99ECc492F7f9D6"}),
      crv_pool.methods.notifyRewardAmount(twenty.toString()).send({from:"0xFc00C14b89C475B0237924D0FA99ECc492F7f9D6"}),

      // incentives is a minter and prepopulates itself.
      ycrv_pool.methods.notifyRewardAmount("0").send({from: "0xFc00C14b89C475B0237924D0FA99ECc492F7f9D6", gas: 500000}),
    ]);

    await Promise.all([
      eth_pool.methods.setRewardDistribution(Timelock.address).send({from: "0xFc00C14b89C475B0237924D0FA99ECc492F7f9D6", gas: 100000}),
      yam_pool.methods.setRewardDistribution(Timelock.address).send({from: "0xFc00C14b89C475B0237924D0FA99ECc492F7f9D6", gas: 100000}),
      yfi_pool.methods.setRewardDistribution(Timelock.address).send({from: "0xFc00C14b89C475B0237924D0FA99ECc492F7f9D6", gas: 100000}),
      lend_pool.methods.setRewardDistribution(Timelock.address).send({from: "0xFc00C14b89C475B0237924D0FA99ECc492F7f9D6", gas: 100000}),
      mkr_pool.methods.setRewardDistribution(Timelock.address).send({from: "0xFc00C14b89C475B0237924D0FA99ECc492F7f9D6", gas: 100000}),
      snx_pool.methods.setRewardDistribution(Timelock.address).send({from: "0xFc00C14b89C475B0237924D0FA99ECc492F7f9D6", gas: 100000}),
      comp_pool.methods.setRewardDistribution(Timelock.address).send({from: "0xFc00C14b89C475B0237924D0FA99ECc492F7f9D6", gas: 100000}),
      link_pool.methods.setRewardDistribution(Timelock.address).send({from: "0xFc00C14b89C475B0237924D0FA99ECc492F7f9D6", gas: 100000}),
      yfii_pool.methods.setRewardDistribution(Timelock.address).send({from: "0xFc00C14b89C475B0237924D0FA99ECc492F7f9D6", gas: 100000}),
      crv_pool.methods.setRewardDistribution(Timelock.address).send({from: "0xFc00C14b89C475B0237924D0FA99ECc492F7f9D6", gas: 100000}),
      ycrv_pool.methods.setRewardDistribution(Timelock.address).send({from: "0xFc00C14b89C475B0237924D0FA99ECc492F7f9D6", gas: 100000}),
    ]);
    await Promise.all([
      eth_pool.methods.transferOwnership(Timelock.address).send({from: "0xFc00C14b89C475B0237924D0FA99ECc492F7f9D6", gas: 100000}),
      yam_pool.methods.transferOwnership(Timelock.address).send({from: "0xFc00C14b89C475B0237924D0FA99ECc492F7f9D6", gas: 100000}),
      yfi_pool.methods.transferOwnership(Timelock.address).send({from: "0xFc00C14b89C475B0237924D0FA99ECc492F7f9D6", gas: 100000}),
      lend_pool.methods.transferOwnership(Timelock.address).send({from: "0xFc00C14b89C475B0237924D0FA99ECc492F7f9D6", gas: 100000}),
      mkr_pool.methods.transferOwnership(Timelock.address).send({from: "0xFc00C14b89C475B0237924D0FA99ECc492F7f9D6", gas: 100000}),
      snx_pool.methods.transferOwnership(Timelock.address).send({from: "0xFc00C14b89C475B0237924D0FA99ECc492F7f9D6", gas: 100000}),
      comp_pool.methods.transferOwnership(Timelock.address).send({from: "0xFc00C14b89C475B0237924D0FA99ECc492F7f9D6", gas: 100000}),
      link_pool.methods.transferOwnership(Timelock.address).send({from: "0xFc00C14b89C475B0237924D0FA99ECc492F7f9D6", gas: 100000}),
      yfii_pool.methods.transferOwnership(Timelock.address).send({from: "0xFc00C14b89C475B0237924D0FA99ECc492F7f9D6", gas: 100000}),
      crv_pool.methods.transferOwnership(Timelock.address).send({from: "0xFc00C14b89C475B0237924D0FA99ECc492F7f9D6", gas: 100000}),
      ycrv_pool.methods.transferOwnership(Timelock.address).send({from: "0xFc00C14b89C475B0237924D0FA99ECc492F7f9D6", gas: 100000}),
    ]);
  }

  await Promise.all([
    glue._setPendingGov(Timelock.address),
    yReserves._setPendingGov(Timelock.address),
    yRebaser._setPendingGov(Timelock.address),
  ]);

  await Promise.all([
      tl.executeTransaction(
        GLUEProxy.address,
        0,
        "_acceptGov()",
        "0x",
        0
      ),

      tl.executeTransaction(
        GLUEReserves.address,
        0,
        "_acceptGov()",
        "0x",
        0
      ),

      tl.executeTransaction(
        GLUERebaser.address,
        0,
        "_acceptGov()",
        "0x",
        0
      ),
  ]);
  await tl.setPendingAdmin(Gov.address);
  await gov.__acceptAdmin();
  await gov.__abdicate();
}
