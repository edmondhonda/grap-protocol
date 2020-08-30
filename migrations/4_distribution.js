var fs = require('fs')

// ============ Contracts ============


// Protocol
// deployed second
const RAMENImplementation = artifacts.require("RAMENDelegate");
const RAMENProxy = artifacts.require("RAMENDelegator");

// deployed third
const RAMENReserves = artifacts.require("RAMENReserves");
const RAMENRebaser = artifacts.require("RAMENRebaser");

const Gov = artifacts.require("GovernorAlpha");
const Timelock = artifacts.require("Timelock");

// deployed fourth
const RAMEN_ETHPool = artifacts.require("RAMENETHPool");
const RAMEN_YAMPool = artifacts.require("RAMENYAMPool");
const RAMEN_YFIPool = artifacts.require("RAMENYFIPool");
const RAMEN_LINKPool = artifacts.require("RAMENLINKPool");
const RAMEN_MKRPool = artifacts.require("RAMENMKRPool");
const RAMEN_LENDPool = artifacts.require("RAMENLENDPool");
const RAMEN_COMPPool = artifacts.require("RAMENCOMPPool");
const RAMEN_SNXPool = artifacts.require("RAMENSNXPool");
const RAMEN_YFIIPool = artifacts.require("RAMENYFIIPool");
const RAMEN_CRVPool = artifacts.require("RAMENCRVPool");

