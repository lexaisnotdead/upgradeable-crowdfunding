// SPDX-License-Identifier: MIT
const Crowdfunding = artifacts.require("Crowdfunding");
const Token = artifacts.require("Token");

module.exports = async function (deployer) {
    await deployer.deploy(Token);
    const token = await Token.deployed();
  
    await deployer.deploy(Crowdfunding);
    const crowdfunding = await Crowdfunding.deployed();
    await crowdfunding.initialize(token.address, 100);
};