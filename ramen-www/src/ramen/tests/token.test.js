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

describe("token_tests", () => {
  let snapshotId;
  let user;
  let new_user;
  beforeAll(async () => {
    const accounts = await ramen.web3.eth.getAccounts();
    ramen.addAccount(accounts[0]);
    user = accounts[0];
    new_user = accounts[1];
    snapshotId = await ramen.testing.snapshot();
  });

  beforeEach(async () => {
    await ramen.testing.resetEVM("0x2");
  });

  describe("expected fail transfers", () => {
    test("cant transfer from a 0 balance", async () => {
      await ramen.testing.expectThrow(ramen.contracts.ramen.methods.transfer(user, "100").send({from: new_user}), "SafeMath: subtraction overflow");
    });
    test("cant transferFrom without allowance", async () => {
      await ramen.testing.expectThrow(ramen.contracts.ramen.methods.transferFrom(user, new_user, "100").send({from: new_user}), "SafeMath: subtraction overflow");
    });

  });

  describe("non-failing transfers", () => {
    test("transfer to self doesnt inflate", async () => {
      let bal0 = await ramen.contracts.ramen.methods.balanceOf(user).call();
      await ramen.contracts.ramen.methods.transfer(user, "100").send({from: user});
      let bal1 = await ramen.contracts.ramen.methods.balanceOf(user).call();
      expect(bal0).toBe(bal1);
    });
    test("transferFrom works", async () => {
      let bal00 = await ramen.contracts.ramen.methods.balanceOf(user).call();
      let bal01 = await ramen.contracts.ramen.methods.balanceOf(new_user).call();
      await ramen.contracts.ramen.methods.approve(new_user, "100").send({from: user});
      await ramen.contracts.ramen.methods.transferFrom(user, new_user, "100").send({from: new_user});
      let bal10 = await ramen.contracts.ramen.methods.balanceOf(user).call();
      let bal11 = await ramen.contracts.ramen.methods.balanceOf(new_user).call();
      expect((ramen.toBigN(bal01).plus(ramen.toBigN(100))).toString()).toBe(bal11);
      expect((ramen.toBigN(bal00).minus(ramen.toBigN(100))).toString()).toBe(bal10);
    });
    test("approve", async () => {
      await ramen.contracts.ramen.methods.approve(new_user, "100").send({from: user});
      let allowance = await ramen.contracts.ramen.methods.allowance(user, new_user).call();
      expect(allowance).toBe("100")
    });
    test("increaseAllowance", async () => {
      await ramen.contracts.ramen.methods.increaseAllowance(new_user, "100").send({from: user});
      let allowance = await ramen.contracts.ramen.methods.allowance(user, new_user).call();
      expect(allowance).toBe("100")
    });
    test("decreaseAllowance", async () => {
      await ramen.contracts.ramen.methods.increaseAllowance(new_user, "100").send({from: user});
      let allowance = await ramen.contracts.ramen.methods.allowance(user, new_user).call();
      expect(allowance).toBe("100")
      await ramen.contracts.ramen.methods.decreaseAllowance(new_user, "100").send({from: user});
      allowance = await ramen.contracts.ramen.methods.allowance(user, new_user).call();
      expect(allowance).toBe("0")
    });
    test("decreaseAllowance from 0", async () => {
      await ramen.contracts.ramen.methods.decreaseAllowance(new_user, "100").send({from: user});
      let allowance = await ramen.contracts.ramen.methods.allowance(user, new_user).call();
      expect(allowance).toBe("0")
    });
  })

})
