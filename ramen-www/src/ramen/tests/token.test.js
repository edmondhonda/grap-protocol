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


export const glue = new Yam(
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

describe("token_tests", () => {
  let snapshotId;
  let user;
  let new_user;
  beforeAll(async () => {
    const accounts = await glue.web3.eth.getAccounts();
    glue.addAccount(accounts[0]);
    user = accounts[0];
    new_user = accounts[1];
    snapshotId = await glue.testing.snapshot();
  });

  beforeEach(async () => {
    await glue.testing.resetEVM("0x2");
  });

  describe("expected fail transfers", () => {
    test("cant transfer from a 0 balance", async () => {
      await glue.testing.expectThrow(glue.contracts.glue.methods.transfer(user, "100").send({from: new_user}), "SafeMath: subtraction overflow");
    });
    test("cant transferFrom without allowance", async () => {
      await glue.testing.expectThrow(glue.contracts.glue.methods.transferFrom(user, new_user, "100").send({from: new_user}), "SafeMath: subtraction overflow");
    });

  });

  describe("non-failing transfers", () => {
    test("transfer to self doesnt inflate", async () => {
      let bal0 = await glue.contracts.glue.methods.balanceOf(user).call();
      await glue.contracts.glue.methods.transfer(user, "100").send({from: user});
      let bal1 = await glue.contracts.glue.methods.balanceOf(user).call();
      expect(bal0).toBe(bal1);
    });
    test("transferFrom works", async () => {
      let bal00 = await glue.contracts.glue.methods.balanceOf(user).call();
      let bal01 = await glue.contracts.glue.methods.balanceOf(new_user).call();
      await glue.contracts.glue.methods.approve(new_user, "100").send({from: user});
      await glue.contracts.glue.methods.transferFrom(user, new_user, "100").send({from: new_user});
      let bal10 = await glue.contracts.glue.methods.balanceOf(user).call();
      let bal11 = await glue.contracts.glue.methods.balanceOf(new_user).call();
      expect((glue.toBigN(bal01).plus(glue.toBigN(100))).toString()).toBe(bal11);
      expect((glue.toBigN(bal00).minus(glue.toBigN(100))).toString()).toBe(bal10);
    });
    test("approve", async () => {
      await glue.contracts.glue.methods.approve(new_user, "100").send({from: user});
      let allowance = await glue.contracts.glue.methods.allowance(user, new_user).call();
      expect(allowance).toBe("100")
    });
    test("increaseAllowance", async () => {
      await glue.contracts.glue.methods.increaseAllowance(new_user, "100").send({from: user});
      let allowance = await glue.contracts.glue.methods.allowance(user, new_user).call();
      expect(allowance).toBe("100")
    });
    test("decreaseAllowance", async () => {
      await glue.contracts.glue.methods.increaseAllowance(new_user, "100").send({from: user});
      let allowance = await glue.contracts.glue.methods.allowance(user, new_user).call();
      expect(allowance).toBe("100")
      await glue.contracts.glue.methods.decreaseAllowance(new_user, "100").send({from: user});
      allowance = await glue.contracts.glue.methods.allowance(user, new_user).call();
      expect(allowance).toBe("0")
    });
    test("decreaseAllowance from 0", async () => {
      await glue.contracts.glue.methods.decreaseAllowance(new_user, "100").send({from: user});
      let allowance = await glue.contracts.glue.methods.allowance(user, new_user).call();
      expect(allowance).toBe("0")
    });
  })

})
