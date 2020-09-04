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
const RAMEN_SUSHIPool = artifacts.require("RAMENSUSHIPool");
const RAMEN_YFIPool = artifacts.require("RAMENYFIPool");
const RAMEN_LINKPool = artifacts.require("RAMENLINKPool");
const RAMEN_MKRPool = artifacts.require("RAMENMKRPool");
const RAMEN_LENDPool = artifacts.require("RAMENLENDPool");
const RAMEN_COMPPool = artifacts.require("RAMENCOMPPool");
const RAMEN_SNXPool = artifacts.require("RAMENSNXPool");
const RAMEN_BASEDPool = artifacts.require("RAMENBASEDPool");
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
    await deployer.deploy(RAMEN_SUSHIPool);
    await deployer.deploy(RAMEN_YFIPool);
    await deployer.deploy(RAMENIncentivizer);
    await deployer.deploy(RAMEN_LINKPool);
    await deployer.deploy(RAMEN_MKRPool);
    await deployer.deploy(RAMEN_LENDPool);
    await deployer.deploy(RAMEN_COMPPool);
    await deployer.deploy(RAMEN_SNXPool);
    await deployer.deploy(RAMEN_BASEDPool);
    await deployer.deploy(RAMEN_CRVPool);

    let eth_pool = new web3.eth.Contract(RAMEN_ETHPool.abi, RAMEN_ETHPool.address);
    let sushi_pool = new web3.eth.Contract(RAMEN_SUSHIPool.abi, RAMEN_SUSHIPool.address);
    let yfi_pool = new web3.eth.Contract(RAMEN_YFIPool.abi, RAMEN_YFIPool.address);
    let lend_pool = new web3.eth.Contract(RAMEN_LENDPool.abi, RAMEN_LENDPool.address);
    let mkr_pool = new web3.eth.Contract(RAMEN_MKRPool.abi, RAMEN_MKRPool.address);
    let snx_pool = new web3.eth.Contract(RAMEN_SNXPool.abi, RAMEN_SNXPool.address);
    let comp_pool = new web3.eth.Contract(RAMEN_COMPPool.abi, RAMEN_COMPPool.address);
    let link_pool = new web3.eth.Contract(RAMEN_LINKPool.abi, RAMEN_LINKPool.address);
    let based_pool = new web3.eth.Contract(RAMEN_BASEDPool.abi, RAMEN_BASEDPool.address);
    let crv_pool = new web3.eth.Contract(RAMEN_CRVPool.abi, RAMEN_CRVPool.address);
    let ycrv_pool = new web3.eth.Contract(RAMENIncentivizer.abi, RAMENIncentivizer.address);

    console.log("setting distributor");
    await Promise.all([
        eth_pool.methods.setRewardDistribution("0xfCA6533AD3c10b8d51FCEe40C3c68A0c1Cf91a36").send({from: "0xfCA6533AD3c10b8d51FCEe40C3c68A0c1Cf91a36", gas: 100000}),
        sushi_pool.methods.setRewardDistribution("0xfCA6533AD3c10b8d51FCEe40C3c68A0c1Cf91a36").send({from: "0xfCA6533AD3c10b8d51FCEe40C3c68A0c1Cf91a36", gas: 100000}),
        yfi_pool.methods.setRewardDistribution("0xfCA6533AD3c10b8d51FCEe40C3c68A0c1Cf91a36").send({from: "0xfCA6533AD3c10b8d51FCEe40C3c68A0c1Cf91a36", gas: 100000}),
        lend_pool.methods.setRewardDistribution("0xfCA6533AD3c10b8d51FCEe40C3c68A0c1Cf91a36").send({from: "0xfCA6533AD3c10b8d51FCEe40C3c68A0c1Cf91a36", gas: 100000}),
        mkr_pool.methods.setRewardDistribution("0xfCA6533AD3c10b8d51FCEe40C3c68A0c1Cf91a36").send({from: "0xfCA6533AD3c10b8d51FCEe40C3c68A0c1Cf91a36", gas: 100000}),
        snx_pool.methods.setRewardDistribution("0xfCA6533AD3c10b8d51FCEe40C3c68A0c1Cf91a36").send({from: "0xfCA6533AD3c10b8d51FCEe40C3c68A0c1Cf91a36", gas: 100000}),
        comp_pool.methods.setRewardDistribution("0xfCA6533AD3c10b8d51FCEe40C3c68A0c1Cf91a36").send({from: "0xfCA6533AD3c10b8d51FCEe40C3c68A0c1Cf91a36", gas: 100000}),
        link_pool.methods.setRewardDistribution("0xfCA6533AD3c10b8d51FCEe40C3c68A0c1Cf91a36").send({from: "0xfCA6533AD3c10b8d51FCEe40C3c68A0c1Cf91a36", gas: 100000}),
        based_pool.methods.setRewardDistribution("0xfCA6533AD3c10b8d51FCEe40C3c68A0c1Cf91a36").send({from: "0xfCA6533AD3c10b8d51FCEe40C3c68A0c1Cf91a36", gas: 100000}),
        crv_pool.methods.setRewardDistribution("0xfCA6533AD3c10b8d51FCEe40C3c68A0c1Cf91a36").send({from: "0xfCA6533AD3c10b8d51FCEe40C3c68A0c1Cf91a36", gas: 100000}),
        ycrv_pool.methods.setRewardDistribution("0xfCA6533AD3c10b8d51FCEe40C3c68A0c1Cf91a36").send({from: "0xfCA6533AD3c10b8d51FCEe40C3c68A0c1Cf91a36", gas: 100000}),
      ]);

    let twenty = web3.utils.toBN(10**3).mul(web3.utils.toBN(10**18)).mul(web3.utils.toBN(15));
    let one_five = web3.utils.toBN(10**3).mul(web3.utils.toBN(10**18)).mul(web3.utils.toBN(100));

    console.log("transfering and notifying");
    console.log("eth");
    await Promise.all([
      ramen.transfer(RAMEN_ETHPool.address, twenty.toString()),
      ramen.transfer(RAMEN_SUSHIPool.address, twenty.toString()),
      ramen.transfer(RAMEN_YFIPool.address, twenty.toString()),
      ramen.transfer(RAMEN_LENDPool.address, twenty.toString()),
      ramen.transfer(RAMEN_MKRPool.address, twenty.toString()),
      ramen.transfer(RAMEN_SNXPool.address, twenty.toString()),
      ramen.transfer(RAMEN_COMPPool.address, twenty.toString()),
      ramen.transfer(RAMEN_LINKPool.address, twenty.toString()),
      ramen.transfer(RAMEN_BASEDPool.address, twenty.toString()),
      ramen.transfer(RAMEN_CRVPool.address, twenty.toString()),
      ramen._setIncentivizer(RAMENIncentivizer.address),
    ]);

    await Promise.all([
      eth_pool.methods.notifyRewardAmount(twenty.toString()).send({from:"0xfCA6533AD3c10b8d51FCEe40C3c68A0c1Cf91a36"}),
      sushi_pool.methods.notifyRewardAmount(twenty.toString()).send({from:"0xfCA6533AD3c10b8d51FCEe40C3c68A0c1Cf91a36"}),
      yfi_pool.methods.notifyRewardAmount(twenty.toString()).send({from:"0xfCA6533AD3c10b8d51FCEe40C3c68A0c1Cf91a36"}),
      lend_pool.methods.notifyRewardAmount(twenty.toString()).send({from:"0xfCA6533AD3c10b8d51FCEe40C3c68A0c1Cf91a36"}),
      mkr_pool.methods.notifyRewardAmount(twenty.toString()).send({from:"0xfCA6533AD3c10b8d51FCEe40C3c68A0c1Cf91a36"}),
      snx_pool.methods.notifyRewardAmount(twenty.toString()).send({from:"0xfCA6533AD3c10b8d51FCEe40C3c68A0c1Cf91a36"}),
      comp_pool.methods.notifyRewardAmount(twenty.toString()).send({from:"0xfCA6533AD3c10b8d51FCEe40C3c68A0c1Cf91a36"}),
      link_pool.methods.notifyRewardAmount(twenty.toString()).send({from:"0xfCA6533AD3c10b8d51FCEe40C3c68A0c1Cf91a36"}),
      based_pool.methods.notifyRewardAmount(twenty.toString()).send({from:"0xfCA6533AD3c10b8d51FCEe40C3c68A0c1Cf91a36"}),
      crv_pool.methods.notifyRewardAmount(twenty.toString()).send({from:"0xfCA6533AD3c10b8d51FCEe40C3c68A0c1Cf91a36"}),

      // incentives is a minter and prepopulates itself.
      ycrv_pool.methods.notifyRewardAmount("0").send({from: "0xfCA6533AD3c10b8d51FCEe40C3c68A0c1Cf91a36", gas: 500000}),
    ]);

    await Promise.all([
      eth_pool.methods.setRewardDistribution(Timelock.address).send({from: "0xfCA6533AD3c10b8d51FCEe40C3c68A0c1Cf91a36", gas: 100000}),
      sushi_pool.methods.setRewardDistribution(Timelock.address).send({from: "0xfCA6533AD3c10b8d51FCEe40C3c68A0c1Cf91a36", gas: 100000}),
      yfi_pool.methods.setRewardDistribution(Timelock.address).send({from: "0xfCA6533AD3c10b8d51FCEe40C3c68A0c1Cf91a36", gas: 100000}),
      lend_pool.methods.setRewardDistribution(Timelock.address).send({from: "0xfCA6533AD3c10b8d51FCEe40C3c68A0c1Cf91a36", gas: 100000}),
      mkr_pool.methods.setRewardDistribution(Timelock.address).send({from: "0xfCA6533AD3c10b8d51FCEe40C3c68A0c1Cf91a36", gas: 100000}),
      snx_pool.methods.setRewardDistribution(Timelock.address).send({from: "0xfCA6533AD3c10b8d51FCEe40C3c68A0c1Cf91a36", gas: 100000}),
      comp_pool.methods.setRewardDistribution(Timelock.address).send({from: "0xfCA6533AD3c10b8d51FCEe40C3c68A0c1Cf91a36", gas: 100000}),
      link_pool.methods.setRewardDistribution(Timelock.address).send({from: "0xfCA6533AD3c10b8d51FCEe40C3c68A0c1Cf91a36", gas: 100000}),
      based_pool.methods.setRewardDistribution(Timelock.address).send({from: "0xfCA6533AD3c10b8d51FCEe40C3c68A0c1Cf91a36", gas: 100000}),
      crv_pool.methods.setRewardDistribution(Timelock.address).send({from: "0xfCA6533AD3c10b8d51FCEe40C3c68A0c1Cf91a36", gas: 100000}),
      ycrv_pool.methods.setRewardDistribution(Timelock.address).send({from: "0xfCA6533AD3c10b8d51FCEe40C3c68A0c1Cf91a36", gas: 100000}),
    ]);
    await Promise.all([
      eth_pool.methods.transferOwnership(Timelock.address).send({from: "0xfCA6533AD3c10b8d51FCEe40C3c68A0c1Cf91a36", gas: 100000}),
      sushi_pool.methods.transferOwnership(Timelock.address).send({from: "0xfCA6533AD3c10b8d51FCEe40C3c68A0c1Cf91a36", gas: 100000}),
      yfi_pool.methods.transferOwnership(Timelock.address).send({from: "0xfCA6533AD3c10b8d51FCEe40C3c68A0c1Cf91a36", gas: 100000}),
      lend_pool.methods.transferOwnership(Timelock.address).send({from: "0xfCA6533AD3c10b8d51FCEe40C3c68A0c1Cf91a36", gas: 100000}),
      mkr_pool.methods.transferOwnership(Timelock.address).send({from: "0xfCA6533AD3c10b8d51FCEe40C3c68A0c1Cf91a36", gas: 100000}),
      snx_pool.methods.transferOwnership(Timelock.address).send({from: "0xfCA6533AD3c10b8d51FCEe40C3c68A0c1Cf91a36", gas: 100000}),
      comp_pool.methods.transferOwnership(Timelock.address).send({from: "0xfCA6533AD3c10b8d51FCEe40C3c68A0c1Cf91a36", gas: 100000}),
      link_pool.methods.transferOwnership(Timelock.address).send({from: "0xfCA6533AD3c10b8d51FCEe40C3c68A0c1Cf91a36", gas: 100000}),
      based_pool.methods.transferOwnership(Timelock.address).send({from: "0xfCA6533AD3c10b8d51FCEe40C3c68A0c1Cf91a36", gas: 100000}),
      crv_pool.methods.transferOwnership(Timelock.address).send({from: "0xfCA6533AD3c10b8d51FCEe40C3c68A0c1Cf91a36", gas: 100000}),
      ycrv_pool.methods.transferOwnership(Timelock.address).send({from: "0xfCA6533AD3c10b8d51FCEe40C3c68A0c1Cf91a36", gas: 100000}),
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
