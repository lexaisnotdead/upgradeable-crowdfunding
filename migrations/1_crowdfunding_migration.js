// SPDX-License-Identifier: MIT
const { deployProxy, upgradeProxy } = require('@openzeppelin/truffle-upgrades');
const Crowdfunding = artifacts.require("Crowdfunding");
// const CrowdfundingV2 = artifacts.require("CrowdfundingV2");
const Token = artifacts.require("Token");

module.exports = async function (deployer) {
    await deployer.deploy(Token);
    const token = await Token.deployed();

    const crowdfunding = await deployProxy(Crowdfunding, [token.address, 100], {deployer});
    // const crowdfundingV2 = await upgradeProxy(crowdfunding.address, CrowdfundingV2, {deployer});
};