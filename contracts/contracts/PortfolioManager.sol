// contracts/PortfolioManager.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./AgentRegistry.sol";

contract PortfolioManager {
    AgentRegistry public agentRegistry;

    struct Portfolio {
        mapping(address => uint256) balances; // Token address => balance
        // Add other portfolio data as needed (e.g., strategy parameters)
    }

    mapping(address => Portfolio) public portfolios; // User address => Portfolio
    mapping(address => bool) public userHasPortfolio;

    event Deposit(address indexed user, address indexed token, uint256 amount);
    event Withdraw(address indexed user, address indexed token, uint256 amount);

    constructor(address _agentRegistryAddress) {
        agentRegistry = AgentRegistry(_agentRegistryAddress);
    }


    // --- User Functions ---

    function deposit(address _token, uint256 _amount) external {
        require(_amount > 0, "Amount must be greater than zero");
        IERC20 token = IERC20(_token);

        // Transfer tokens from user to this contract
        bool success = token.transferFrom(msg.sender, address(this), _amount);
        require(success, "Token transfer failed");

        // Update portfolio balance
        if(!userHasPortfolio[msg.sender]){
             userHasPortfolio[msg.sender] = true;
        }
        portfolios[msg.sender].balances[_token] += _amount;

        emit Deposit(msg.sender, _token, _amount);
    }

    function withdraw(address _token, uint256 _amount) external {
        require(_amount > 0, "Amount must be greater than zero");
        require(portfolios[msg.sender].balances[_token] >= _amount, "Insufficient balance");

        IERC20 token = IERC20(_token);

        // Update portfolio balance
        portfolios[msg.sender].balances[_token] -= _amount;

        // Transfer tokens from this contract to the user
        bool success = token.transfer(msg.sender, _amount);
        require(success, "Token transfer failed");

        emit Withdraw(msg.sender, _token, _amount);
    }

    function getPortfolioBalance(address _user, address _token) external view returns (uint256) {
        return portfolios[_user].balances[_token];
    }

    // --- Agent Functions (Only callable by registered agents) ---
    // Function only to be called by agents
    modifier onlyAgent() {
        require(agentRegistry.isAgent(msg.sender), "Not an authorized agent");
        _;
    }

    function executeAction(address _user, address _token, uint256 _amount, bytes calldata _data) external onlyAgent {
        // This is a placeholder for now.  The agent would provide:
        // - _user: The user whose portfolio to modify.
        // - _token: The token to interact with.
        // - _amount: The amount of the token.
        // - _data:  Encoded data that specifies the action (e.g., swap, deposit to Aave, etc.).
        //           The PortfolioManager would need to decode and execute this data.

        // Example:  If _data indicates a deposit to Aave:
        // 1. Decode _data to get the Aave lending pool address and other parameters.
        // 2. Approve the Aave lending pool to spend the user's tokens.
        // 3. Call the Aave lending pool's deposit function.
        // 4. Update the user's portfolio state to reflect the deposit.
         // For demonstration, let's assume the _data contains a simple action type (1 = deposit, 2 = withdraw)
        (uint256 actionType) = abi.decode(_data, (uint256));

        if (actionType == 1) {
            // Deposit logic (simplified for demonstration)
            require(portfolios[_user].balances[_token] >= _amount, "Insufficient balance");
            portfolios[_user].balances[_token] -= _amount; //reduce from main balance
            // In a real implementation, interact with the external DeFi protocol here (e.g., Aave)
            emit Deposit(_user, _token, _amount);
        } else if (actionType == 2) {
            //withdraw logic
            portfolios[_user].balances[_token] += _amount;
            // In a real implementation, interact with the external DeFi protocol here (e.g., Aave)
            emit Withdraw(_user, _token, _amount);
        } else {
            revert("Invalid action type");
        }
    }


    // --- Emergency Withdraw (Callable by anyone, but only affects their own portfolio) ---

    function emergencyWithdraw(address _token, uint256 _amount) external {
        // Allows a user to directly withdraw their funds, bypassing the agents.
        // This is a safety mechanism in case of agent malfunction or compromise.
        require(_amount > 0, "Amount must be greater than zero");
        require(portfolios[msg.sender].balances[_token] >= _amount, "Insufficient balance");

        IERC20 token = IERC20(_token);
        portfolios[msg.sender].balances[_token] -= _amount;
        bool success = token.transfer(msg.sender, _amount);
        require(success, "Token transfer failed");

        emit Withdraw(msg.sender, _token, _amount);
    }
}