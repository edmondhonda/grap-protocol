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
    defaultGasPrice: "1",
    accounts: [],
    ethereumNodeTimeout: 10000
  }
)
const oneEther = 10 ** 18;

describe("Distribution", () => {
  let snapshotId;
  let user;
  let user2;
  let ycrv_account = "0x0eb4add4ba497357546da7f5d12d39587ca24606";
  let weth_account = "0xf9e11762d522ea29dd78178c9baf83b7b093aacc";
  let uni_ampl_account = "0x8c545be506a335e24145edd6e01d2754296ff018";
  let comp_account = "0xc89b6f0146642688bb254bf93c28fccf1e182c81";
  let lend_account = "0x3b08aa814bea604917418a9f0907e7fc430e742c";
  let link_account = "0xbe6977e08d4479c0a6777539ae0e8fa27be4e9d6";
  let mkr_account = "0xf37216a8ac034d08b4663108d7532dfcb44583ed";
  let snx_account = "0xb696d629cd0a00560151a434f6b4478ad6c228d7"
  let yfi_account = "0x0eb4add4ba497357546da7f5d12d39587ca24606";
  beforeAll(async () => {
    const accounts = await glue.web3.eth.getAccounts();
    glue.addAccount(accounts[0]);
    user = accounts[0];
    glue.addAccount(accounts[1]);
    user2 = accounts[1];
    snapshotId = await glue.testing.snapshot();
  });

  beforeEach(async () => {
    await glue.testing.resetEVM("0x2");
  });

  describe("pool failures", () => {
    test("cant join pool 1s early", async () => {
      await glue.testing.resetEVM("0x2");
      let a = await glue.web3.eth.getBlock('latest');

      let starttime = await glue.contracts.eth_pool.methods.starttime().call();

      expect(glue.toBigN(a["timestamp"]).toNumber()).toBeLessThan(glue.toBigN(starttime).toNumber());

      //console.log("starttime", a["timestamp"], starttime);
      await glue.contracts.weth.methods.approve(glue.contracts.eth_pool.options.address, -1).send({from: user});

      await glue.testing.expectThrow(
        glue.contracts.eth_pool.methods.stake(
          glue.toBigN(200).times(glue.toBigN(10**18)).toString()
        ).send({
          from: user,
          gas: 300000
        })
      , "not start");


      a = await glue.web3.eth.getBlock('latest');

      starttime = await glue.contracts.ampl_pool.methods.starttime().call();

      expect(glue.toBigN(a["timestamp"]).toNumber()).toBeLessThan(glue.toBigN(starttime).toNumber());

      //console.log("starttime", a["timestamp"], starttime);

      await glue.contracts.UNIAmpl.methods.approve(glue.contracts.ampl_pool.options.address, -1).send({from: user});

      await glue.testing.expectThrow(glue.contracts.ampl_pool.methods.stake(
        "5016536322915819"
      ).send({
        from: user,
        gas: 300000
      }), "not start");
    });

    test("cant join pool 2 early", async () => {

    });

    test("cant withdraw more than deposited", async () => {
      await glue.testing.resetEVM("0x2");
      let a = await glue.web3.eth.getBlock('latest');

      await glue.contracts.weth.methods.transfer(user, glue.toBigN(2000).times(glue.toBigN(10**18)).toString()).send({
        from: weth_account
      });
      await glue.contracts.UNIAmpl.methods.transfer(user, "5000000000000000").send({
        from: uni_ampl_account
      });

      let starttime = await glue.contracts.eth_pool.methods.starttime().call();

      let waittime = starttime - a["timestamp"];
      if (waittime > 0) {
        await glue.testing.increaseTime(waittime);
      }

      await glue.contracts.weth.methods.approve(glue.contracts.eth_pool.options.address, -1).send({from: user});

      await glue.contracts.eth_pool.methods.stake(
        glue.toBigN(200).times(glue.toBigN(10**18)).toString()
      ).send({
        from: user,
        gas: 300000
      });

      await glue.contracts.UNIAmpl.methods.approve(glue.contracts.ampl_pool.options.address, -1).send({from: user});

      await glue.contracts.ampl_pool.methods.stake(
        "5000000000000000"
      ).send({
        from: user,
        gas: 300000
      });

      await glue.testing.expectThrow(glue.contracts.ampl_pool.methods.withdraw(
        "5016536322915820"
      ).send({
        from: user,
        gas: 300000
      }), "");

      await glue.testing.expectThrow(glue.contracts.eth_pool.methods.withdraw(
        glue.toBigN(201).times(glue.toBigN(10**18)).toString()
      ).send({
        from: user,
        gas: 300000
      }), "");

    });
  });

  describe("incentivizer pool", () => {
    test("joining and exiting", async() => {
      await glue.testing.resetEVM("0x2");

      await glue.contracts.ycrv.methods.transfer(user, "12000000000000000000000000").send({
        from: ycrv_account
      });

      await glue.contracts.weth.methods.transfer(user, glue.toBigN(2000).times(glue.toBigN(10**18)).toString()).send({
        from: weth_account
      });

      let a = await glue.web3.eth.getBlock('latest');

      let starttime = await glue.contracts.eth_pool.methods.starttime().call();

      let waittime = starttime - a["timestamp"];
      if (waittime > 0) {
        await glue.testing.increaseTime(waittime);
      } else {
        console.log("late entry", waittime)
      }

      await glue.contracts.weth.methods.approve(glue.contracts.eth_pool.options.address, -1).send({from: user});

      await glue.contracts.eth_pool.methods.stake(
        "2000000000000000000000"
      ).send({
        from: user,
        gas: 300000
      });

      let earned = await glue.contracts.eth_pool.methods.earned(user).call();

      let rr = await glue.contracts.eth_pool.methods.rewardRate().call();

      let rpt = await glue.contracts.eth_pool.methods.rewardPerToken().call();
      //console.log(earned, rr, rpt);
      await glue.testing.increaseTime(86400);
      // await glue.testing.mineBlock();

      earned = await glue.contracts.eth_pool.methods.earned(user).call();

      rpt = await glue.contracts.eth_pool.methods.rewardPerToken().call();

      let ysf = await glue.contracts.glue.methods.gluesScalingFactor().call();

      console.log(earned, ysf, rpt);

      let j = await glue.contracts.eth_pool.methods.getReward().send({
        from: user,
        gas: 300000
      });

      let glue_bal = await glue.contracts.glue.methods.balanceOf(user).call()

      console.log("glue bal", glue_bal)
      // start rebasing
        //console.log("approve glue")
        await glue.contracts.glue.methods.approve(
          glue.contracts.uni_router.options.address,
          -1
        ).send({
          from: user,
          gas: 80000
        });
        //console.log("approve ycrv")
        await glue.contracts.ycrv.methods.approve(
          glue.contracts.uni_router.options.address,
          -1
        ).send({
          from: user,
          gas: 80000
        });

        let ycrv_bal = await glue.contracts.ycrv.methods.balanceOf(user).call()

        console.log("ycrv_bal bal", ycrv_bal)

        console.log("add liq/ create pool")
        await glue.contracts.uni_router.methods.addLiquidity(
          glue.contracts.glue.options.address,
          glue.contracts.ycrv.options.address,
          glue_bal,
          glue_bal,
          glue_bal,
          glue_bal,
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

        await glue.contracts.uni_pair.methods.approve(
          glue.contracts.ycrv_pool.options.address,
          -1
        ).send({
          from: user,
          gas: 300000
        });

        starttime = await glue.contracts.ycrv_pool.methods.starttime().call();

        a = await glue.web3.eth.getBlock('latest');

        waittime = starttime - a["timestamp"];
        if (waittime > 0) {
          await glue.testing.increaseTime(waittime);
        } else {
          console.log("late entry, pool 2", waittime)
        }

        await glue.contracts.ycrv_pool.methods.stake(bal).send({from: user, gas: 400000});


        earned = await glue.contracts.ampl_pool.methods.earned(user).call();

        rr = await glue.contracts.ampl_pool.methods.rewardRate().call();

        rpt = await glue.contracts.ampl_pool.methods.rewardPerToken().call();

        console.log(earned, rr, rpt);

        await glue.testing.increaseTime(625000 + 1000);

        earned = await glue.contracts.ampl_pool.methods.earned(user).call();

        rr = await glue.contracts.ampl_pool.methods.rewardRate().call();

        rpt = await glue.contracts.ampl_pool.methods.rewardPerToken().call();

        console.log(earned, rr, rpt);

        await glue.contracts.ycrv_pool.methods.exit().send({from: user, gas: 400000});

        glue_bal = await glue.contracts.glue.methods.balanceOf(user).call();


        expect(glue.toBigN(glue_bal).toNumber()).toBeGreaterThan(0)
        console.log("glue bal after staking in pool 2", glue_bal);
    });
  });

  describe("ampl", () => {
    test("rewards from pool 1s ampl", async () => {
        await glue.testing.resetEVM("0x2");

        await glue.contracts.UNIAmpl.methods.transfer(user, "5000000000000000").send({
          from: uni_ampl_account
        });
        let a = await glue.web3.eth.getBlock('latest');

        let starttime = await glue.contracts.eth_pool.methods.starttime().call();

        let waittime = starttime - a["timestamp"];
        if (waittime > 0) {
          await glue.testing.increaseTime(waittime);
        } else {
          //console.log("missed entry");
        }

        await glue.contracts.UNIAmpl.methods.approve(glue.contracts.ampl_pool.options.address, -1).send({from: user});

        await glue.contracts.ampl_pool.methods.stake(
          "5000000000000000"
        ).send({
          from: user,
          gas: 300000
        });

        let earned = await glue.contracts.ampl_pool.methods.earned(user).call();

        let rr = await glue.contracts.ampl_pool.methods.rewardRate().call();

        let rpt = await glue.contracts.ampl_pool.methods.rewardPerToken().call();
        //console.log(earned, rr, rpt);
        await glue.testing.increaseTime(625000 + 100);
        // await glue.testing.mineBlock();

        earned = await glue.contracts.ampl_pool.methods.earned(user).call();

        rpt = await glue.contracts.ampl_pool.methods.rewardPerToken().call();

        let ysf = await glue.contracts.glue.methods.gluesScalingFactor().call();

        //console.log(earned, ysf, rpt);


        let glue_bal = await glue.contracts.glue.methods.balanceOf(user).call()

        let j = await glue.contracts.ampl_pool.methods.exit().send({
          from: user,
          gas: 300000
        });

        //console.log(j.events)

        // let k = await glue.contracts.eth_pool.methods.exit().send({
        //   from: user,
        //   gas: 300000
        // });
        //
        // //console.log(k.events)

        // weth_bal = await glue.contracts.weth.methods.balanceOf(user).call()

        // expect(weth_bal).toBe(glue.toBigN(2000).times(glue.toBigN(10**18)).toString())

        let ampl_bal = await glue.contracts.UNIAmpl.methods.balanceOf(user).call()

        expect(ampl_bal).toBe("5000000000000000")


        let glue_bal2 = await glue.contracts.glue.methods.balanceOf(user).call()

        let two_fity = glue.toBigN(250).times(glue.toBigN(10**3)).times(glue.toBigN(10**18))
        expect(glue.toBigN(glue_bal2).minus(glue.toBigN(glue_bal)).toString()).toBe(two_fity.times(1).toString())
    });
  });

  describe("eth", () => {
    test("rewards from pool 1s eth", async () => {
        await glue.testing.resetEVM("0x2");

        await glue.contracts.weth.methods.transfer(user, glue.toBigN(2000).times(glue.toBigN(10**18)).toString()).send({
          from: weth_account
        });

        let a = await glue.web3.eth.getBlock('latest');

        let starttime = await glue.contracts.eth_pool.methods.starttime().call();

        let waittime = starttime - a["timestamp"];
        if (waittime > 0) {
          await glue.testing.increaseTime(waittime);
        } else {
          console.log("late entry", waittime)
        }

        await glue.contracts.weth.methods.approve(glue.contracts.eth_pool.options.address, -1).send({from: user});

        await glue.contracts.eth_pool.methods.stake(
          "2000000000000000000000"
        ).send({
          from: user,
          gas: 300000
        });

        let earned = await glue.contracts.eth_pool.methods.earned(user).call();

        let rr = await glue.contracts.eth_pool.methods.rewardRate().call();

        let rpt = await glue.contracts.eth_pool.methods.rewardPerToken().call();
        //console.log(earned, rr, rpt);
        await glue.testing.increaseTime(625000 + 100);
        // await glue.testing.mineBlock();

        earned = await glue.contracts.eth_pool.methods.earned(user).call();

        rpt = await glue.contracts.eth_pool.methods.rewardPerToken().call();

        let ysf = await glue.contracts.glue.methods.gluesScalingFactor().call();

        //console.log(earned, ysf, rpt);


        let glue_bal = await glue.contracts.glue.methods.balanceOf(user).call()

        let j = await glue.contracts.eth_pool.methods.exit().send({
          from: user,
          gas: 300000
        });

        //console.log(j.events)

        let weth_bal = await glue.contracts.weth.methods.balanceOf(user).call()

        expect(weth_bal).toBe("2000000000000000000000")


        let glue_bal2 = await glue.contracts.glue.methods.balanceOf(user).call()

        let two_fity = glue.toBigN(250).times(glue.toBigN(10**3)).times(glue.toBigN(10**18))
        expect(glue.toBigN(glue_bal2).minus(glue.toBigN(glue_bal)).toString()).toBe(two_fity.times(1).toString())
    });
    test("rewards from pool 1s eth with rebase", async () => {
        await glue.testing.resetEVM("0x2");

        await glue.contracts.ycrv.methods.transfer(user, "12000000000000000000000000").send({
          from: ycrv_account
        });

        await glue.contracts.weth.methods.transfer(user, glue.toBigN(2000).times(glue.toBigN(10**18)).toString()).send({
          from: weth_account
        });

        let a = await glue.web3.eth.getBlock('latest');

        let starttime = await glue.contracts.eth_pool.methods.starttime().call();

        let waittime = starttime - a["timestamp"];
        if (waittime > 0) {
          await glue.testing.increaseTime(waittime);
        } else {
          console.log("late entry", waittime)
        }

        await glue.contracts.weth.methods.approve(glue.contracts.eth_pool.options.address, -1).send({from: user});

        await glue.contracts.eth_pool.methods.stake(
          "2000000000000000000000"
        ).send({
          from: user,
          gas: 300000
        });

        let earned = await glue.contracts.eth_pool.methods.earned(user).call();

        let rr = await glue.contracts.eth_pool.methods.rewardRate().call();

        let rpt = await glue.contracts.eth_pool.methods.rewardPerToken().call();
        //console.log(earned, rr, rpt);
        await glue.testing.increaseTime(125000 + 100);
        // await glue.testing.mineBlock();

        earned = await glue.contracts.eth_pool.methods.earned(user).call();

        rpt = await glue.contracts.eth_pool.methods.rewardPerToken().call();

        let ysf = await glue.contracts.glue.methods.gluesScalingFactor().call();

        //console.log(earned, ysf, rpt);




        let j = await glue.contracts.eth_pool.methods.getReward().send({
          from: user,
          gas: 300000
        });

        let glue_bal = await glue.contracts.glue.methods.balanceOf(user).call()

        console.log("glue bal", glue_bal)
        // start rebasing
          //console.log("approve glue")
          await glue.contracts.glue.methods.approve(
            glue.contracts.uni_router.options.address,
            -1
          ).send({
            from: user,
            gas: 80000
          });
          //console.log("approve ycrv")
          await glue.contracts.ycrv.methods.approve(
            glue.contracts.uni_router.options.address,
            -1
          ).send({
            from: user,
            gas: 80000
          });

          let ycrv_bal = await glue.contracts.ycrv.methods.balanceOf(user).call()

          console.log("ycrv_bal bal", ycrv_bal)

          console.log("add liq/ create pool")
          await glue.contracts.uni_router.methods.addLiquidity(
            glue.contracts.glue.options.address,
            glue.contracts.ycrv.options.address,
            glue_bal,
            glue_bal,
            glue_bal,
            glue_bal,
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
          //console.log("init swap")
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

          // trade back for easier calcs later
          //console.log("swap 0")
          await glue.contracts.uni_router.methods.swapExactTokensForTokens(
            "10000000000000000",
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

          await glue.testing.increaseTime(43200);

          //console.log("init twap")
          await glue.contracts.rebaser.methods.init_twap().send({
            from: user,
            gas: 500000
          });

          //console.log("first swap")
          await glue.contracts.uni_router.methods.swapExactTokensForTokens(
            "1000000000000000000000",
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
          //console.log("second swap")
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

          a = await glue.web3.eth.getBlock('latest');

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

          let bal1 = await glue.contracts.glue.methods.balanceOf(user).call();

          let resGLUE = await glue.contracts.glue.methods.balanceOf(glue.contracts.reserves.options.address).call();

          let resycrv = await glue.contracts.ycrv.methods.balanceOf(glue.contracts.reserves.options.address).call();

          // new balance > old balance
          expect(glue.toBigN(bal).toNumber()).toBeLessThan(glue.toBigN(bal1).toNumber());
          // increases reserves
          expect(glue.toBigN(resycrv).toNumber()).toBeGreaterThan(0);

          r = await glue.contracts.uni_pair.methods.getReserves().call();
          q = await glue.contracts.uni_router.methods.quote(glue.toBigN(10**18).toString(), r[0], r[1]).call();
          console.log("quote", q);
          // not below peg
          expect(glue.toBigN(q).toNumber()).toBeGreaterThan(glue.toBigN(10**18).toNumber());


        await glue.testing.increaseTime(525000 + 100);


        j = await glue.contracts.eth_pool.methods.exit().send({
          from: user,
          gas: 300000
        });
        //console.log(j.events)

        let weth_bal = await glue.contracts.weth.methods.balanceOf(user).call()

        expect(weth_bal).toBe("2000000000000000000000")


        let glue_bal2 = await glue.contracts.glue.methods.balanceOf(user).call()

        let two_fity = glue.toBigN(250).times(glue.toBigN(10**3)).times(glue.toBigN(10**18))
        expect(
          glue.toBigN(glue_bal2).minus(glue.toBigN(glue_bal)).toNumber()
        ).toBeGreaterThan(two_fity.toNumber())
    });
    test("rewards from pool 1s eth with negative rebase", async () => {
        await glue.testing.resetEVM("0x2");

        await glue.contracts.ycrv.methods.transfer(user, "12000000000000000000000000").send({
          from: ycrv_account
        });

        await glue.contracts.weth.methods.transfer(user, glue.toBigN(2000).times(glue.toBigN(10**18)).toString()).send({
          from: weth_account
        });

        let a = await glue.web3.eth.getBlock('latest');

        let starttime = await glue.contracts.eth_pool.methods.starttime().call();

        let waittime = starttime - a["timestamp"];
        if (waittime > 0) {
          await glue.testing.increaseTime(waittime);
        } else {
          console.log("late entry", waittime)
        }

        await glue.contracts.weth.methods.approve(glue.contracts.eth_pool.options.address, -1).send({from: user});

        await glue.contracts.eth_pool.methods.stake(
          "2000000000000000000000"
        ).send({
          from: user,
          gas: 300000
        });

        let earned = await glue.contracts.eth_pool.methods.earned(user).call();

        let rr = await glue.contracts.eth_pool.methods.rewardRate().call();

        let rpt = await glue.contracts.eth_pool.methods.rewardPerToken().call();
        //console.log(earned, rr, rpt);
        await glue.testing.increaseTime(125000 + 100);
        // await glue.testing.mineBlock();

        earned = await glue.contracts.eth_pool.methods.earned(user).call();

        rpt = await glue.contracts.eth_pool.methods.rewardPerToken().call();

        let ysf = await glue.contracts.glue.methods.gluesScalingFactor().call();

        //console.log(earned, ysf, rpt);




        let j = await glue.contracts.eth_pool.methods.getReward().send({
          from: user,
          gas: 300000
        });

        let glue_bal = await glue.contracts.glue.methods.balanceOf(user).call()

        console.log("glue bal", glue_bal)
        // start rebasing
          //console.log("approve glue")
          await glue.contracts.glue.methods.approve(
            glue.contracts.uni_router.options.address,
            -1
          ).send({
            from: user,
            gas: 80000
          });
          //console.log("approve ycrv")
          await glue.contracts.ycrv.methods.approve(
            glue.contracts.uni_router.options.address,
            -1
          ).send({
            from: user,
            gas: 80000
          });

          let ycrv_bal = await glue.contracts.ycrv.methods.balanceOf(user).call()

          console.log("ycrv_bal bal", ycrv_bal)

          glue_bal = glue.toBigN(glue_bal);
          console.log("add liq/ create pool")
          await glue.contracts.uni_router.methods.addLiquidity(
            glue.contracts.glue.options.address,
            glue.contracts.ycrv.options.address,
            glue_bal.times(.1).toString(),
            glue_bal.times(.1).toString(),
            glue_bal.times(.1).toString(),
            glue_bal.times(.1).toString(),
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
          //console.log("init swap")
          await glue.contracts.uni_router.methods.swapExactTokensForTokens(
            "1000000000000000000000",
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

          // trade back for easier calcs later
          //console.log("swap 0")
          await glue.contracts.uni_router.methods.swapExactTokensForTokens(
            "100000000000000",
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

          //console.log("init twap")
          await glue.contracts.rebaser.methods.init_twap().send({
            from: user,
            gas: 500000
          });

          //console.log("first swap")
          await glue.contracts.uni_router.methods.swapExactTokensForTokens(
            "100000000000000",
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
          //console.log("second swap")
          await glue.contracts.uni_router.methods.swapExactTokensForTokens(
            "1000000000000000000",
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

          a = await glue.web3.eth.getBlock('latest');

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

          let bal1 = await glue.contracts.glue.methods.balanceOf(user).call();

          let resGLUE = await glue.contracts.glue.methods.balanceOf(glue.contracts.reserves.options.address).call();

          let resycrv = await glue.contracts.ycrv.methods.balanceOf(glue.contracts.reserves.options.address).call();

          expect(glue.toBigN(bal1).toNumber()).toBeLessThan(glue.toBigN(bal).toNumber());
          expect(glue.toBigN(resycrv).toNumber()).toBe(0);

          r = await glue.contracts.uni_pair.methods.getReserves().call();
          q = await glue.contracts.uni_router.methods.quote(glue.toBigN(10**18).toString(), r[0], r[1]).call();
          console.log("quote", q);
          // not below peg
          expect(glue.toBigN(q).toNumber()).toBeLessThan(glue.toBigN(10**18).toNumber());


        await glue.testing.increaseTime(525000 + 100);


        j = await glue.contracts.eth_pool.methods.exit().send({
          from: user,
          gas: 300000
        });
        //console.log(j.events)

        let weth_bal = await glue.contracts.weth.methods.balanceOf(user).call()

        expect(weth_bal).toBe("2000000000000000000000")


        let glue_bal2 = await glue.contracts.glue.methods.balanceOf(user).call()

        let two_fity = glue.toBigN(250).times(glue.toBigN(10**3)).times(glue.toBigN(10**18))
        expect(
          glue.toBigN(glue_bal2).minus(glue.toBigN(glue_bal)).toNumber()
        ).toBeLessThan(two_fity.toNumber())
    });
  });

  describe("yfi", () => {
    test("rewards from pool 1s yfi", async () => {
        await glue.testing.resetEVM("0x2");
        await glue.contracts.yfi.methods.transfer(user, "500000000000000000000").send({
          from: yfi_account
        });

        let a = await glue.web3.eth.getBlock('latest');

        let starttime = await glue.contracts.yfi_pool.methods.starttime().call();

        let waittime = starttime - a["timestamp"];
        if (waittime > 0) {
          await glue.testing.increaseTime(waittime);
        } else {
          console.log("late entry", waittime)
        }

        await glue.contracts.yfi.methods.approve(glue.contracts.yfi_pool.options.address, -1).send({from: user});

        await glue.contracts.yfi_pool.methods.stake(
          "500000000000000000000"
        ).send({
          from: user,
          gas: 300000
        });

        let earned = await glue.contracts.yfi_pool.methods.earned(user).call();

        let rr = await glue.contracts.yfi_pool.methods.rewardRate().call();

        let rpt = await glue.contracts.yfi_pool.methods.rewardPerToken().call();
        //console.log(earned, rr, rpt);
        await glue.testing.increaseTime(625000 + 100);
        // await glue.testing.mineBlock();

        earned = await glue.contracts.yfi_pool.methods.earned(user).call();

        rpt = await glue.contracts.yfi_pool.methods.rewardPerToken().call();

        let ysf = await glue.contracts.glue.methods.gluesScalingFactor().call();

        //console.log(earned, ysf, rpt);


        let glue_bal = await glue.contracts.glue.methods.balanceOf(user).call()

        let j = await glue.contracts.yfi_pool.methods.exit().send({
          from: user,
          gas: 300000
        });

        //console.log(j.events)

        let weth_bal = await glue.contracts.yfi.methods.balanceOf(user).call()

        expect(weth_bal).toBe("500000000000000000000")


        let glue_bal2 = await glue.contracts.glue.methods.balanceOf(user).call()

        let two_fity = glue.toBigN(250).times(glue.toBigN(10**3)).times(glue.toBigN(10**18))
        expect(glue.toBigN(glue_bal2).minus(glue.toBigN(glue_bal)).toString()).toBe(two_fity.times(1).toString())
    });
  });

  describe("comp", () => {
    test("rewards from pool 1s comp", async () => {
        await glue.testing.resetEVM("0x2");
        await glue.contracts.comp.methods.transfer(user, "50000000000000000000000").send({
          from: comp_account
        });

        let a = await glue.web3.eth.getBlock('latest');

        let starttime = await glue.contracts.comp_pool.methods.starttime().call();

        let waittime = starttime - a["timestamp"];
        if (waittime > 0) {
          await glue.testing.increaseTime(waittime);
        } else {
          console.log("late entry", waittime)
        }

        await glue.contracts.comp.methods.approve(glue.contracts.comp_pool.options.address, -1).send({from: user});

        await glue.contracts.comp_pool.methods.stake(
          "50000000000000000000000"
        ).send({
          from: user,
          gas: 300000
        });

        let earned = await glue.contracts.comp_pool.methods.earned(user).call();

        let rr = await glue.contracts.comp_pool.methods.rewardRate().call();

        let rpt = await glue.contracts.comp_pool.methods.rewardPerToken().call();
        //console.log(earned, rr, rpt);
        await glue.testing.increaseTime(625000 + 100);
        // await glue.testing.mineBlock();

        earned = await glue.contracts.comp_pool.methods.earned(user).call();

        rpt = await glue.contracts.comp_pool.methods.rewardPerToken().call();

        let ysf = await glue.contracts.glue.methods.gluesScalingFactor().call();

        //console.log(earned, ysf, rpt);


        let glue_bal = await glue.contracts.glue.methods.balanceOf(user).call()

        let j = await glue.contracts.comp_pool.methods.exit().send({
          from: user,
          gas: 300000
        });

        //console.log(j.events)

        let weth_bal = await glue.contracts.comp.methods.balanceOf(user).call()

        expect(weth_bal).toBe("50000000000000000000000")


        let glue_bal2 = await glue.contracts.glue.methods.balanceOf(user).call()

        let two_fity = glue.toBigN(250).times(glue.toBigN(10**3)).times(glue.toBigN(10**18))
        expect(glue.toBigN(glue_bal2).minus(glue.toBigN(glue_bal)).toString()).toBe(two_fity.times(1).toString())
    });
  });

  describe("lend", () => {
    test("rewards from pool 1s lend", async () => {
        await glue.testing.resetEVM("0x2");
        await glue.web3.eth.sendTransaction({from: user2, to: lend_account, value : glue.toBigN(100000*10**18).toString()});

        await glue.contracts.lend.methods.transfer(user, "10000000000000000000000000").send({
          from: lend_account
        });

        let a = await glue.web3.eth.getBlock('latest');

        let starttime = await glue.contracts.lend_pool.methods.starttime().call();

        let waittime = starttime - a["timestamp"];
        if (waittime > 0) {
          await glue.testing.increaseTime(waittime);
        } else {
          console.log("late entry", waittime)
        }

        await glue.contracts.lend.methods.approve(glue.contracts.lend_pool.options.address, -1).send({from: user});

        await glue.contracts.lend_pool.methods.stake(
          "10000000000000000000000000"
        ).send({
          from: user,
          gas: 300000
        });

        let earned = await glue.contracts.lend_pool.methods.earned(user).call();

        let rr = await glue.contracts.lend_pool.methods.rewardRate().call();

        let rpt = await glue.contracts.lend_pool.methods.rewardPerToken().call();
        //console.log(earned, rr, rpt);
        await glue.testing.increaseTime(625000 + 100);
        // await glue.testing.mineBlock();

        earned = await glue.contracts.lend_pool.methods.earned(user).call();

        rpt = await glue.contracts.lend_pool.methods.rewardPerToken().call();

        let ysf = await glue.contracts.glue.methods.gluesScalingFactor().call();

        //console.log(earned, ysf, rpt);


        let glue_bal = await glue.contracts.glue.methods.balanceOf(user).call()

        let j = await glue.contracts.lend_pool.methods.exit().send({
          from: user,
          gas: 300000
        });

        //console.log(j.events)

        let weth_bal = await glue.contracts.lend.methods.balanceOf(user).call()

        expect(weth_bal).toBe("10000000000000000000000000")


        let glue_bal2 = await glue.contracts.glue.methods.balanceOf(user).call()

        let two_fity = glue.toBigN(250).times(glue.toBigN(10**3)).times(glue.toBigN(10**18))
        expect(glue.toBigN(glue_bal2).minus(glue.toBigN(glue_bal)).toString()).toBe(two_fity.times(1).toString())
    });
  });

  describe("link", () => {
    test("rewards from pool 1s link", async () => {
        await glue.testing.resetEVM("0x2");

        await glue.web3.eth.sendTransaction({from: user2, to: link_account, value : glue.toBigN(100000*10**18).toString()});

        await glue.contracts.link.methods.transfer(user, "10000000000000000000000000").send({
          from: link_account
        });

        let a = await glue.web3.eth.getBlock('latest');

        let starttime = await glue.contracts.link_pool.methods.starttime().call();

        let waittime = starttime - a["timestamp"];
        if (waittime > 0) {
          await glue.testing.increaseTime(waittime);
        } else {
          console.log("late entry", waittime)
        }

        await glue.contracts.link.methods.approve(glue.contracts.link_pool.options.address, -1).send({from: user});

        await glue.contracts.link_pool.methods.stake(
          "10000000000000000000000000"
        ).send({
          from: user,
          gas: 300000
        });

        let earned = await glue.contracts.link_pool.methods.earned(user).call();

        let rr = await glue.contracts.link_pool.methods.rewardRate().call();

        let rpt = await glue.contracts.link_pool.methods.rewardPerToken().call();
        //console.log(earned, rr, rpt);
        await glue.testing.increaseTime(625000 + 100);
        // await glue.testing.mineBlock();

        earned = await glue.contracts.link_pool.methods.earned(user).call();

        rpt = await glue.contracts.link_pool.methods.rewardPerToken().call();

        let ysf = await glue.contracts.glue.methods.gluesScalingFactor().call();

        //console.log(earned, ysf, rpt);


        let glue_bal = await glue.contracts.glue.methods.balanceOf(user).call()

        let j = await glue.contracts.link_pool.methods.exit().send({
          from: user,
          gas: 300000
        });

        //console.log(j.events)

        let weth_bal = await glue.contracts.link.methods.balanceOf(user).call()

        expect(weth_bal).toBe("10000000000000000000000000")


        let glue_bal2 = await glue.contracts.glue.methods.balanceOf(user).call()

        let two_fity = glue.toBigN(250).times(glue.toBigN(10**3)).times(glue.toBigN(10**18))
        expect(glue.toBigN(glue_bal2).minus(glue.toBigN(glue_bal)).toString()).toBe(two_fity.times(1).toString())
    });
  });

  describe("mkr", () => {
    test("rewards from pool 1s mkr", async () => {
        await glue.testing.resetEVM("0x2");
        await glue.web3.eth.sendTransaction({from: user2, to: mkr_account, value : glue.toBigN(100000*10**18).toString()});
        let eth_bal = await glue.web3.eth.getBalance(mkr_account);

        await glue.contracts.mkr.methods.transfer(user, "10000000000000000000000").send({
          from: mkr_account
        });

        let a = await glue.web3.eth.getBlock('latest');

        let starttime = await glue.contracts.mkr_pool.methods.starttime().call();

        let waittime = starttime - a["timestamp"];
        if (waittime > 0) {
          await glue.testing.increaseTime(waittime);
        } else {
          console.log("late entry", waittime)
        }

        await glue.contracts.mkr.methods.approve(glue.contracts.mkr_pool.options.address, -1).send({from: user});

        await glue.contracts.mkr_pool.methods.stake(
          "10000000000000000000000"
        ).send({
          from: user,
          gas: 300000
        });

        let earned = await glue.contracts.mkr_pool.methods.earned(user).call();

        let rr = await glue.contracts.mkr_pool.methods.rewardRate().call();

        let rpt = await glue.contracts.mkr_pool.methods.rewardPerToken().call();
        //console.log(earned, rr, rpt);
        await glue.testing.increaseTime(625000 + 100);
        // await glue.testing.mineBlock();

        earned = await glue.contracts.mkr_pool.methods.earned(user).call();

        rpt = await glue.contracts.mkr_pool.methods.rewardPerToken().call();

        let ysf = await glue.contracts.glue.methods.gluesScalingFactor().call();

        //console.log(earned, ysf, rpt);


        let glue_bal = await glue.contracts.glue.methods.balanceOf(user).call()

        let j = await glue.contracts.mkr_pool.methods.exit().send({
          from: user,
          gas: 300000
        });

        //console.log(j.events)

        let weth_bal = await glue.contracts.mkr.methods.balanceOf(user).call()

        expect(weth_bal).toBe("10000000000000000000000")


        let glue_bal2 = await glue.contracts.glue.methods.balanceOf(user).call()

        let two_fity = glue.toBigN(250).times(glue.toBigN(10**3)).times(glue.toBigN(10**18))
        expect(glue.toBigN(glue_bal2).minus(glue.toBigN(glue_bal)).toString()).toBe(two_fity.times(1).toString())
    });
  });

  describe("snx", () => {
    test("rewards from pool 1s snx", async () => {
        await glue.testing.resetEVM("0x2");

        await glue.web3.eth.sendTransaction({from: user2, to: snx_account, value : glue.toBigN(100000*10**18).toString()});

        let snx_bal = await glue.contracts.snx.methods.balanceOf(snx_account).call();

        console.log(snx_bal)

        await glue.contracts.snx.methods.transfer(user, snx_bal).send({
          from: snx_account
        });

        snx_bal = await glue.contracts.snx.methods.balanceOf(user).call();

        console.log(snx_bal)

        let a = await glue.web3.eth.getBlock('latest');

        let starttime = await glue.contracts.snx_pool.methods.starttime().call();

        let waittime = starttime - a["timestamp"];
        if (waittime > 0) {
          await glue.testing.increaseTime(waittime);
        } else {
          console.log("late entry", waittime)
        }

        await glue.contracts.snx.methods.approve(glue.contracts.snx_pool.options.address, -1).send({from: user});

        await glue.contracts.snx_pool.methods.stake(
          snx_bal
        ).send({
          from: user,
          gas: 300000
        });

        let earned = await glue.contracts.snx_pool.methods.earned(user).call();

        let rr = await glue.contracts.snx_pool.methods.rewardRate().call();

        let rpt = await glue.contracts.snx_pool.methods.rewardPerToken().call();
        //console.log(earned, rr, rpt);
        await glue.testing.increaseTime(625000 + 100);
        // await glue.testing.mineBlock();

        earned = await glue.contracts.snx_pool.methods.earned(user).call();

        rpt = await glue.contracts.snx_pool.methods.rewardPerToken().call();

        let ysf = await glue.contracts.glue.methods.gluesScalingFactor().call();

        //console.log(earned, ysf, rpt);


        let glue_bal = await glue.contracts.glue.methods.balanceOf(user).call()

        let j = await glue.contracts.snx_pool.methods.exit().send({
          from: user,
          gas: 300000
        });

        //console.log(j.events)

        let weth_bal = await glue.contracts.snx.methods.balanceOf(user).call()

        expect(weth_bal).toBe(snx_bal)


        let glue_bal2 = await glue.contracts.glue.methods.balanceOf(user).call()

        let two_fity = glue.toBigN(250).times(glue.toBigN(10**3)).times(glue.toBigN(10**18))
        expect(glue.toBigN(glue_bal2).minus(glue.toBigN(glue_bal)).toString()).toBe(two_fity.times(1).toString())
    });
  });
})
