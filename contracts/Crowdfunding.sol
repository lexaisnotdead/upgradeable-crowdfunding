// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract Crowdfunding is Initializable, UUPSUpgradeable, OwnableUpgradeable, ReentrancyGuard {
    ERC20 public token;
    uint public fundingGoal;
    uint public raisedAmount;
    mapping(address => uint) public pledges;

    event Pledge(address indexed backer, uint indexed amount);
    event FundingGoalReached(uint raisedAmount);
    event Refund(address indexed backer, uint indexed amount);

    function initialize(ERC20 _token, uint _fundingGoal) public initializer nonReentrant {
        __Ownable_init();
        token = _token;
        fundingGoal = _fundingGoal;
    }

    function _authorizeUpgrade(address newImplementation) internal override onlyOwner {}

    function pledge(uint256 _amount) external {
        require(_amount > 0, "Pledge amount must be greater than zero.");
        require(token.transferFrom(msg.sender, address(this), _amount), "Token transfer failed.");

        pledges[msg.sender] += _amount;
        raisedAmount += _amount;
        emit Pledge(msg.sender, _amount);

        if (raisedAmount >= fundingGoal) {
            emit FundingGoalReached(raisedAmount);
        }
    }

    function refund() external nonReentrant {
        require(raisedAmount < fundingGoal, "Funding goal has been reached.");
        uint256 amount = pledges[msg.sender];
        require(amount > 0, "No pledges found.");

        pledges[msg.sender] = 0;
        raisedAmount -= amount;
        emit Refund(msg.sender, amount);

        require(token.transfer(msg.sender, amount), "Token transfer failed.");
    }

    function withdrawFunds() external onlyOwner nonReentrant {
        require(raisedAmount >= fundingGoal, "Funding goal has not been reached.");
        require(token.transfer(owner(), raisedAmount), "Token transfer failed.");
        raisedAmount = 0;
    }
}