// deployed fifth
const RAMENIncentivizer = artifacts.require("RAMENIncentivizer");

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
  let ramen = await RAMENProxy.deployed();
  let yReserves = await RAMENReserves.deployed()
  let yRebaser = await RAMENRebaser.deployed()
  let tl = await Timelock.deployed();
  let gov = await Gov.deployed();
  if (network != "test") {
    await deployer.deploy(RAMEN_ETHPool);
    await deployer.deploy(RAMEN_YAMPool);
    await deployer.deploy(RAMEN_YFIPool);
    await deployer.deploy(RAMENIncentivizer);
    await deployer.deploy(RAMEN_LINKPool);
    await deployer.deploy(RAMEN_MKRPool);
    await deployer.deploy(RAMEN_LENDPool);
    await deployer.deploy(RAMEN_COMPPool);
    await deployer.deploy(RAMEN_SNXPool);
    await deployer.deploy(RAMEN_YFIIPool);
    await deployer.deploy(RAMEN_CRVPool);

    let eth_pool = new web3.eth.Contract(RAMEN_ETHPool.abi, RAMEN_ETHPool.address);
    let yam_pool = new web3.eth.Contract(RAMEN_YAMPool.abi, RAMEN_YAMPool.address);
    let yfi_pool = new web3.eth.Contract(RAMEN_YFIPool.abi, RAMEN_YFIPool.address);
    let lend_pool = new web3.eth.Contract(RAMEN_LENDPool.abi, RAMEN_LENDPool.address);
    let mkr_pool = new web3.eth.Contract(RAMEN_MKRPool.abi, RAMEN_MKRPool.address);
    let snx_pool = new web3.eth.Contract(RAMEN_SNXPool.abi, RAMEN_SNXPool.address);
    let comp_pool = new web3.eth.Contract(RAMEN_COMPPool.abi, RAMEN_COMPPool.address);
    let link_pool = new web3.eth.Contract(RAMEN_LINKPool.abi, RAMEN_LINKPool.address);
    let yfii_pool = new web3.eth.Contract(RAMEN_YFIIPool.abi, RAMEN_YFIIPool.address);
    let crv_pool = new web3.eth.Contract(RAMEN_CRVPool.abi, RAMEN_CRVPool.address);
    let ycrv_pool = new web3.eth.Contract(RAMENIncentivizer.abi, RAMENIncentivizer.address);

    console.log("setting distributor");
    await Promise.all([
        eth_pool.methods.setRewardDistribution("0xfc49634797a4ae4FB3b8A4A5a185Db77A06bFC7f").send({from: "0xfc49634797a4ae4FB3b8A4A5a185Db77A06bFC7f", gas: 100000}),
        yam_pool.methods.setRewardDistribution("0xfc49634797a4ae4FB3b8A4A5a185Db77A06bFC7f").send({from: "0xfc49634797a4ae4FB3b8A4A5a185Db77A06bFC7f", gas: 100000}),
        yfi_pool.methods.setRewardDistribution("0xfc49634797a4ae4FB3b8A4A5a185Db77A06bFC7f").send({from: "0xfc49634797a4ae4FB3b8A4A5a185Db77A06bFC7f", gas: 100000}),
        lend_pool.methods.setRewardDistribution("0xfc49634797a4ae4FB3b8A4A5a185Db77A06bFC7f").send({from: "0xfc49634797a4ae4FB3b8A4A5a185Db77A06bFC7f", gas: 100000}),
        mkr_pool.methods.setRewardDistribution("0xfc49634797a4ae4FB3b8A4A5a185Db77A06bFC7f").send({from: "0xfc49634797a4ae4FB3b8A4A5a185Db77A06bFC7f", gas: 100000}),
        snx_pool.methods.setRewardDistribution("0xfc49634797a4ae4FB3b8A4A5a185Db77A06bFC7f").send({from: "0xfc49634797a4ae4FB3b8A4A5a185Db77A06bFC7f", gas: 100000}),
        comp_pool.methods.setRewardDistribution("0xfc49634797a4ae4FB3b8A4A5a185Db77A06bFC7f").send({from: "0xfc49634797a4ae4FB3b8A4A5a185Db77A06bFC7f", gas: 100000}),
        link_pool.methods.setRewardDistribution("0xfc49634797a4ae4FB3b8A4A5a185Db77A06bFC7f").send({from: "0xfc49634797a4ae4FB3b8A4A5a185Db77A06bFC7f", gas: 100000}),
        yfii_pool.methods.setRewardDistribution("0xfc49634797a4ae4FB3b8A4A5a185Db77A06bFC7f").send({from: "0xfc49634797a4ae4FB3b8A4A5a185Db77A06bFC7f", gas: 100000}),
        crv_pool.methods.setRewardDistribution("0xfc49634797a4ae4FB3b8A4A5a185Db77A06bFC7f").send({from: "0xfc49634797a4ae4FB3b8A4A5a185Db77A06bFC7f", gas: 100000}),
        ycrv_pool.methods.setRewardDistribution("0xfc49634797a4ae4FB3b8A4A5a185Db77A06bFC7f").send({from: "0xfc49634797a4ae4FB3b8A4A5a185Db77A06bFC7f", gas: 100000}),
      ]);

    let twenty = web3.utils.toBN(10**3).mul(web3.utils.toBN(10**18)).mul(web3.utils.toBN(20));
    let one_five = web3.utils.toBN(10**3).mul(web3.utils.toBN(10**18)).mul(web3.utils.toBN(100));

    console.log("transfering and notifying");
    console.log("eth");
    await Promise.all([
      ramen.transfer(RAMEN_ETHPool.address, twenty.toString()),
      ramen.transfer(RAMEN_YAMPool.address, twenty.toString()),
      ramen.transfer(RAMEN_YFIPool.address, twenty.toString()),
      ramen.transfer(RAMEN_LENDPool.address, twenty.toString()),
      ramen.transfer(RAMEN_MKRPool.address, twenty.toString()),
      ramen.transfer(RAMEN_SNXPool.address, twenty.toString()),
      ramen.transfer(RAMEN_COMPPool.address, twenty.toString()),
      ramen.transfer(RAMEN_LINKPool.address, twenty.toString()),
      ramen.transfer(RAMEN_YFIIPool.address, twenty.toString()),
      ramen.transfer(RAMEN_CRVPool.address, twenty.toString()),
      ramen._setIncentivizer(RAMENIncentivizer.address),
    ]);

    await Promise.all([
      eth_pool.methods.notifyRewardAmount(twenty.toString()).send({from:"0xfc49634797a4ae4FB3b8A4A5a185Db77A06bFC7f"}),
      yam_pool.methods.notifyRewardAmount(twenty.toString()).send({from:"0xfc49634797a4ae4FB3b8A4A5a185Db77A06bFC7f"}),
      yfi_pool.methods.notifyRewardAmount(twenty.toString()).send({from:"0xfc49634797a4ae4FB3b8A4A5a185Db77A06bFC7f"}),
      lend_pool.methods.notifyRewardAmount(twenty.toString()).send({from:"0xfc49634797a4ae4FB3b8A4A5a185Db77A06bFC7f"}),
      mkr_pool.methods.notifyRewardAmount(twenty.toString()).send({from:"0xfc49634797a4ae4FB3b8A4A5a185Db77A06bFC7f"}),
      snx_pool.methods.notifyRewardAmount(twenty.toString()).send({from:"0xfc49634797a4ae4FB3b8A4A5a185Db77A06bFC7f"}),
      comp_pool.methods.notifyRewardAmount(twenty.toString()).send({from:"0xfc49634797a4ae4FB3b8A4A5a185Db77A06bFC7f"}),
      link_pool.methods.notifyRewardAmount(twenty.toString()).send({from:"0xfc49634797a4ae4FB3b8A4A5a185Db77A06bFC7f"}),
      yfii_pool.methods.notifyRewardAmount(twenty.toString()).send({from:"0xfc49634797a4ae4FB3b8A4A5a185Db77A06bFC7f"}),
      crv_pool.methods.notifyRewardAmount(twenty.toString()).send({from:"0xfc49634797a4ae4FB3b8A4A5a185Db77A06bFC7f"}),

      // incentives is a minter and prepopulates itself.
      ycrv_pool.methods.notifyRewardAmount("0").send({from: "0xfc49634797a4ae4FB3b8A4A5a185Db77A06bFC7f", gas: 500000}),
    ]);

    await Promise.all([
      eth_pool.methods.setRewardDistribution(Timelock.address).send({from: "0xfc49634797a4ae4FB3b8A4A5a185Db77A06bFC7f", gas: 100000}),
      yam_pool.methods.setRewardDistribution(Timelock.address).send({from: "0xfc49634797a4ae4FB3b8A4A5a185Db77A06bFC7f", gas: 100000}),
      yfi_pool.methods.setRewardDistribution(Timelock.address).send({from: "0xfc49634797a4ae4FB3b8A4A5a185Db77A06bFC7f", gas: 100000}),
      lend_pool.methods.setRewardDistribution(Timelock.address).send({from: "0xfc49634797a4ae4FB3b8A4A5a185Db77A06bFC7f", gas: 100000}),
      mkr_pool.methods.setRewardDistribution(Timelock.address).send({from: "0xfc49634797a4ae4FB3b8A4A5a185Db77A06bFC7f", gas: 100000}),
      snx_pool.methods.setRewardDistribution(Timelock.address).send({from: "0xfc49634797a4ae4FB3b8A4A5a185Db77A06bFC7f", gas: 100000}),
      comp_pool.methods.setRewardDistribution(Timelock.address).send({from: "0xfc49634797a4ae4FB3b8A4A5a185Db77A06bFC7f", gas: 100000}),
      link_pool.methods.setRewardDistribution(Timelock.address).send({from: "0xfc49634797a4ae4FB3b8A4A5a185Db77A06bFC7f", gas: 100000}),
      yfii_pool.methods.setRewardDistribution(Timelock.address).send({from: "0xfc49634797a4ae4FB3b8A4A5a185Db77A06bFC7f", gas: 100000}),
      crv_pool.methods.setRewardDistribution(Timelock.address).send({from: "0xfc49634797a4ae4FB3b8A4A5a185Db77A06bFC7f", gas: 100000}),
      ycrv_pool.methods.setRewardDistribution(Timelock.address).send({from: "0xfc49634797a4ae4FB3b8A4A5a185Db77A06bFC7f", gas: 100000}),
    ]);
    await Promise.all([
      eth_pool.methods.transferOwnership(Timelock.address).send({from: "0xfc49634797a4ae4FB3b8A4A5a185Db77A06bFC7f", gas: 100000}),
      yam_pool.methods.transferOwnership(Timelock.address).send({from: "0xfc49634797a4ae4FB3b8A4A5a185Db77A06bFC7f", gas: 100000}),
      yfi_pool.methods.transferOwnership(Timelock.address).send({from: "0xfc49634797a4ae4FB3b8A4A5a185Db77A06bFC7f", gas: 100000}),
      lend_pool.methods.transferOwnership(Timelock.address).send({from: "0xfc49634797a4ae4FB3b8A4A5a185Db77A06bFC7f", gas: 100000}),
      mkr_pool.methods.transferOwnership(Timelock.address).send({from: "0xfc49634797a4ae4FB3b8A4A5a185Db77A06bFC7f", gas: 100000}),
      snx_pool.methods.transferOwnership(Timelock.address).send({from: "0xfc49634797a4ae4FB3b8A4A5a185Db77A06bFC7f", gas: 100000}),
      comp_pool.methods.transferOwnership(Timelock.address).send({from: "0xfc49634797a4ae4FB3b8A4A5a185Db77A06bFC7f", gas: 100000}),
      link_pool.methods.transferOwnership(Timelock.address).send({from: "0xfc49634797a4ae4FB3b8A4A5a185Db77A06bFC7f", gas: 100000}),
      yfii_pool.methods.transferOwnership(Timelock.address).send({from: "0xfc49634797a4ae4FB3b8A4A5a185Db77A06bFC7f", gas: 100000}),
      crv_pool.methods.transferOwnership(Timelock.address).send({from: "0xfc49634797a4ae4FB3b8A4A5a185Db77A06bFC7f", gas: 100000}),
      ycrv_pool.methods.transferOwnership(Timelock.address).send({from: "0xfc49634797a4ae4FB3b8A4A5a185Db77A06bFC7f", gas: 100000}),
    ]);
  }

  await Promise.all([
    ramen._setPendingGov(Timelock.address),
    yReserves._setPendingGov(Timelock.address),
    yRebaser._setPendingGov(Timelock.address),
  ]);

  await Promise.all([
      tl.executeTransaction(
        RAMENProxy.address,
        0,
        "_acceptGov()",
        "0x",
        0
      ),

      tl.executeTransaction(
        RAMENReserves.address,
        0,
        "_acceptGov()",
        "0x",
        0
      ),

      tl.executeTransaction(
        RAMENRebaser.address,
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
