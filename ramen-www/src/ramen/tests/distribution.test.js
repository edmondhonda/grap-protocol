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
    const accounts = await ramen.web3.eth.getAccounts();
    ramen.addAccount(accounts[0]);
    user = accounts[0];
    ramen.addAccount(accounts[1]);
    user2 = accounts[1];
    snapshotId = await ramen.testing.snapshot();
  });

  beforeEach(async () => {
    await ramen.testing.resetEVM("0x2");
  });

  describe("pool failures", () => {
    test("cant join pool 1s early", async () => {
      await ramen.testing.resetEVM("0x2");
      let a = await ramen.web3.eth.getBlock('latest');

      let starttime = await ramen.contracts.eth_pool.methods.starttime().call();

      expect(ramen.toBigN(a["timestamp"]).toNumber()).toBeLessThan(ramen.toBigN(starttime).toNumber());

      //console.log("starttime", a["timestamp"], starttime);
      await ramen.contracts.weth.methods.approve(ramen.contracts.eth_pool.options.address, -1).send({from: user});

      await ramen.testing.expectThrow(
        ramen.contracts.eth_pool.methods.stake(
          ramen.toBigN(200).times(ramen.toBigN(10**18)).toString()
        ).send({
          from: user,
          gas: 300000
        })
      , "not start");


      a = await ramen.web3.eth.getBlock('latest');

      starttime = await ramen.contracts.ampl_pool.methods.starttime().call();

      expect(ramen.toBigN(a["timestamp"]).toNumber()).toBeLessThan(ramen.toBigN(starttime).toNumber());

      //console.log("starttime", a["timestamp"], starttime);

      await ramen.contracts.UNIAmpl.methods.approve(ramen.contracts.ampl_pool.options.address, -1).send({from: user});

      await ramen.testing.expectThrow(ramen.contracts.ampl_pool.methods.stake(
        "5016536322915819"
      ).send({
        from: user,
        gas: 300000
      }), "not start");
    });

    test("cant join pool 2 early", async () => {

    });

    test("cant withdraw more than deposited", async () => {
      await ramen.testing.resetEVM("0x2");
      let a = await ramen.web3.eth.getBlock('latest');

      await ramen.contracts.weth.methods.transfer(user, ramen.toBigN(2000).times(ramen.toBigN(10**18)).toString()).send({
        from: weth_account
      });
      await ramen.contracts.UNIAmpl.methods.transfer(user, "5000000000000000").send({
        from: uni_ampl_account
      });

      let starttime = await ramen.contracts.eth_pool.methods.starttime().call();

      let waittime = starttime - a["timestamp"];
      if (waittime > 0) {
        await ramen.testing.increaseTime(waittime);
      }

      await ramen.contracts.weth.methods.approve(ramen.contracts.eth_pool.options.address, -1).send({from: user});

      await ramen.contracts.eth_pool.methods.stake(
        ramen.toBigN(200).times(ramen.toBigN(10**18)).toString()
      ).send({
        from: user,
        gas: 300000
      });

      await ramen.contracts.UNIAmpl.methods.approve(ramen.contracts.ampl_pool.options.address, -1).send({from: user});

      await ramen.contracts.ampl_pool.methods.stake(
        "5000000000000000"
      ).send({
        from: user,
        gas: 300000
      });

      await ramen.testing.expectThrow(ramen.contracts.ampl_pool.methods.withdraw(
        "5016536322915820"
      ).send({
        from: user,
        gas: 300000
      }), "");

      await ramen.testing.expectThrow(ramen.contracts.eth_pool.methods.withdraw(
        ramen.toBigN(201).times(ramen.toBigN(10**18)).toString()
      ).send({
        from: user,
        gas: 300000
      }), "");

    });
  });

  describe("incentivizer pool", () => {
    test("joining and exiting", async() => {
      await ramen.testing.resetEVM("0x2");

      await ramen.contracts.ycrv.methods.transfer(user, "12000000000000000000000000").send({
        from: ycrv_account
      });

      await ramen.contracts.weth.methods.transfer(user, ramen.toBigN(2000).times(ramen.toBigN(10**18)).toString()).send({
        from: weth_account
      });

      let a = await ramen.web3.eth.getBlock('latest');

      let starttime = await ramen.contracts.eth_pool.methods.starttime().call();

      let waittime = starttime - a["timestamp"];
      if (waittime > 0) {
        await ramen.testing.increaseTime(waittime);
      } else {
        console.log("late entry", waittime)
      }

      await ramen.contracts.weth.methods.approve(ramen.contracts.eth_pool.options.address, -1).send({from: user});

      await ramen.contracts.eth_pool.methods.stake(
        "2000000000000000000000"
      ).send({
        from: user,
        gas: 300000
      });

      let earned = await ramen.contracts.eth_pool.methods.earned(user).call();

      let rr = await ramen.contracts.eth_pool.methods.rewardRate().call();

      let rpt = await ramen.contracts.eth_pool.methods.rewardPerToken().call();
      //console.log(earned, rr, rpt);
      await ramen.testing.increaseTime(86400);
      // await ramen.testing.mineBlock();

      earned = await ramen.contracts.eth_pool.methods.earned(user).call();

      rpt = await ramen.contracts.eth_pool.methods.rewardPerToken().call();

      let ysf = await ramen.contracts.ramen.methods.ramensScalingFactor().call();

      console.log(earned, ysf, rpt);

      let j = await ramen.contracts.eth_pool.methods.getReward().send({
        from: user,
        gas: 300000
      });

      let ramen_bal = await ramen.contracts.ramen.methods.balanceOf(user).call()

      console.log("ramen bal", ramen_bal)
      // start rebasing
        //console.log("approve ramen")
        await ramen.contracts.ramen.methods.approve(
          ramen.contracts.uni_router.options.address,
          -1
        ).send({
          from: user,
          gas: 80000
        });
        //console.log("approve ycrv")
        await ramen.contracts.ycrv.methods.approve(
          ramen.contracts.uni_router.options.address,
          -1
        ).send({
          from: user,
          gas: 80000
        });

        let ycrv_bal = await ramen.contracts.ycrv.methods.balanceOf(user).call()

        console.log("ycrv_bal bal", ycrv_bal)

        console.log("add liq/ create pool")
        await ramen.contracts.uni_router.methods.addLiquidity(
          ramen.contracts.ramen.options.address,
          ramen.contracts.ycrv.options.address,
          ramen_bal,
          ramen_bal,
          ramen_bal,
          ramen_bal,
          user,
          1596740361 + 10000000
        ).send({
          from: user,
          gas: 8000000
        });

        let pair = await ramen.contracts.uni_fact.methods.getPair(
          ramen.contracts.ramen.options.address,
          ramen.contracts.ycrv.options.address
        ).call();

        ramen.contracts.uni_pair.options.address = pair;
        let bal = await ramen.contracts.uni_pair.methods.balanceOf(user).call();

        await ramen.contracts.uni_pair.methods.approve(
          ramen.contracts.ycrv_pool.options.address,
          -1
        ).send({
          from: user,
          gas: 300000
        });

        starttime = await ramen.contracts.ycrv_pool.methods.starttime().call();

        a = await ramen.web3.eth.getBlock('latest');

        waittime = starttime - a["timestamp"];
        if (waittime > 0) {
          await ramen.testing.increaseTime(waittime);
        } else {
          console.log("late entry, pool 2", waittime)
        }

        await ramen.contracts.ycrv_pool.methods.stake(bal).send({from: user, gas: 400000});


        earned = await ramen.contracts.ampl_pool.methods.earned(user).call();

        rr = await ramen.contracts.ampl_pool.methods.rewardRate().call();

        rpt = await ramen.contracts.ampl_pool.methods.rewardPerToken().call();

        console.log(earned, rr, rpt);

        await ramen.testing.increaseTime(625000 + 1000);

        earned = await ramen.contracts.ampl_pool.methods.earned(user).call();

        rr = await ramen.contracts.ampl_pool.methods.rewardRate().call();

        rpt = await ramen.contracts.ampl_pool.methods.rewardPerToken().call();

        console.log(earned, rr, rpt);

        await ramen.contracts.ycrv_pool.methods.exit().send({from: user, gas: 400000});

        ramen_bal = await ramen.contracts.ramen.methods.balanceOf(user).call();


        expect(ramen.toBigN(ramen_bal).toNumber()).toBeGreaterThan(0)
        console.log("ramen bal after staking in pool 2", ramen_bal);
    });
  });

  describe("ampl", () => {
    test("rewards from pool 1s ampl", async () => {
        await ramen.testing.resetEVM("0x2");

        await ramen.contracts.UNIAmpl.methods.transfer(user, "5000000000000000").send({
          from: uni_ampl_account
        });
        let a = await ramen.web3.eth.getBlock('latest');

        let starttime = await ramen.contracts.eth_pool.methods.starttime().call();

        let waittime = starttime - a["timestamp"];
        if (waittime > 0) {
          await ramen.testing.increaseTime(waittime);
        } else {
          //console.log("missed entry");
        }

        await ramen.contracts.UNIAmpl.methods.approve(ramen.contracts.ampl_pool.options.address, -1).send({from: user});

        await ramen.contracts.ampl_pool.methods.stake(
          "5000000000000000"
        ).send({
          from: user,
          gas: 300000
        });

        let earned = await ramen.contracts.ampl_pool.methods.earned(user).call();

        let rr = await ramen.contracts.ampl_pool.methods.rewardRate().call();

        let rpt = await ramen.contracts.ampl_pool.methods.rewardPerToken().call();
        //console.log(earned, rr, rpt);
        await ramen.testing.increaseTime(625000 + 100);
        // await ramen.testing.mineBlock();

        earned = await ramen.contracts.ampl_pool.methods.earned(user).call();

        rpt = await ramen.contracts.ampl_pool.methods.rewardPerToken().call();

        let ysf = await ramen.contracts.ramen.methods.ramensScalingFactor().call();

        //console.log(earned, ysf, rpt);


        let ramen_bal = await ramen.contracts.ramen.methods.balanceOf(user).call()

        let j = await ramen.contracts.ampl_pool.methods.exit().send({
          from: user,
          gas: 300000
        });

        //console.log(j.events)

        // let k = await ramen.contracts.eth_pool.methods.exit().send({
        //   from: user,
        //   gas: 300000
        // });
        //
        // //console.log(k.events)

        // weth_bal = await ramen.contracts.weth.methods.balanceOf(user).call()

        // expect(weth_bal).toBe(ramen.toBigN(2000).times(ramen.toBigN(10**18)).toString())

        let ampl_bal = await ramen.contracts.UNIAmpl.methods.balanceOf(user).call()

        expect(ampl_bal).toBe("5000000000000000")


        let ramen_bal2 = await ramen.contracts.ramen.methods.balanceOf(user).call()

        let two_fity = ramen.toBigN(250).times(ramen.toBigN(10**3)).times(ramen.toBigN(10**18))
        expect(ramen.toBigN(ramen_bal2).minus(ramen.toBigN(ramen_bal)).toString()).toBe(two_fity.times(1).toString())
    });
  });

  describe("eth", () => {
    test("rewards from pool 1s eth", async () => {
        await ramen.testing.resetEVM("0x2");

        await ramen.contracts.weth.methods.transfer(user, ramen.toBigN(2000).times(ramen.toBigN(10**18)).toString()).send({
          from: weth_account
        });

        let a = await ramen.web3.eth.getBlock('latest');

        let starttime = await ramen.contracts.eth_pool.methods.starttime().call();

        let waittime = starttime - a["timestamp"];
        if (waittime > 0) {
          await ramen.testing.increaseTime(waittime);
        } else {
          console.log("late entry", waittime)
        }

        await ramen.contracts.weth.methods.approve(ramen.contracts.eth_pool.options.address, -1).send({from: user});

        await ramen.contracts.eth_pool.methods.stake(
          "2000000000000000000000"
        ).send({
          from: user,
          gas: 300000
        });

        let earned = await ramen.contracts.eth_pool.methods.earned(user).call();

        let rr = await ramen.contracts.eth_pool.methods.rewardRate().call();

        let rpt = await ramen.contracts.eth_pool.methods.rewardPerToken().call();
        //console.log(earned, rr, rpt);
        await ramen.testing.increaseTime(625000 + 100);
        // await ramen.testing.mineBlock();

        earned = await ramen.contracts.eth_pool.methods.earned(user).call();

        rpt = await ramen.contracts.eth_pool.methods.rewardPerToken().call();

        let ysf = await ramen.contracts.ramen.methods.ramensScalingFactor().call();

        //console.log(earned, ysf, rpt);


        let ramen_bal = await ramen.contracts.ramen.methods.balanceOf(user).call()

        let j = await ramen.contracts.eth_pool.methods.exit().send({
          from: user,
          gas: 300000
        });

        //console.log(j.events)

        let weth_bal = await ramen.contracts.weth.methods.balanceOf(user).call()

        expect(weth_bal).toBe("2000000000000000000000")


        let ramen_bal2 = await ramen.contracts.ramen.methods.balanceOf(user).call()

        let two_fity = ramen.toBigN(250).times(ramen.toBigN(10**3)).times(ramen.toBigN(10**18))
        expect(ramen.toBigN(ramen_bal2).minus(ramen.toBigN(ramen_bal)).toString()).toBe(two_fity.times(1).toString())
    });
    test("rewards from pool 1s eth with rebase", async () => {
        await ramen.testing.resetEVM("0x2");

        await ramen.contracts.ycrv.methods.transfer(user, "12000000000000000000000000").send({
          from: ycrv_account
        });

        await ramen.contracts.weth.methods.transfer(user, ramen.toBigN(2000).times(ramen.toBigN(10**18)).toString()).send({
          from: weth_account
        });

        let a = await ramen.web3.eth.getBlock('latest');

        let starttime = await ramen.contracts.eth_pool.methods.starttime().call();

        let waittime = starttime - a["timestamp"];
        if (waittime > 0) {
          await ramen.testing.increaseTime(waittime);
        } else {
          console.log("late entry", waittime)
        }

        await ramen.contracts.weth.methods.approve(ramen.contracts.eth_pool.options.address, -1).send({from: user});

        await ramen.contracts.eth_pool.methods.stake(
          "2000000000000000000000"
        ).send({
          from: user,
          gas: 300000
        });

        let earned = await ramen.contracts.eth_pool.methods.earned(user).call();

        let rr = await ramen.contracts.eth_pool.methods.rewardRate().call();

        let rpt = await ramen.contracts.eth_pool.methods.rewardPerToken().call();
        //console.log(earned, rr, rpt);
        await ramen.testing.increaseTime(125000 + 100);
        // await ramen.testing.mineBlock();

        earned = await ramen.contracts.eth_pool.methods.earned(user).call();

        rpt = await ramen.contracts.eth_pool.methods.rewardPerToken().call();

        let ysf = await ramen.contracts.ramen.methods.ramensScalingFactor().call();

        //console.log(earned, ysf, rpt);




        let j = await ramen.contracts.eth_pool.methods.getReward().send({
          from: user,
          gas: 300000
        });

        let ramen_bal = await ramen.contracts.ramen.methods.balanceOf(user).call()

        console.log("ramen bal", ramen_bal)
        // start rebasing
          //console.log("approve ramen")
          await ramen.contracts.ramen.methods.approve(
            ramen.contracts.uni_router.options.address,
            -1
          ).send({
            from: user,
            gas: 80000
          });
          //console.log("approve ycrv")
          await ramen.contracts.ycrv.methods.approve(
            ramen.contracts.uni_router.options.address,
            -1
          ).send({
            from: user,
            gas: 80000
          });

          let ycrv_bal = await ramen.contracts.ycrv.methods.balanceOf(user).call()

          console.log("ycrv_bal bal", ycrv_bal)

          console.log("add liq/ create pool")
          await ramen.contracts.uni_router.methods.addLiquidity(
            ramen.contracts.ramen.options.address,
            ramen.contracts.ycrv.options.address,
            ramen_bal,
            ramen_bal,
            ramen_bal,
            ramen_bal,
            user,
            1596740361 + 10000000
          ).send({
            from: user,
            gas: 8000000
          });

          let pair = await ramen.contracts.uni_fact.methods.getPair(
            ramen.contracts.ramen.options.address,
            ramen.contracts.ycrv.options.address
          ).call();

          ramen.contracts.uni_pair.options.address = pair;
          let bal = await ramen.contracts.uni_pair.methods.balanceOf(user).call();

          // make a trade to get init values in uniswap
          //console.log("init swap")
          await ramen.contracts.uni_router.methods.swapExactTokensForTokens(
            "100000000000000000000000",
            100000,
            [
              ramen.contracts.ycrv.options.address,
              ramen.contracts.ramen.options.address
            ],
            user,
            1596740361 + 10000000
          ).send({
            from: user,
            gas: 1000000
          });

          // trade back for easier calcs later
          //console.log("swap 0")
          await ramen.contracts.uni_router.methods.swapExactTokensForTokens(
            "10000000000000000",
            100000,
            [
              ramen.contracts.ycrv.options.address,
              ramen.contracts.ramen.options.address
            ],
            user,
            1596740361 + 10000000
          ).send({
            from: user,
            gas: 1000000
          });

          await ramen.testing.increaseTime(43200);

          //console.log("init twap")
          await ramen.contracts.rebaser.methods.init_twap().send({
            from: user,
            gas: 500000
          });

          //console.log("first swap")
          await ramen.contracts.uni_router.methods.swapExactTokensForTokens(
            "1000000000000000000000",
            100000,
            [
              ramen.contracts.ycrv.options.address,
              ramen.contracts.ramen.options.address
            ],
            user,
            1596740361 + 10000000
          ).send({
            from: user,
            gas: 1000000
          });

          // init twap
          let init_twap = await ramen.contracts.rebaser.methods.timeOfTWAPInit().call();

          // wait 12 hours
          await ramen.testing.increaseTime(12 * 60 * 60);

          // perform trade to change price
          //console.log("second swap")
          await ramen.contracts.uni_router.methods.swapExactTokensForTokens(
            "10000000000000000000",
            100000,
            [
              ramen.contracts.ycrv.options.address,
              ramen.contracts.ramen.options.address
            ],
            user,
            1596740361 + 10000000
          ).send({
            from: user,
            gas: 1000000
          });

          // activate rebasing
          await ramen.contracts.rebaser.methods.activate_rebasing().send({
            from: user,
            gas: 500000
          });


          bal = await ramen.contracts.ramen.methods.balanceOf(user).call();

          a = await ramen.web3.eth.getBlock('latest');

          let offset = await ramen.contracts.rebaser.methods.rebaseWindowOffsetSec().call();
          offset = ramen.toBigN(offset).toNumber();
          let interval = await ramen.contracts.rebaser.methods.minRebaseTimeIntervalSec().call();
          interval = ramen.toBigN(interval).toNumber();

          let i;
          if (a["timestamp"] % interval > offset) {
            i = (interval - (a["timestamp"] % interval)) + offset;
          } else {
            i = offset - (a["timestamp"] % interval);
          }

          await ramen.testing.increaseTime(i);

          let r = await ramen.contracts.uni_pair.methods.getReserves().call();
          let q = await ramen.contracts.uni_router.methods.quote(ramen.toBigN(10**18).toString(), r[0], r[1]).call();
          console.log("quote pre positive rebase", q);

          let b = await ramen.contracts.rebaser.methods.rebase().send({
            from: user,
            gas: 2500000
          });

          let bal1 = await ramen.contracts.ramen.methods.balanceOf(user).call();

          let resRAMEN = await ramen.contracts.ramen.methods.balanceOf(ramen.contracts.reserves.options.address).call();

          let resycrv = await ramen.contracts.ycrv.methods.balanceOf(ramen.contracts.reserves.options.address).call();

          // new balance > old balance
          expect(ramen.toBigN(bal).toNumber()).toBeLessThan(ramen.toBigN(bal1).toNumber());
          // increases reserves
          expect(ramen.toBigN(resycrv).toNumber()).toBeGreaterThan(0);

          r = await ramen.contracts.uni_pair.methods.getReserves().call();
          q = await ramen.contracts.uni_router.methods.quote(ramen.toBigN(10**18).toString(), r[0], r[1]).call();
          console.log("quote", q);
          // not below peg
          expect(ramen.toBigN(q).toNumber()).toBeGreaterThan(ramen.toBigN(10**18).toNumber());


        await ramen.testing.increaseTime(525000 + 100);


        j = await ramen.contracts.eth_pool.methods.exit().send({
          from: user,
          gas: 300000
        });
        //console.log(j.events)

        let weth_bal = await ramen.contracts.weth.methods.balanceOf(user).call()

        expect(weth_bal).toBe("2000000000000000000000")


        let ramen_bal2 = await ramen.contracts.ramen.methods.balanceOf(user).call()

        let two_fity = ramen.toBigN(250).times(ramen.toBigN(10**3)).times(ramen.toBigN(10**18))
        expect(
          ramen.toBigN(ramen_bal2).minus(ramen.toBigN(ramen_bal)).toNumber()
        ).toBeGreaterThan(two_fity.toNumber())
    });
    test("rewards from pool 1s eth with negative rebase", async () => {
        await ramen.testing.resetEVM("0x2");

        await ramen.contracts.ycrv.methods.transfer(user, "12000000000000000000000000").send({
          from: ycrv_account
        });

        await ramen.contracts.weth.methods.transfer(user, ramen.toBigN(2000).times(ramen.toBigN(10**18)).toString()).send({
          from: weth_account
        });

        let a = await ramen.web3.eth.getBlock('latest');

        let starttime = await ramen.contracts.eth_pool.methods.starttime().call();

        let waittime = starttime - a["timestamp"];
        if (waittime > 0) {
          await ramen.testing.increaseTime(waittime);
        } else {
          console.log("late entry", waittime)
        }

        await ramen.contracts.weth.methods.approve(ramen.contracts.eth_pool.options.address, -1).send({from: user});

        await ramen.contracts.eth_pool.methods.stake(
          "2000000000000000000000"
        ).send({
          from: user,
          gas: 300000
        });

        let earned = await ramen.contracts.eth_pool.methods.earned(user).call();

        let rr = await ramen.contracts.eth_pool.methods.rewardRate().call();

        let rpt = await ramen.contracts.eth_pool.methods.rewardPerToken().call();
        //console.log(earned, rr, rpt);
        await ramen.testing.increaseTime(125000 + 100);
        // await ramen.testing.mineBlock();

        earned = await ramen.contracts.eth_pool.methods.earned(user).call();

        rpt = await ramen.contracts.eth_pool.methods.rewardPerToken().call();

        let ysf = await ramen.contracts.ramen.methods.ramensScalingFactor().call();

        //console.log(earned, ysf, rpt);




        let j = await ramen.contracts.eth_pool.methods.getReward().send({
          from: user,
          gas: 300000
        });

        let ramen_bal = await ramen.contracts.ramen.methods.balanceOf(user).call()

        console.log("ramen bal", ramen_bal)
        // start rebasing
          //console.log("approve ramen")
          await ramen.contracts.ramen.methods.approve(
            ramen.contracts.uni_router.options.address,
            -1
          ).send({
            from: user,
            gas: 80000
          });
          //console.log("approve ycrv")
          await ramen.contracts.ycrv.methods.approve(
            ramen.contracts.uni_router.options.address,
            -1
          ).send({
            from: user,
            gas: 80000
          });

          let ycrv_bal = await ramen.contracts.ycrv.methods.balanceOf(user).call()

          console.log("ycrv_bal bal", ycrv_bal)

          ramen_bal = ramen.toBigN(ramen_bal);
          console.log("add liq/ create pool")
          await ramen.contracts.uni_router.methods.addLiquidity(
            ramen.contracts.ramen.options.address,
            ramen.contracts.ycrv.options.address,
            ramen_bal.times(.1).toString(),
            ramen_bal.times(.1).toString(),
            ramen_bal.times(.1).toString(),
            ramen_bal.times(.1).toString(),
            user,
            1596740361 + 10000000
          ).send({
            from: user,
            gas: 8000000
          });

          let pair = await ramen.contracts.uni_fact.methods.getPair(
            ramen.contracts.ramen.options.address,
            ramen.contracts.ycrv.options.address
          ).call();

          ramen.contracts.uni_pair.options.address = pair;
          let bal = await ramen.contracts.uni_pair.methods.balanceOf(user).call();

          // make a trade to get init values in uniswap
          //console.log("init swap")
          await ramen.contracts.uni_router.methods.swapExactTokensForTokens(
            "1000000000000000000000",
            100000,
            [
              ramen.contracts.ramen.options.address,
              ramen.contracts.ycrv.options.address
            ],
            user,
            1596740361 + 10000000
          ).send({
            from: user,
            gas: 1000000
          });

          // trade back for easier calcs later
          //console.log("swap 0")
          await ramen.contracts.uni_router.methods.swapExactTokensForTokens(
            "100000000000000",
            100000,
            [
              ramen.contracts.ramen.options.address,
              ramen.contracts.ycrv.options.address
            ],
            user,
            1596740361 + 10000000
          ).send({
            from: user,
            gas: 1000000
          });

          await ramen.testing.increaseTime(43200);

          //console.log("init twap")
          await ramen.contracts.rebaser.methods.init_twap().send({
            from: user,
            gas: 500000
          });

          //console.log("first swap")
          await ramen.contracts.uni_router.methods.swapExactTokensForTokens(
            "100000000000000",
            100000,
            [
              ramen.contracts.ramen.options.address,
              ramen.contracts.ycrv.options.address
            ],
            user,
            1596740361 + 10000000
          ).send({
            from: user,
            gas: 1000000
          });

          // init twap
          let init_twap = await ramen.contracts.rebaser.methods.timeOfTWAPInit().call();

          // wait 12 hours
          await ramen.testing.increaseTime(12 * 60 * 60);

          // perform trade to change price
          //console.log("second swap")
          await ramen.contracts.uni_router.methods.swapExactTokensForTokens(
            "1000000000000000000",
            100000,
            [
              ramen.contracts.ramen.options.address,
              ramen.contracts.ycrv.options.address
            ],
            user,
            1596740361 + 10000000
          ).send({
            from: user,
            gas: 1000000
          });

          // activate rebasing
          await ramen.contracts.rebaser.methods.activate_rebasing().send({
            from: user,
            gas: 500000
          });


          bal = await ramen.contracts.ramen.methods.balanceOf(user).call();

          a = await ramen.web3.eth.getBlock('latest');

          let offset = await ramen.contracts.rebaser.methods.rebaseWindowOffsetSec().call();
          offset = ramen.toBigN(offset).toNumber();
          let interval = await ramen.contracts.rebaser.methods.minRebaseTimeIntervalSec().call();
          interval = ramen.toBigN(interval).toNumber();

          let i;
          if (a["timestamp"] % interval > offset) {
            i = (interval - (a["timestamp"] % interval)) + offset;
          } else {
            i = offset - (a["timestamp"] % interval);
          }

          await ramen.testing.increaseTime(i);

          let r = await ramen.contracts.uni_pair.methods.getReserves().call();
          let q = await ramen.contracts.uni_router.methods.quote(ramen.toBigN(10**18).toString(), r[0], r[1]).call();
          console.log("quote pre positive rebase", q);

          let b = await ramen.contracts.rebaser.methods.rebase().send({
            from: user,
            gas: 2500000
          });

          let bal1 = await ramen.contracts.ramen.methods.balanceOf(user).call();

          let resRAMEN = await ramen.contracts.ramen.methods.balanceOf(ramen.contracts.reserves.options.address).call();

          let resycrv = await ramen.contracts.ycrv.methods.balanceOf(ramen.contracts.reserves.options.address).call();

          expect(ramen.toBigN(bal1).toNumber()).toBeLessThan(ramen.toBigN(bal).toNumber());
          expect(ramen.toBigN(resycrv).toNumber()).toBe(0);

          r = await ramen.contracts.uni_pair.methods.getReserves().call();
          q = await ramen.contracts.uni_router.methods.quote(ramen.toBigN(10**18).toString(), r[0], r[1]).call();
          console.log("quote", q);
          // not below peg
          expect(ramen.toBigN(q).toNumber()).toBeLessThan(ramen.toBigN(10**18).toNumber());


        await ramen.testing.increaseTime(525000 + 100);


        j = await ramen.contracts.eth_pool.methods.exit().send({
          from: user,
          gas: 300000
        });
        //console.log(j.events)

        let weth_bal = await ramen.contracts.weth.methods.balanceOf(user).call()

        expect(weth_bal).toBe("2000000000000000000000")


        let ramen_bal2 = await ramen.contracts.ramen.methods.balanceOf(user).call()

        let two_fity = ramen.toBigN(250).times(ramen.toBigN(10**3)).times(ramen.toBigN(10**18))
        expect(
          ramen.toBigN(ramen_bal2).minus(ramen.toBigN(ramen_bal)).toNumber()
        ).toBeLessThan(two_fity.toNumber())
    });
  });

  describe("yfi", () => {
    test("rewards from pool 1s yfi", async () => {
        await ramen.testing.resetEVM("0x2");
        await ramen.contracts.yfi.methods.transfer(user, "500000000000000000000").send({
          from: yfi_account
        });

        let a = await ramen.web3.eth.getBlock('latest');

        let starttime = await ramen.contracts.yfi_pool.methods.starttime().call();

        let waittime = starttime - a["timestamp"];
        if (waittime > 0) {
          await ramen.testing.increaseTime(waittime);
        } else {
          console.log("late entry", waittime)
        }

        await ramen.contracts.yfi.methods.approve(ramen.contracts.yfi_pool.options.address, -1).send({from: user});

        await ramen.contracts.yfi_pool.methods.stake(
          "500000000000000000000"
        ).send({
          from: user,
          gas: 300000
        });

        let earned = await ramen.contracts.yfi_pool.methods.earned(user).call();

        let rr = await ramen.contracts.yfi_pool.methods.rewardRate().call();

        let rpt = await ramen.contracts.yfi_pool.methods.rewardPerToken().call();
        //console.log(earned, rr, rpt);
        await ramen.testing.increaseTime(625000 + 100);
        // await ramen.testing.mineBlock();

        earned = await ramen.contracts.yfi_pool.methods.earned(user).call();

        rpt = await ramen.contracts.yfi_pool.methods.rewardPerToken().call();

        let ysf = await ramen.contracts.ramen.methods.ramensScalingFactor().call();

        //console.log(earned, ysf, rpt);


        let ramen_bal = await ramen.contracts.ramen.methods.balanceOf(user).call()

        let j = await ramen.contracts.yfi_pool.methods.exit().send({
          from: user,
          gas: 300000
        });

        //console.log(j.events)

        let weth_bal = await ramen.contracts.yfi.methods.balanceOf(user).call()

        expect(weth_bal).toBe("500000000000000000000")


        let ramen_bal2 = await ramen.contracts.ramen.methods.balanceOf(user).call()

        let two_fity = ramen.toBigN(250).times(ramen.toBigN(10**3)).times(ramen.toBigN(10**18))
        expect(ramen.toBigN(ramen_bal2).minus(ramen.toBigN(ramen_bal)).toString()).toBe(two_fity.times(1).toString())
    });
  });

  describe("comp", () => {
    test("rewards from pool 1s comp", async () => {
        await ramen.testing.resetEVM("0x2");
        await ramen.contracts.comp.methods.transfer(user, "50000000000000000000000").send({
          from: comp_account
        });

        let a = await ramen.web3.eth.getBlock('latest');

        let starttime = await ramen.contracts.comp_pool.methods.starttime().call();

        let waittime = starttime - a["timestamp"];
        if (waittime > 0) {
          await ramen.testing.increaseTime(waittime);
        } else {
          console.log("late entry", waittime)
        }

        await ramen.contracts.comp.methods.approve(ramen.contracts.comp_pool.options.address, -1).send({from: user});

        await ramen.contracts.comp_pool.methods.stake(
          "50000000000000000000000"
        ).send({
          from: user,
          gas: 300000
        });

        let earned = await ramen.contracts.comp_pool.methods.earned(user).call();

        let rr = await ramen.contracts.comp_pool.methods.rewardRate().call();

        let rpt = await ramen.contracts.comp_pool.methods.rewardPerToken().call();
        //console.log(earned, rr, rpt);
        await ramen.testing.increaseTime(625000 + 100);
        // await ramen.testing.mineBlock();

        earned = await ramen.contracts.comp_pool.methods.earned(user).call();

        rpt = await ramen.contracts.comp_pool.methods.rewardPerToken().call();

        let ysf = await ramen.contracts.ramen.methods.ramensScalingFactor().call();

        //console.log(earned, ysf, rpt);


        let ramen_bal = await ramen.contracts.ramen.methods.balanceOf(user).call()

        let j = await ramen.contracts.comp_pool.methods.exit().send({
          from: user,
          gas: 300000
        });

        //console.log(j.events)

        let weth_bal = await ramen.contracts.comp.methods.balanceOf(user).call()

        expect(weth_bal).toBe("50000000000000000000000")


        let ramen_bal2 = await ramen.contracts.ramen.methods.balanceOf(user).call()

        let two_fity = ramen.toBigN(250).times(ramen.toBigN(10**3)).times(ramen.toBigN(10**18))
        expect(ramen.toBigN(ramen_bal2).minus(ramen.toBigN(ramen_bal)).toString()).toBe(two_fity.times(1).toString())
    });
  });

  describe("lend", () => {
    test("rewards from pool 1s lend", async () => {
        await ramen.testing.resetEVM("0x2");
        await ramen.web3.eth.sendTransaction({from: user2, to: lend_account, value : ramen.toBigN(100000*10**18).toString()});

        await ramen.contracts.lend.methods.transfer(user, "10000000000000000000000000").send({
          from: lend_account
        });

        let a = await ramen.web3.eth.getBlock('latest');

        let starttime = await ramen.contracts.lend_pool.methods.starttime().call();

        let waittime = starttime - a["timestamp"];
        if (waittime > 0) {
          await ramen.testing.increaseTime(waittime);
        } else {
          console.log("late entry", waittime)
        }

        await ramen.contracts.lend.methods.approve(ramen.contracts.lend_pool.options.address, -1).send({from: user});

        await ramen.contracts.lend_pool.methods.stake(
          "10000000000000000000000000"
        ).send({
          from: user,
          gas: 300000
        });

        let earned = await ramen.contracts.lend_pool.methods.earned(user).call();

        let rr = await ramen.contracts.lend_pool.methods.rewardRate().call();

        let rpt = await ramen.contracts.lend_pool.methods.rewardPerToken().call();
        //console.log(earned, rr, rpt);
        await ramen.testing.increaseTime(625000 + 100);
        // await ramen.testing.mineBlock();

        earned = await ramen.contracts.lend_pool.methods.earned(user).call();

        rpt = await ramen.contracts.lend_pool.methods.rewardPerToken().call();

        let ysf = await ramen.contracts.ramen.methods.ramensScalingFactor().call();

        //console.log(earned, ysf, rpt);


        let ramen_bal = await ramen.contracts.ramen.methods.balanceOf(user).call()

        let j = await ramen.contracts.lend_pool.methods.exit().send({
          from: user,
          gas: 300000
        });

        //console.log(j.events)

        let weth_bal = await ramen.contracts.lend.methods.balanceOf(user).call()

        expect(weth_bal).toBe("10000000000000000000000000")


        let ramen_bal2 = await ramen.contracts.ramen.methods.balanceOf(user).call()

        let two_fity = ramen.toBigN(250).times(ramen.toBigN(10**3)).times(ramen.toBigN(10**18))
        expect(ramen.toBigN(ramen_bal2).minus(ramen.toBigN(ramen_bal)).toString()).toBe(two_fity.times(1).toString())
    });
  });

  describe("link", () => {
    test("rewards from pool 1s link", async () => {
        await ramen.testing.resetEVM("0x2");

        await ramen.web3.eth.sendTransaction({from: user2, to: link_account, value : ramen.toBigN(100000*10**18).toString()});

        await ramen.contracts.link.methods.transfer(user, "10000000000000000000000000").send({
          from: link_account
        });

        let a = await ramen.web3.eth.getBlock('latest');

        let starttime = await ramen.contracts.link_pool.methods.starttime().call();

        let waittime = starttime - a["timestamp"];
        if (waittime > 0) {
          await ramen.testing.increaseTime(waittime);
        } else {
          console.log("late entry", waittime)
        }

        await ramen.contracts.link.methods.approve(ramen.contracts.link_pool.options.address, -1).send({from: user});

        await ramen.contracts.link_pool.methods.stake(
          "10000000000000000000000000"
        ).send({
          from: user,
          gas: 300000
        });

        let earned = await ramen.contracts.link_pool.methods.earned(user).call();

        let rr = await ramen.contracts.link_pool.methods.rewardRate().call();

        let rpt = await ramen.contracts.link_pool.methods.rewardPerToken().call();
        //console.log(earned, rr, rpt);
        await ramen.testing.increaseTime(625000 + 100);
        // await ramen.testing.mineBlock();

        earned = await ramen.contracts.link_pool.methods.earned(user).call();

        rpt = await ramen.contracts.link_pool.methods.rewardPerToken().call();

        let ysf = await ramen.contracts.ramen.methods.ramensScalingFactor().call();

        //console.log(earned, ysf, rpt);


        let ramen_bal = await ramen.contracts.ramen.methods.balanceOf(user).call()

        let j = await ramen.contracts.link_pool.methods.exit().send({
          from: user,
          gas: 300000
        });

        //console.log(j.events)

        let weth_bal = await ramen.contracts.link.methods.balanceOf(user).call()

        expect(weth_bal).toBe("10000000000000000000000000")


        let ramen_bal2 = await ramen.contracts.ramen.methods.balanceOf(user).call()

        let two_fity = ramen.toBigN(250).times(ramen.toBigN(10**3)).times(ramen.toBigN(10**18))
        expect(ramen.toBigN(ramen_bal2).minus(ramen.toBigN(ramen_bal)).toString()).toBe(two_fity.times(1).toString())
    });
  });

  describe("mkr", () => {
    test("rewards from pool 1s mkr", async () => {
        await ramen.testing.resetEVM("0x2");
        await ramen.web3.eth.sendTransaction({from: user2, to: mkr_account, value : ramen.toBigN(100000*10**18).toString()});
        let eth_bal = await ramen.web3.eth.getBalance(mkr_account);

        await ramen.contracts.mkr.methods.transfer(user, "10000000000000000000000").send({
          from: mkr_account
        });

        let a = await ramen.web3.eth.getBlock('latest');

        let starttime = await ramen.contracts.mkr_pool.methods.starttime().call();

        let waittime = starttime - a["timestamp"];
        if (waittime > 0) {
          await ramen.testing.increaseTime(waittime);
        } else {
          console.log("late entry", waittime)
        }

        await ramen.contracts.mkr.methods.approve(ramen.contracts.mkr_pool.options.address, -1).send({from: user});

        await ramen.contracts.mkr_pool.methods.stake(
          "10000000000000000000000"
        ).send({
          from: user,
          gas: 300000
        });

        let earned = await ramen.contracts.mkr_pool.methods.earned(user).call();

        let rr = await ramen.contracts.mkr_pool.methods.rewardRate().call();

        let rpt = await ramen.contracts.mkr_pool.methods.rewardPerToken().call();
        //console.log(earned, rr, rpt);
        await ramen.testing.increaseTime(625000 + 100);
        // await ramen.testing.mineBlock();

        earned = await ramen.contracts.mkr_pool.methods.earned(user).call();

        rpt = await ramen.contracts.mkr_pool.methods.rewardPerToken().call();

        let ysf = await ramen.contracts.ramen.methods.ramensScalingFactor().call();

        //console.log(earned, ysf, rpt);


        let ramen_bal = await ramen.contracts.ramen.methods.balanceOf(user).call()

        let j = await ramen.contracts.mkr_pool.methods.exit().send({
          from: user,
          gas: 300000
        });

        //console.log(j.events)

        let weth_bal = await ramen.contracts.mkr.methods.balanceOf(user).call()

        expect(weth_bal).toBe("10000000000000000000000")


        let ramen_bal2 = await ramen.contracts.ramen.methods.balanceOf(user).call()

        let two_fity = ramen.toBigN(250).times(ramen.toBigN(10**3)).times(ramen.toBigN(10**18))
        expect(ramen.toBigN(ramen_bal2).minus(ramen.toBigN(ramen_bal)).toString()).toBe(two_fity.times(1).toString())
    });
  });

  describe("snx", () => {
    test("rewards from pool 1s snx", async () => {
        await ramen.testing.resetEVM("0x2");

        await ramen.web3.eth.sendTransaction({from: user2, to: snx_account, value : ramen.toBigN(100000*10**18).toString()});

        let snx_bal = await ramen.contracts.snx.methods.balanceOf(snx_account).call();

        console.log(snx_bal)

        await ramen.contracts.snx.methods.transfer(user, snx_bal).send({
          from: snx_account
        });

        snx_bal = await ramen.contracts.snx.methods.balanceOf(user).call();

        console.log(snx_bal)

        let a = await ramen.web3.eth.getBlock('latest');

        let starttime = await ramen.contracts.snx_pool.methods.starttime().call();

        let waittime = starttime - a["timestamp"];
        if (waittime > 0) {
          await ramen.testing.increaseTime(waittime);
        } else {
          console.log("late entry", waittime)
        }

        await ramen.contracts.snx.methods.approve(ramen.contracts.snx_pool.options.address, -1).send({from: user});

        await ramen.contracts.snx_pool.methods.stake(
          snx_bal
        ).send({
          from: user,
          gas: 300000
        });

        let earned = await ramen.contracts.snx_pool.methods.earned(user).call();

        let rr = await ramen.contracts.snx_pool.methods.rewardRate().call();

        let rpt = await ramen.contracts.snx_pool.methods.rewardPerToken().call();
        //console.log(earned, rr, rpt);
        await ramen.testing.increaseTime(625000 + 100);
        // await ramen.testing.mineBlock();

        earned = await ramen.contracts.snx_pool.methods.earned(user).call();

        rpt = await ramen.contracts.snx_pool.methods.rewardPerToken().call();

        let ysf = await ramen.contracts.ramen.methods.ramensScalingFactor().call();

        //console.log(earned, ysf, rpt);


        let ramen_bal = await ramen.contracts.ramen.methods.balanceOf(user).call()

        let j = await ramen.contracts.snx_pool.methods.exit().send({
          from: user,
          gas: 300000
        });

        //console.log(j.events)

        let weth_bal = await ramen.contracts.snx.methods.balanceOf(user).call()

        expect(weth_bal).toBe(snx_bal)


        let ramen_bal2 = await ramen.contracts.ramen.methods.balanceOf(user).call()

        let two_fity = ramen.toBigN(250).times(ramen.toBigN(10**3)).times(ramen.toBigN(10**18))
        expect(ramen.toBigN(ramen_bal2).minus(ramen.toBigN(ramen_bal)).toString()).toBe(two_fity.times(1).toString())
    });
  });
})
