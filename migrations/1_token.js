// ============ Contracts ============

// Token
// deployed first
const GLUEImplementation = artifacts.require("GLUEDelegate");
const GLUEProxy = artifacts.require("GLUEDelegator");

// ============ Main Migration ============

const migration = async (deployer, network, accounts) => {
  await Promise.all([
    deployToken(deployer, network),
  ]);
};

module.exports = migration;

// ============ Deploy Functions ============


async function deployToken(deployer, network) {
  await deployer.deploy(GLUEImplementation);
  await deployer.deploy(GLUEProxy,
    "Sumo Protocol",
    "RAMEN",
    18,
    "230000000000000000000000",
    GLUEImplementation.address,
    "0x"
  );
}
