// ============ Contracts ============

// Token
// deployed first
const RAMENImplementation = artifacts.require("RAMENDelegate");
const RAMENProxy = artifacts.require("RAMENDelegator");

// ============ Main Migration ============

const migration = async (deployer, network, accounts) => {
  await Promise.all([
    deployToken(deployer, network),
  ]);
};

module.exports = migration;

// ============ Deploy Functions ============


async function deployToken(deployer, network) {
  await deployer.deploy(RAMENImplementation);
  await deployer.deploy(RAMENProxy,
    "Sumo Protocol",
    "Ramen",
    18,
    "175000000000000000000000",
    RAMENImplementation.address,
    "0x"
  );
}
