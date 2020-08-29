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

describe("rebase_tests", () => {
  let snapshotId;
  let user;
  let new_user;
  // let unlocked_account = "0x0eb4add4ba497357546da7f5d12d39587ca24606";
  let unlocked_account = "0x681148725731f213b0187a3cbef215c291d85a3e";

  beforeAll(async () => {
    const accounts = await glue.web3.eth.getAccounts();
    glue.addAccount(accounts[0]);
    user = accounts[0];
    new_user = accounts[1];
    snapshotId = await glue.testing.snapshot();
  });

  beforeEach(async () => {
    await glue.testing.resetEVM("0x2");
    let a = await glue.contracts.ycrv.methods.transfer(user, "2000000000000000000000000").send({
      from: unlocked_account
    });
  });

  describe("rebase", () => {
    test("user has ycrv", async () => {
      let bal0 = await glue.contracts.ycrv.methods.balanceOf(user).call();
      expect(bal0).toBe("2000000000000000000000000");
    });
    test("create pair", async () => {
      await glue.contracts.uni_fact.methods.createPair(
        glue.contracts.ycrv.options.address,
        glue.contracts.glue.options.address
      ).send({
        from: user,
        gas: 8000000
      })
    });
    test("mint pair", async () => {
      await glue.contracts.glue.methods.approve(
        glue.contracts.uni_router.options.address,
        -1
      ).send({
        from: user,
        gas: 80000
      });
      await glue.contracts.ycrv.methods.approve(
        glue.contracts.uni_router.options.address,
        -1
      ).send({
        from: user,
        gas: 80000
      });

      await glue.contracts.uni_router.methods.addLiquidity(
        glue.contracts.glue.options.address,
        glue.contracts.ycrv.options.address,
        10000000,
        10000000,
        10000000,
        10000000,
        user,
        1596740361 + 100000000
      ).send({
        from: user,
        gas: 8000000
      });
      let pair = await glue.contracts.uni_fact.methods.getPair(
        glue.contracts.glue.options.address,
        glue.contracts.ycrv.options.address
      ).call();
      glue.contracts.uni_pair.options.address = pair;
      let bal = await glue.contracts.uni_pair.methods.balanceOf(user).call();
      expect(glue.toBigN(bal).toNumber()).toBeGreaterThan(100)
    });
    test("init_twap", async () => {
      await glue.contracts.glue.methods.approve(
        glue.contracts.uni_router.options.address,
        -1
      ).send({
        from: user,
        gas: 80000
      });
      await glue.contracts.ycrv.methods.approve(
        glue.contracts.uni_router.options.address,
        -1
      ).send({
        from: user,
        gas: 80000
      });

      await glue.contracts.uni_router.methods.addLiquidity(
        glue.contracts.glue.options.address,
        glue.contracts.ycrv.options.address,
        100000,
        100000,
        100000,
        100000,
        user,
        1596740361 + 10000000
      ).send({
        from: user,
        gas: 8000000
      });
      let pair = await glue.contracts.uni_fact.methods.getPair(
        glue.contracts.glue.options.address,
        glue.contracts.ycrv.options.address
      ).call();
      glue.contracts.uni_pair.options.address = pair;
      let bal = await glue.contracts.uni_pair.methods.balanceOf(user).call();

      // make a trade to get init values in uniswap
      await glue.contracts.uni_router.methods.swapExactTokensForTokens(
        1000,
        100,
        [
          glue.contracts.glue.options.address,
          glue.contracts.ycrv.options.address
        ],
        user,
        1596740361 + 10000000
      ).send({
        from: user,
        gas: 1000000
      });

      await glue.testing.increaseTime(1000);

      await glue.contracts.rebaser.methods.init_twap().send({
        from: user,
        gas: 500000
      });



      let init_twap = await glue.contracts.rebaser.methods.timeOfTWAPInit().call();
      let priceCumulativeLast = await glue.contracts.rebaser.methods.priceCumulativeLast().call();
      expect(glue.toBigN(init_twap).toNumber()).toBeGreaterThan(0);
      expect(glue.toBigN(priceCumulativeLast).toNumber()).toBeGreaterThan(0);
    });
    test("activate rebasing", async () => {
      await glue.contracts.glue.methods.approve(
        glue.contracts.uni_router.options.address,
        -1
      ).send({
        from: user,
        gas: 80000
      });
      await glue.contracts.ycrv.methods.approve(
        glue.contracts.uni_router.options.address,
        -1
      ).send({
        from: user,
        gas: 80000
      });

      await glue.contracts.uni_router.methods.addLiquidity(
        glue.contracts.glue.options.address,
        glue.contracts.ycrv.options.address,
        100000,
        100000,
        100000,
        100000,
        user,
        1596740361 + 10000000
      ).send({
        from: user,
        gas: 8000000
      });
      let pair = await glue.contracts.uni_fact.methods.getPair(
        glue.contracts.glue.options.address,
        glue.contracts.ycrv.options.address
      ).call();
      glue.contracts.uni_pair.options.address = pair;
      let bal = await glue.contracts.uni_pair.methods.balanceOf(user).call();

      // make a trade to get init values in uniswap
      await glue.contracts.uni_router.methods.swapExactTokensForTokens(
        1000,
        100,
        [
          glue.contracts.glue.options.address,
          glue.contracts.ycrv.options.address
        ],
        user,
        1596740361 + 10000000
      ).send({
        from: user,
        gas: 1000000
      });

      await glue.testing.increaseTime(1000);

      await glue.contracts.rebaser.methods.init_twap().send({
        from: user,
        gas: 500000
      });



      let init_twap = await glue.contracts.rebaser.methods.timeOfTWAPInit().call();
      let priceCumulativeLast = await glue.contracts.rebaser.methods.priceCumulativeLast().call();
      expect(glue.toBigN(init_twap).toNumber()).toBeGreaterThan(0);
      expect(glue.toBigN(priceCumulativeLast).toNumber()).toBeGreaterThan(0);

      await glue.testing.increaseTime(12 * 60 * 60);

      await glue.contracts.rebaser.methods.activate_rebasing().send({
        from: user,
        gas: 500000
      });
    });
    test("positive rebasing", async () => {
      await glue.contracts.glue.methods.approve(
        glue.contracts.uni_router.options.address,
        -1
      ).send({
        from: user,
        gas: 80000
      });
      await glue.contracts.ycrv.methods.approve(
        glue.contracts.uni_router.options.address,
        -1
      ).send({
        from: user,
        gas: 80000
      });

      await glue.contracts.uni_router.methods.addLiquidity(
        glue.contracts.glue.options.address,
        glue.contracts.ycrv.options.address,
        "1000000000000000000000000",
        "1000000000000000000000000",
        "1000000000000000000000000",
        "1000000000000000000000000",
        user,
        1596740361 + 10000000
      ).send({
        from: user,
        gas: 8000000
      });

      let pair = await glue.contracts.uni_fact.methods.getPair(
        glue.contracts.glue.options.address,
        glue.contracts.ycrv.options.address
      ).call();

      glue.contracts.uni_pair.options.address = pair;
      let bal = await glue.contracts.uni_pair.methods.balanceOf(user).call();

      // make a trade to get init values in uniswap
      await glue.contracts.uni_router.methods.swapExactTokensForTokens(
        "100000000000",
        100000,
        [
          glue.contracts.ycrv.options.address,
          glue.contracts.glue.options.address
        ],
        user,
        1596740361 + 10000000
      ).send({
        from: user,
        gas: 1000000
      });

      // trade back for easier calcs later
      await glue.contracts.uni_router.methods.swapExactTokensForTokens(
        "100000000000",
        100000,
        [
          glue.contracts.glue.options.address,
          glue.contracts.ycrv.options.address
        ],
        user,
        1596740361 + 10000000
      ).send({
        from: user,
        gas: 1000000
      });

      await glue.testing.increaseTime(43200);

      await glue.contracts.rebaser.methods.init_twap().send({
        from: user,
        gas: 500000
      });


      await glue.contracts.uni_router.methods.swapExactTokensForTokens(
        "100000000000000000000000",
        100000,
        [
          glue.contracts.ycrv.options.address,
          glue.contracts.glue.options.address
        ],
        user,
        1596740361 + 10000000
      ).send({
        from: user,
        gas: 1000000
      });

      // init twap
      let init_twap = await glue.contracts.rebaser.methods.timeOfTWAPInit().call();

      // wait 12 hours
      await glue.testing.increaseTime(12 * 60 * 60);

      // perform trade to change price
      await glue.contracts.uni_router.methods.swapExactTokensForTokens(
        "10000000000000000000",
        100000,
        [
          glue.contracts.ycrv.options.address,
          glue.contracts.glue.options.address
        ],
        user,
        1596740361 + 10000000
      ).send({
        from: user,
        gas: 1000000
      });

      // activate rebasing
      await glue.contracts.rebaser.methods.activate_rebasing().send({
        from: user,
        gas: 500000
      });


      let res_bal = await glue.contracts.glue.methods.balanceOf(
          glue.contracts.reserves.options.address
      ).call();

      expect(res_bal).toBe("0");

      bal = await glue.contracts.glue.methods.balanceOf(user).call();

      let a = await glue.web3.eth.getBlock('latest');

      let offset = await glue.contracts.rebaser.methods.rebaseWindowOffsetSec().call();
      offset = glue.toBigN(offset).toNumber();
      let interval = await glue.contracts.rebaser.methods.minRebaseTimeIntervalSec().call();
      interval = glue.toBigN(interval).toNumber();

      let i;
      if (a["timestamp"] % interval > offset) {
        i = (interval - (a["timestamp"] % interval)) + offset;
      } else {
        i = offset - (a["timestamp"] % interval);
      }

      await glue.testing.increaseTime(i);

      let r = await glue.contracts.uni_pair.methods.getReserves().call();
      let q = await glue.contracts.uni_router.methods.quote(glue.toBigN(10**18).toString(), r[0], r[1]).call();
      console.log("quote pre positive rebase", q);

      let b = await glue.contracts.rebaser.methods.rebase().send({
        from: user,
        gas: 2500000
      });

      //console.log(b.events)
      console.log("positive rebase gas used:", b["gasUsed"]);

      let bal1 = await glue.contracts.glue.methods.balanceOf(user).call();

      let resGLUE = await glue.contracts.glue.methods.balanceOf(glue.contracts.reserves.options.address).call();

      let resycrv = await glue.contracts.ycrv.methods.balanceOf(glue.contracts.reserves.options.address).call();

      console.log("bal user, bal glue res, bal res crv", bal1, resGLUE, resycrv);
      r = await glue.contracts.uni_pair.methods.getReserves().call();
      q = await glue.contracts.uni_router.methods.quote(glue.toBigN(10**18).toString(), r[0], r[1]).call();
      console.log("post positive rebase quote", q);

      // new balance > old balance
      expect(glue.toBigN(bal).toNumber()).toBeLessThan(glue.toBigN(bal1).toNumber());
      // used full glue reserves
      expect(glue.toBigN(resGLUE).toNumber()).toBe(0);
      // increases reserves
      expect(glue.toBigN(resycrv).toNumber()).toBeGreaterThan(0);


      // not below peg
      expect(glue.toBigN(q).toNumber()).toBeGreaterThan(glue.toBigN(10**18).toNumber());
    });
    test("negative rebasing", async () => {
      await glue.contracts.glue.methods.approve(
        glue.contracts.uni_router.options.address,
        -1
      ).send({
        from: user,
        gas: 80000
      });
      await glue.contracts.ycrv.methods.approve(
        glue.contracts.uni_router.options.address,
        -1
      ).send({
        from: user,
        gas: 80000
      });

      await glue.contracts.uni_router.methods.addLiquidity(
        glue.contracts.glue.options.address,
        glue.contracts.ycrv.options.address,
        "1000000000000000000000000",
        "1000000000000000000000000",
        "1000000000000000000000000",
        "1000000000000000000000000",
        user,
        1596740361 + 10000000
      ).send({
        from: user,
        gas: 8000000
      });

      let pair = await glue.contracts.uni_fact.methods.getPair(
        glue.contracts.glue.options.address,
        glue.contracts.ycrv.options.address
      ).call();

      glue.contracts.uni_pair.options.address = pair;
      let bal = await glue.contracts.uni_pair.methods.balanceOf(user).call();

      // make a trade to get init values in uniswap
      await glue.contracts.uni_router.methods.swapExactTokensForTokens(
        "100000000000",
        100000,
        [
          glue.contracts.ycrv.options.address,
          glue.contracts.glue.options.address
        ],
        user,
        1596740361 + 10000000
      ).send({
        from: user,
        gas: 1000000
      });

      // trade back for easier calcs later
      await glue.contracts.uni_router.methods.swapExactTokensForTokens(
        "100000000000",
        100000,
        [
          glue.contracts.glue.options.address,
          glue.contracts.ycrv.options.address
        ],
        user,
        1596740361 + 10000000
      ).send({
        from: user,
        gas: 1000000
      });

      await glue.testing.increaseTime(43200);

      await glue.contracts.rebaser.methods.init_twap().send({
        from: user,
        gas: 500000
      });


      await glue.contracts.uni_router.methods.swapExactTokensForTokens(
        "500000000000000000000000",
        100000,
        [
          glue.contracts.glue.options.address,
          glue.contracts.ycrv.options.address
        ],
        user,
        1596740361 + 10000000
      ).send({
        from: user,
        gas: 1000000
      });

      // init twap
      let init_twap = await glue.contracts.rebaser.methods.timeOfTWAPInit().call();

      // wait 12 hours
      await glue.testing.increaseTime(12 * 60 * 60);

      // perform trade to change price
      await glue.contracts.uni_router.methods.swapExactTokensForTokens(
        "10000000000000000000",
        100000,
        [
          glue.contracts.glue.options.address,
          glue.contracts.ycrv.options.address
        ],
        user,
        1596740361 + 10000000
      ).send({
        from: user,
        gas: 1000000
      });

      // activate rebasing
      await glue.contracts.rebaser.methods.activate_rebasing().send({
        from: user,
        gas: 500000
      });


      bal = await glue.contracts.glue.methods.balanceOf(user).call();

      let a = await glue.web3.eth.getBlock('latest');

      let offset = await glue.contracts.rebaser.methods.rebaseWindowOffsetSec().call();
      offset = glue.toBigN(offset).toNumber();
      let interval = await glue.contracts.rebaser.methods.minRebaseTimeIntervalSec().call();
      interval = glue.toBigN(interval).toNumber();

      let i;
      if (a["timestamp"] % interval > offset) {
        i = (interval - (a["timestamp"] % interval)) + offset;
      } else {
        i = offset - (a["timestamp"] % interval);
      }

      await glue.testing.increaseTime(i);

      let r = await glue.contracts.uni_pair.methods.getReserves().call();
      let q = await glue.contracts.uni_router.methods.quote(glue.toBigN(10**18).toString(), r[0], r[1]).call();
      console.log("quote pre negative rebase", q);

      let b = await glue.contracts.rebaser.methods.rebase().send({
        from: user,
        gas: 2500000
      });

      //console.log(b.events)
      console.log("negative rebase gas used:", b["gasUsed"]);

      let bal1 = await glue.contracts.glue.methods.balanceOf(user).call();

      let resGLUE = await glue.contracts.glue.methods.balanceOf(glue.contracts.reserves.options.address).call();

      let resycrv = await glue.contracts.ycrv.methods.balanceOf(glue.contracts.reserves.options.address).call();

      // balance decreases
      expect(glue.toBigN(bal1).toNumber()).toBeLessThan(glue.toBigN(bal).toNumber());
      // no increases to reserves
      expect(glue.toBigN(resGLUE).toNumber()).toBe(0);
      expect(glue.toBigN(resycrv).toNumber()).toBe(0);
    });
    test("no rebasing", async () => {
      await glue.contracts.glue.methods.approve(
        glue.contracts.uni_router.options.address,
        -1
      ).send({
        from: user,
        gas: 80000
      });
      await glue.contracts.ycrv.methods.approve(
        glue.contracts.uni_router.options.address,
        -1
      ).send({
        from: user,
        gas: 80000
      });

      await glue.contracts.uni_router.methods.addLiquidity(
        glue.contracts.glue.options.address,
        glue.contracts.ycrv.options.address,
        "1000000000000000000000000",
        "1000000000000000000000000",
        "1000000000000000000000000",
        "1000000000000000000000000",
        user,
        1596740361 + 10000000
      ).send({
        from: user,
        gas: 8000000
      });

      let pair = await glue.contracts.uni_fact.methods.getPair(
        glue.contracts.glue.options.address,
        glue.contracts.ycrv.options.address
      ).call();

      glue.contracts.uni_pair.options.address = pair;
      let bal = await glue.contracts.uni_pair.methods.balanceOf(user).call();

      // make a trade to get init values in uniswap
      await glue.contracts.uni_router.methods.swapExactTokensForTokens(
        "100000000000",
        100000,
        [
          glue.contracts.ycrv.options.address,
          glue.contracts.glue.options.address
        ],
        user,
        1596740361 + 10000000
      ).send({
        from: user,
        gas: 1000000
      });

      // trade back for easier calcs later
      await glue.contracts.uni_router.methods.swapExactTokensForTokens(
        "100000000000",
        100000,
        [
          glue.contracts.glue.options.address,
          glue.contracts.ycrv.options.address
        ],
        user,
        1596740361 + 10000000
      ).send({
        from: user,
        gas: 1000000
      });

      await glue.testing.increaseTime(43200);

      await glue.contracts.rebaser.methods.init_twap().send({
        from: user,
        gas: 500000
      });


      await glue.contracts.uni_router.methods.swapExactTokensForTokens(
        "10000000000000000000000",
        100000,
        [
          glue.contracts.glue.options.address,
          glue.contracts.ycrv.options.address
        ],
        user,
        1596740361 + 10000000
      ).send({
        from: user,
        gas: 1000000
      });

      await glue.contracts.uni_router.methods.swapExactTokensForTokens(
        "10000000000000000000000",
        100000,
        [
          glue.contracts.ycrv.options.address,
          glue.contracts.glue.options.address
        ],
        user,
        1596740361 + 10000000
      ).send({
        from: user,
        gas: 1000000
      });

      // init twap
      let init_twap = await glue.contracts.rebaser.methods.timeOfTWAPInit().call();

      // wait 12 hours
      await glue.testing.increaseTime(12 * 60 * 60);

      // perform trade to change price
      await glue.contracts.uni_router.methods.swapExactTokensForTokens(
        "10000000000000000000",
        100000,
        [
          glue.contracts.glue.options.address,
          glue.contracts.ycrv.options.address
        ],
        user,
        1596740361 + 10000000
      ).send({
        from: user,
        gas: 1000000
      });

      await glue.contracts.uni_router.methods.swapExactTokensForTokens(
        "10000000000000000000",
        100000,
        [
          glue.contracts.ycrv.options.address,
          glue.contracts.glue.options.address
        ],
        user,
        1596740361 + 10000000
      ).send({
        from: user,
        gas: 1000000
      });

      // activate rebasing
      await glue.contracts.rebaser.methods.activate_rebasing().send({
        from: user,
        gas: 500000
      });


      bal = await glue.contracts.glue.methods.balanceOf(user).call();

      let a = await glue.web3.eth.getBlock('latest');

      let offset = await glue.contracts.rebaser.methods.rebaseWindowOffsetSec().call();
      offset = glue.toBigN(offset).toNumber();
      let interval = await glue.contracts.rebaser.methods.minRebaseTimeIntervalSec().call();
      interval = glue.toBigN(interval).toNumber();

      let i;
      if (a["timestamp"] % interval > offset) {
        i = (interval - (a["timestamp"] % interval)) + offset;
      } else {
        i = offset - (a["timestamp"] % interval);
      }

      await glue.testing.increaseTime(i);

      let r = await glue.contracts.uni_pair.methods.getReserves().call();
      console.log(r, r[0], r[1]);
      let q = await glue.contracts.uni_router.methods.quote(glue.toBigN(10**18).toString(), r[0], r[1]).call();
      console.log("quote pre no rebase", q);
      let b = await glue.contracts.rebaser.methods.rebase().send({
        from: user,
        gas: 2500000
      });

      console.log("no rebase gas used:", b["gasUsed"]);

      let bal1 = await glue.contracts.glue.methods.balanceOf(user).call();

      let resGLUE = await glue.contracts.glue.methods.balanceOf(glue.contracts.reserves.options.address).call();

      let resycrv = await glue.contracts.ycrv.methods.balanceOf(glue.contracts.reserves.options.address).call();

      // no change
      expect(glue.toBigN(bal1).toNumber()).toBe(glue.toBigN(bal).toNumber());
      // no increases to reserves
      expect(glue.toBigN(resGLUE).toNumber()).toBe(0);
      expect(glue.toBigN(resycrv).toNumber()).toBe(0);
      r = await glue.contracts.uni_pair.methods.getReserves().call();
      q = await glue.contracts.uni_router.methods.quote(glue.toBigN(10**18).toString(), r[0], r[1]).call();
      console.log("quote post no rebase", q);
    });
    test("rebasing with Ramens in reserves", async () => {
      await glue.contracts.glue.methods.transfer(glue.contracts.reserves.options.address, glue.toBigN(60000*10**18).toString()).send({from: user});
      await glue.contracts.glue.methods.approve(
        glue.contracts.uni_router.options.address,
        -1
      ).send({
        from: user,
        gas: 80000
      });
      await glue.contracts.ycrv.methods.approve(
        glue.contracts.uni_router.options.address,
        -1
      ).send({
        from: user,
        gas: 80000
      });

      await glue.contracts.uni_router.methods.addLiquidity(
        glue.contracts.glue.options.address,
        glue.contracts.ycrv.options.address,
        "1000000000000000000000000",
        "1000000000000000000000000",
        "1000000000000000000000000",
        "1000000000000000000000000",
        user,
        1596740361 + 10000000
      ).send({
        from: user,
        gas: 8000000
      });

      let pair = await glue.contracts.uni_fact.methods.getPair(
        glue.contracts.glue.options.address,
        glue.contracts.ycrv.options.address
      ).call();

      glue.contracts.uni_pair.options.address = pair;
      let bal = await glue.contracts.uni_pair.methods.balanceOf(user).call();

      // make a trade to get init values in uniswap
      await glue.contracts.uni_router.methods.swapExactTokensForTokens(
        "100000000000",
        100000,
        [
          glue.contracts.ycrv.options.address,
          glue.contracts.glue.options.address
        ],
        user,
        1596740361 + 10000000
      ).send({
        from: user,
        gas: 1000000
      });

      // trade back for easier calcs later
      await glue.contracts.uni_router.methods.swapExactTokensForTokens(
        "100000000000",
        100000,
        [
          glue.contracts.glue.options.address,
          glue.contracts.ycrv.options.address
        ],
        user,
        1596740361 + 10000000
      ).send({
        from: user,
        gas: 1000000
      });

      await glue.testing.increaseTime(43200);

      await glue.contracts.rebaser.methods.init_twap().send({
        from: user,
        gas: 500000
      });


      await glue.contracts.uni_router.methods.swapExactTokensForTokens(
        "500000000000000000000000",
        100000,
        [
          glue.contracts.ycrv.options.address,
          glue.contracts.glue.options.address
        ],
        user,
        1596740361 + 10000000
      ).send({
        from: user,
        gas: 1000000
      });

      // init twap
      let init_twap = await glue.contracts.rebaser.methods.timeOfTWAPInit().call();

      // wait 12 hours
      await glue.testing.increaseTime(12 * 60 * 60);

      // perform trade to change price
      await glue.contracts.uni_router.methods.swapExactTokensForTokens(
        "10000000000000000000",
        100000,
        [
          glue.contracts.ycrv.options.address,
          glue.contracts.glue.options.address
        ],
        user,
        1596740361 + 10000000
      ).send({
        from: user,
        gas: 1000000
      });

      // activate rebasing
      await glue.contracts.rebaser.methods.activate_rebasing().send({
        from: user,
        gas: 500000
      });


      bal = await glue.contracts.glue.methods.balanceOf(user).call();

      let a = await glue.web3.eth.getBlock('latest');

      let offset = await glue.contracts.rebaser.methods.rebaseWindowOffsetSec().call();
      offset = glue.toBigN(offset).toNumber();
      let interval = await glue.contracts.rebaser.methods.minRebaseTimeIntervalSec().call();
      interval = glue.toBigN(interval).toNumber();

      let i;
      if (a["timestamp"] % interval > offset) {
        i = (interval - (a["timestamp"] % interval)) + offset;
      } else {
        i = offset - (a["timestamp"] % interval);
      }

      await glue.testing.increaseTime(i);


      let r = await glue.contracts.uni_pair.methods.getReserves().call();
      let q = await glue.contracts.uni_router.methods.quote(glue.toBigN(10**18).toString(), r[0], r[1]).call();
      console.log("quote pre pos rebase with reserves", q);

      let b = await glue.contracts.rebaser.methods.rebase().send({
        from: user,
        gas: 2500000
      });
      //console.log(b.events)

      console.log("positive  with reserves gas used:", b["gasUsed"]);

      let bal1 = await glue.contracts.glue.methods.balanceOf(user).call();

      let resGLUE = await glue.contracts.glue.methods.balanceOf(glue.contracts.reserves.options.address).call();

      let resycrv = await glue.contracts.ycrv.methods.balanceOf(glue.contracts.reserves.options.address).call();

      console.log(bal, bal1, resGLUE, resycrv);
      expect(glue.toBigN(bal).toNumber()).toBeLessThan(glue.toBigN(bal1).toNumber());
      expect(glue.toBigN(resGLUE).toNumber()).toBeGreaterThan(0);
      expect(glue.toBigN(resycrv).toNumber()).toBeGreaterThan(0);
      r = await glue.contracts.uni_pair.methods.getReserves().call();
      q = await glue.contracts.uni_router.methods.quote(glue.toBigN(10**18).toString(), r[0], r[1]).call();
      console.log("quote post rebase w/ reserves", q);
      expect(glue.toBigN(q).toNumber()).toBeGreaterThan(glue.toBigN(10**18).toNumber());
    });
  });

  describe("failing", () => {
    test("unitialized rebasing", async () => {
      await glue.testing.expectThrow(glue.contracts.rebaser.methods.activate_rebasing().send({
        from: user,
        gas: 500000
      }), "twap wasnt intitiated, call init_twap()");
    });
    test("no early twap", async () => {
      await glue.testing.expectThrow(glue.contracts.rebaser.methods.init_twap().send({
        from: user,
        gas: 500000
      }), "");
    });
    test("too late rebasing", async () => {
      await glue.contracts.glue.methods.approve(
        glue.contracts.uni_router.options.address,
        -1
      ).send({
        from: user,
        gas: 80000
      });
      await glue.contracts.ycrv.methods.approve(
        glue.contracts.uni_router.options.address,
        -1
      ).send({
        from: user,
        gas: 80000
      });

      await glue.contracts.uni_router.methods.addLiquidity(
        glue.contracts.glue.options.address,
        glue.contracts.ycrv.options.address,
        "1000000000000000000000000",
        "1000000000000000000000000",
        "1000000000000000000000000",
        "1000000000000000000000000",
        user,
        1596740361 + 10000000
      ).send({
        from: user,
        gas: 8000000
      });

      let pair = await glue.contracts.uni_fact.methods.getPair(
        glue.contracts.glue.options.address,
        glue.contracts.ycrv.options.address
      ).call();

      glue.contracts.uni_pair.options.address = pair;
      let bal = await glue.contracts.uni_pair.methods.balanceOf(user).call();

      // make a trade to get init values in uniswap
      await glue.contracts.uni_router.methods.swapExactTokensForTokens(
        "100000000000",
        100000,
        [
          glue.contracts.ycrv.options.address,
          glue.contracts.glue.options.address
        ],
        user,
        1596740361 + 10000000
      ).send({
        from: user,
        gas: 1000000
      });

      // trade back for easier calcs later
      await glue.contracts.uni_router.methods.swapExactTokensForTokens(
        "100000000000",
        100000,
        [
          glue.contracts.glue.options.address,
          glue.contracts.ycrv.options.address
        ],
        user,
        1596740361 + 10000000
      ).send({
        from: user,
        gas: 1000000
      });

      await glue.testing.increaseTime(43200);

      await glue.contracts.rebaser.methods.init_twap().send({
        from: user,
        gas: 500000
      });


      await glue.contracts.uni_router.methods.swapExactTokensForTokens(
        "500000000000000000000000",
        100000,
        [
          glue.contracts.ycrv.options.address,
          glue.contracts.glue.options.address
        ],
        user,
        1596740361 + 10000000
      ).send({
        from: user,
        gas: 1000000
      });

      // init twap
      let init_twap = await glue.contracts.rebaser.methods.timeOfTWAPInit().call();

      // wait 12 hours
      await glue.testing.increaseTime(12 * 60 * 60);

      // perform trade to change price
      await glue.contracts.uni_router.methods.swapExactTokensForTokens(
        "10000000000000000000",
        100000,
        [
          glue.contracts.ycrv.options.address,
          glue.contracts.glue.options.address
        ],
        user,
        1596740361 + 10000000
      ).send({
        from: user,
        gas: 1000000
      });

      // activate rebasing
      await glue.contracts.rebaser.methods.activate_rebasing().send({
        from: user,
        gas: 500000
      });


      bal = await glue.contracts.glue.methods.balanceOf(user).call();

      let a = await glue.web3.eth.getBlock('latest');

      let offset = await glue.contracts.rebaser.methods.rebaseWindowOffsetSec().call();
      offset = glue.toBigN(offset).toNumber();
      let interval = await glue.contracts.rebaser.methods.minRebaseTimeIntervalSec().call();
      interval = glue.toBigN(interval).toNumber();

      let i;
      if (a["timestamp"] % interval > offset) {
        i = (interval - (a["timestamp"] % interval)) + offset;
      } else {
        i = offset - (a["timestamp"] % interval);
      }

      let len = await glue.contracts.rebaser.methods.rebaseWindowLengthSec().call();

      await glue.testing.increaseTime(i + glue.toBigN(len).toNumber()+1);

      let b = await glue.testing.expectThrow(glue.contracts.rebaser.methods.rebase().send({
        from: user,
        gas: 2500000
      }), "too late");
    });
    test("too early rebasing", async () => {
      await glue.contracts.glue.methods.approve(
        glue.contracts.uni_router.options.address,
        -1
      ).send({
        from: user,
        gas: 80000
      });
      await glue.contracts.ycrv.methods.approve(
        glue.contracts.uni_router.options.address,
        -1
      ).send({
        from: user,
        gas: 80000
      });

      await glue.contracts.uni_router.methods.addLiquidity(
        glue.contracts.glue.options.address,
        glue.contracts.ycrv.options.address,
        "1000000000000000000000000",
        "1000000000000000000000000",
        "1000000000000000000000000",
        "1000000000000000000000000",
        user,
        1596740361 + 10000000
      ).send({
        from: user,
        gas: 8000000
      });

      let pair = await glue.contracts.uni_fact.methods.getPair(
        glue.contracts.glue.options.address,
        glue.contracts.ycrv.options.address
      ).call();

      glue.contracts.uni_pair.options.address = pair;
      let bal = await glue.contracts.uni_pair.methods.balanceOf(user).call();

      // make a trade to get init values in uniswap
      await glue.contracts.uni_router.methods.swapExactTokensForTokens(
        "100000000000",
        100000,
        [
          glue.contracts.ycrv.options.address,
          glue.contracts.glue.options.address
        ],
        user,
        1596740361 + 10000000
      ).send({
        from: user,
        gas: 1000000
      });

      // trade back for easier calcs later
      await glue.contracts.uni_router.methods.swapExactTokensForTokens(
        "100000000000",
        100000,
        [
          glue.contracts.glue.options.address,
          glue.contracts.ycrv.options.address
        ],
        user,
        1596740361 + 10000000
      ).send({
        from: user,
        gas: 1000000
      });

      await glue.testing.increaseTime(43200);

      await glue.contracts.rebaser.methods.init_twap().send({
        from: user,
        gas: 500000
      });


      await glue.contracts.uni_router.methods.swapExactTokensForTokens(
        "500000000000000000000000",
        100000,
        [
          glue.contracts.ycrv.options.address,
          glue.contracts.glue.options.address
        ],
        user,
        1596740361 + 10000000
      ).send({
        from: user,
        gas: 1000000
      });

      // init twap
      let init_twap = await glue.contracts.rebaser.methods.timeOfTWAPInit().call();

      // wait 12 hours
      await glue.testing.increaseTime(12 * 60 * 60);

      // perform trade to change price
      await glue.contracts.uni_router.methods.swapExactTokensForTokens(
        "10000000000000000000",
        100000,
        [
          glue.contracts.ycrv.options.address,
          glue.contracts.glue.options.address
        ],
        user,
        1596740361 + 10000000
      ).send({
        from: user,
        gas: 1000000
      });

      // activate rebasing
      await glue.contracts.rebaser.methods.activate_rebasing().send({
        from: user,
        gas: 500000
      });

      bal = await glue.contracts.glue.methods.balanceOf(user).call();

      let a = await glue.web3.eth.getBlock('latest');

      let offset = await glue.contracts.rebaser.methods.rebaseWindowOffsetSec().call();
      offset = glue.toBigN(offset).toNumber();
      let interval = await glue.contracts.rebaser.methods.minRebaseTimeIntervalSec().call();
      interval = glue.toBigN(interval).toNumber();

      let i;
      if (a["timestamp"] % interval > offset) {
        i = (interval - (a["timestamp"] % interval)) + offset;
      } else {
        i = offset - (a["timestamp"] % interval);
      }

      await glue.testing.increaseTime(i - 1);



      let b = await glue.testing.expectThrow(glue.contracts.rebaser.methods.rebase().send({
        from: user,
        gas: 2500000
      }), "too early");
    });
  });
});
