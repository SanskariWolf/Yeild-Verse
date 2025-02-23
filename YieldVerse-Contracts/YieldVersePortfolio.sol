// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "../lib/v2-periphery/contracts/interfaces/IUniswapV2Router02.sol";
import "../lib/v2-core/contracts/interfaces/IUniswapV2Pair.sol";
/*
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "../lib/chainlink-brownie-contracts/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";
import "./YieldVerseCallback.sol";
import "../lib/v2-periphery/contracts/interfaces/IUniswapV2Router02.sol";

*/
contract YieldVersePortfolio {
    struct TokenAllocation {
        address token;
        uint256 balance;
    }
// V2ROUTER CONTRACT ADDRESS : 0xeE567Fe1712Faf6149d80dA1E6934E354124CfE3
// V2router Contract Address: 
//FACTORY: 0xF62c03E08ada871A0bEb309762E260a7a6a880E6
    mapping(address => mapping(address => uint256)) public userBalances;
    IUniswapV2Router02 public uniswapRouter;

    event PortfolioUpdated(address indexed user, address indexed token, uint256 amount, string action);

    constructor(address _uniswapRouter) {
        uniswapRouter = IUniswapV2Router02(_uniswapRouter);
    }

    function deposit(address token, uint256 amount) external {
        IERC20(token).transferFrom(msg.sender, address(this), amount);
        userBalances[msg.sender][token] += amount;
        emit PortfolioUpdated(msg.sender, token, amount, "Deposit");
    }

    function withdraw(address token, uint256 amount) external {
        require(userBalances[msg.sender][token] >= amount, "Insufficient balance");
        IERC20(token).transfer(msg.sender, amount);
        userBalances[msg.sender][token] -= amount;
        emit PortfolioUpdated(msg.sender, token, amount, "Withdraw");
    }

    function getBalance(address user, address token) external view returns (uint256) {
        return userBalances[user][token];
    }

    function getTokenAllocations(address user, address[] memory tokens) external view returns (TokenAllocation[] memory) {
        TokenAllocation[] memory allocations = new TokenAllocation[](tokens.length);
        for (uint256 i = 0; i < tokens.length; i++) {
            allocations[i] = TokenAllocation(tokens[i], userBalances[user][tokens[i]]);
        }
        return allocations;
    }

    function getLPPosition(address user, address lpToken) external view returns (uint256 liquidity, address token0, address token1, uint256 balance0, uint256 balance1) {
        IUniswapV2Pair pair = IUniswapV2Pair(lpToken);
        token0 = pair.token0();
        token1 = pair.token1();
        liquidity = IERC20(lpToken).balanceOf(user);

        uint256 totalSupply = pair.totalSupply();
        (uint112 reserve0, uint112 reserve1,) = pair.getReserves();
        
        balance0 = (reserve0 * liquidity) / totalSupply;
        balance1 = (reserve1 * liquidity) / totalSupply;
    }
}
