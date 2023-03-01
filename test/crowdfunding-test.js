// SPDX-License-Identifier: MIT
const Crowdfunding = artifacts.require("Crowdfunding");
const Token = artifacts.require("Token");

contract("Crowdfunding", accounts => {
  let crowdfunding, token;
  
  beforeEach(async () => {
    token = await Token.new();
    crowdfunding = await Crowdfunding.new();
    await crowdfunding.initialize(token.address, 100);
  });

  it("should pledge funds", async() => {
    const amount = 50;
    await token.approve(crowdfunding.address, amount);
    await crowdfunding.pledge(amount);

    const pledge = await crowdfunding.pledges(accounts[0]);
    assert.equal(pledge.toNumber(), amount);

    const balance = await token.balanceOf(crowdfunding.address);
    assert.equal(balance.toNumber(), amount);
  });

  it("should not allow zero pledges", async() => {
    const amount = 0;
    await token.approve(crowdfunding.address, amount);

    try {
      await crowdfunding.pledge(amount);
      assert.fail("Pledge should have failed");
    } catch (error) {
      assert.include(error.message, "Pledge amount must be greater than zero.");
    }

    const pledge = await crowdfunding.pledges(accounts[0]);
    assert.equal(pledge.toNumber(), amount);

    const balance = await token.balanceOf(crowdfunding.address);
    assert.equal(balance.toNumber(), amount);
  });

  it("should refund pledges if funding goal not met", async() => {
    const amount = 50;
    await token.approve(crowdfunding.address, amount);
    await crowdfunding.pledge(amount);

    await crowdfunding.refund();

    const pledge = await crowdfunding.pledges(accounts[0]);
    assert.equal(pledge.toNumber(), 0);

    const balance = await token.balanceOf(crowdfunding.address);
    assert.equal(balance.toNumber(), 0);
  });

  it("should not allow refunds if funding goal met", async() => {
    const amount = 100;
    await token.approve(crowdfunding.address, amount);
    await crowdfunding.pledge(amount, {from: accounts[0]});

    try {
      await crowdfunding.refund();
      assert.fail("Refund should have failed.");
    } catch (error) {
      assert.include(error.message, "Funding goal has been reached.");
    }

    const pledge = await crowdfunding.pledges(accounts[0]);
    assert.equal(pledge.toNumber(), amount);

    const balance = await token.balanceOf(crowdfunding.address);
    assert.equal(balance.toNumber(), amount);
  });

  it("should allow the owner to withdraw funds if funding goal met", async() => {
    const amount = 100;
    await token.approve(crowdfunding.address, amount);
    await crowdfunding.pledge(amount);

    await crowdfunding.withdrawFunds();

    const pledge = await crowdfunding.pledges(accounts[0]);
    assert.equal(pledge.toNumber(), amount);

    const balance = await token.balanceOf(crowdfunding.address);
    assert.equal(balance.toNumber(), 0);
  });

  it("should not allow non-owner to withdraw funds", async() => {
    const amount = 100;
    const backer = accounts[1];
    await token.transfer(backer, amount);
    await token.approve(crowdfunding.address, amount, {from: backer});
    await crowdfunding.pledge(amount, {from: backer});

    try {
      await crowdfunding.withdrawFunds({from: backer});
      assert.fail("Withdraw should have failed.");
    } catch (error) {
      assert.include(error.message, "Ownable: caller is not the owner");
    }

    const pledge = await crowdfunding.pledges(backer);
    assert.equal(pledge.toNumber(), amount);

    const balance = await token.balanceOf(crowdfunding.address);
    assert.equal(balance.toNumber(), amount);
  });

  it("should not allow the owner to withdraw funds if funding goal not met", async() => {
    const amount = 50;
    await token.approve(crowdfunding.address, amount);
    await crowdfunding.pledge(amount);
    
    try {
      await crowdfunding.withdrawFunds();
      assert.fail("Withdraw should have failed.");
    } catch (error) {
      assert.include(error.message, "Funding goal has not been reached.");
    }

    const pledge = await crowdfunding.pledges(accounts[0]);
    assert.equal(pledge.toNumber(), amount);

    const balance = await token.balanceOf(crowdfunding.address);
    assert.equal(balance.toNumber(), amount);
  })
});
