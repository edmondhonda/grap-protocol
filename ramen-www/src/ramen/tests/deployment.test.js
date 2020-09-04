import {
  Yam
} from "../index.js";
import * as Types from "../lib/types.js";
import {
  addressMap
} from "../lib/constants.js";
import {
  decimalToString,
  stringToDecimal
} from "../lib/Helpers.js"


export const ramen = new Yam(
  "http://localhost:8545/",
  // "http://127.0.0.1:9545/",
  "1001",
  true, {
    defaultAccount: "",
    defaultConfirmations: 1,
    autoGasMultiplier: 1.5,
    testing: false,
    defaultGas: "6000000",
    defaultGasPrice: "1000000000000",
    accounts: [],
    ethereumNodeTimeout: 10000
  }
)
const oneEther = 10 ** 18;

describe("post-deployment", () => {
  let snapshotId;
  let user;

  beforeAll(async () => {
    const accounts = await ramen.web3.eth.getAccounts();
    ramen.addAccount(accounts[0]);
    user = accounts[0];
    snapshotId = await ramen.testing.snapshot();
  });

  beforeEach(async () => {
    await ramen.testing.resetEVM("0x2");
  });

  describe("supply ownership", () => {

    test("owner balance", async () => {
      let balance = await ramen.contracts.ramen.methods.balanceOf(user).call();
      expect(balance).toBe(ramen.toBigN(275000).times(ramen.toBigN(10**18)).toString())
    });

    test("pool balances", async () => {
      let ycrv_balance = await ramen.contracts.ramen.methods.balanceOf(ramen.contracts.ycrv_pool.options.address).call();

      expect(ycrv_balance).toBe(ramen.toBigN(150000).times(ramen.toBigN(10**18)).times(ramen.toBigN(1)).toString())

      let yfi_balance = await ramen.contracts.ramen.methods.balanceOf(ramen.contracts.yfi_pool.options.address).call();

      expect(yfi_balance).toBe(ramen.toBigN(15000).times(ramen.toBigN(10**18)).times(ramen.toBigN(1)).toString())

      let ampl_balance = await ramen.contracts.ramen.methods.balanceOf(ramen.contracts.ampl_pool.options.address).call();

      expect(ampl_balance).toBe(ramen.toBigN(15000).times(ramen.toBigN(10**18)).times(ramen.toBigN(1)).toString())

      let eth_balance = await ramen.contracts.ramen.methods.balanceOf(ramen.contracts.eth_pool.options.address).call();

      expect(eth_balance).toBe(ramen.toBigN(15000).times(ramen.toBigN(10**18)).times(ramen.toBigN(1)).toString())

      let snx_balance = await ramen.contracts.ramen.methods.balanceOf(ramen.contracts.snx_pool.options.address).call();

      expect(snx_balance).toBe(ramen.toBigN(15000).times(ramen.toBigN(10**18)).times(ramen.toBigN(1)).toString())

      let comp_balance = await ramen.contracts.ramen.methods.balanceOf(ramen.contracts.comp_pool.options.address).call();

      expect(comp_balance).toBe(ramen.toBigN(15000).times(ramen.toBigN(10**18)).times(ramen.toBigN(1)).toString())

      let lend_balance = await ramen.contracts.ramen.methods.balanceOf(ramen.contracts.lend_pool.options.address).call();

      expect(lend_balance).toBe(ramen.toBigN(15000).times(ramen.toBigN(10**18)).times(ramen.toBigN(1)).toString())

      let link_balance = await ramen.contracts.ramen.methods.balanceOf(ramen.contracts.link_pool.options.address).call();

      expect(link_balance).toBe(ramen.toBigN(15000).times(ramen.toBigN(10**18)).times(ramen.toBigN(1)).toString())

      let mkr_balance = await ramen.contracts.ramen.methods.balanceOf(ramen.contracts.mkr_pool.options.address).call();

      expect(mkr_balance).toBe(ramen.toBigN(15000).times(ramen.toBigN(10**18)).times(ramen.toBigN(1)).toString())

    });

    test("total supply", async () => {
      let ts = await ramen.contracts.ramen.methods.totalSupply().call();
      expect(ts).toBe("275000000000000000000000")
    });

    test("init supply", async () => {
      let init_s = await ramen.contracts.ramen.methods.initSupply().call();
      expect(init_s).toBe("175000000000000000000000")
    });
  });

  describe("contract ownership", () => {

    test("ramen gov", async () => {
      let gov = await ramen.contracts.ramen.methods.gov().call();
      expect(gov).toBe(ramen.contracts.timelock.options.address)
    });

    test("rebaser gov", async () => {
      let gov = await ramen.contracts.rebaser.methods.gov().call();
      expect(gov).toBe(ramen.contracts.timelock.options.address)
    });

    test("reserves gov", async () => {
      let gov = await ramen.contracts.reserves.methods.gov().call();
      expect(gov).toBe(ramen.contracts.timelock.options.address)
    });

    test("timelock admin", async () => {
      let gov = await ramen.contracts.timelock.methods.admin().call();
      expect(gov).toBe(ramen.contracts.gov.options.address)
    });

    test("gov timelock", async () => {
      let tl = await ramen.contracts.gov.methods.timelock().call();
      expect(tl).toBe(ramen.contracts.timelock.options.address)
    });

    test("gov guardian", async () => {
      let grd = await ramen.contracts.gov.methods.guardian().call();
      expect(grd).toBe("0x0000000000000000000000000000000000000000")
    });

    test("pool owner", async () => {
      let owner = await ramen.contracts.eth_pool.methods.owner().call();
      expect(owner).toBe(ramen.contracts.timelock.options.address)
    });

    test("incentives owner", async () => {
      let owner = await ramen.contracts.ycrv_pool.methods.owner().call();
      expect(owner).toBe(ramen.contracts.timelock.options.address)
    });

    test("pool rewarder", async () => {
      let rewarder = await ramen.contracts.eth_pool.methods.rewardDistribution().call();
      expect(rewarder).toBe(ramen.contracts.timelock.options.address)
    });
  });

  describe("timelock delay initiated", () => {
    test("timelock delay initiated", async () => {
      let inited = await ramen.contracts.timelock.methods.admin_initialized().call();
      expect(inited).toBe(true);
    })
  })
})
