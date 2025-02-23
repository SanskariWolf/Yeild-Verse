// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "../lib/chainlink-brownie-contracts/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";
import "./YieldVerseReactive.sol";
import "../lib/v2-periphery/contracts/interfaces/IUniswapV2Router02.sol";

contract YieldVerseBalancingManager {
    event StrategyCreated(
        address indexed user,
        address indexed assetFrom,
        address indexed assetTo,
        uint256 priceThreshold,
        uint256 amount
    );

    event StrategyUpdated(
        address indexed user,
        bytes32 indexed strategyId,
        uint256 newPriceThreshold
    );

    struct Strategy {
        address assetFrom;
        address assetTo;
        uint256 priceThreshold;
        uint256 amount;
        bool isActive;
    }

    YieldVerseReactive public reactiveContract;
    AggregatorV3Interface public priceFeed;
    IUniswapV2Router02 public uniswapRouter;
    
    mapping(address => mapping(bytes32 => Strategy)) public userStrategies;
    mapping(address => bytes32[]) public userStrategyIds;

    constructor(
        address _reactiveContract,
        address _priceFeed,
        address _uniswapRouter
    ) {
        reactiveContract = YieldVerseReactive(payable(_reactiveContract));
        priceFeed = AggregatorV3Interface(_priceFeed);
        uniswapRouter = IUniswapV2Router02(_uniswapRouter);
    }

    function createStrategy(
        address assetFrom,
        address assetTo,
        uint256 priceThreshold,
        uint256 amount
    ) external returns (bytes32) {
        require(assetFrom != address(0), "Invalid source asset");
        require(assetTo != address(0), "Invalid target asset");
        require(amount > 0, "Invalid amount");
        require(priceThreshold > 0, "Invalid price threshold");

        // Create strategy ID
        bytes32 strategyId = keccak256(
            abi.encodePacked(
                msg.sender,
                assetFrom,
                assetTo,
                priceThreshold,
                amount,
                block.timestamp
            )
        );

        // Store strategy
        userStrategies[msg.sender][strategyId] = Strategy({
            assetFrom: assetFrom,
            assetTo: assetTo,
            priceThreshold: priceThreshold,
            amount: amount,
            isActive: true
        });

        userStrategyIds[msg.sender].push(strategyId);

        // Create corresponding order in reactive contract
        reactiveContract.createRebalanceOrder(
            assetFrom,
            assetTo,
            amount,
            priceThreshold
        );

        emit StrategyCreated(
            msg.sender,
            assetFrom,
            assetTo,
            priceThreshold,
            amount
        );

        return strategyId;
    }

    function updateStrategy(
        bytes32 strategyId,
        uint256 newPriceThreshold
    ) external {
        Strategy storage strategy = userStrategies[msg.sender][strategyId];
        require(strategy.isActive, "Strategy not active");
        
        strategy.priceThreshold = newPriceThreshold;

        // Create new order with updated threshold
        reactiveContract.createRebalanceOrder(
            strategy.assetFrom,
            strategy.assetTo,
            strategy.amount,
            newPriceThreshold
        );

        emit StrategyUpdated(msg.sender, strategyId, newPriceThreshold);
    }

    function deactivateStrategy(bytes32 strategyId) external {
        Strategy storage strategy = userStrategies[msg.sender][strategyId];
        require(strategy.isActive, "Strategy not active");
        
        strategy.isActive = false;
    }

    function getUserStrategies(address user) external view returns (
        bytes32[] memory strategyIds,
        Strategy[] memory strategies
    ) {
        strategyIds = userStrategyIds[user];
        strategies = new Strategy[](strategyIds.length);
        
        for (uint256 i = 0; i < strategyIds.length; i++) {
            strategies[i] = userStrategies[user][strategyIds[i]];
        }
    }

    function getActiveStrategies(address user) external view returns (
        bytes32[] memory activeIds,
        Strategy[] memory activeStrategies
    ) {
        bytes32[] memory allIds = userStrategyIds[user];
        uint256 activeCount = 0;
        
        // Count active strategies
        for (uint256 i = 0; i < allIds.length; i++) {
            if (userStrategies[user][allIds[i]].isActive) {
                activeCount++;
            }
        }
        
        // Create arrays of active strategies
        activeIds = new bytes32[](activeCount);
        activeStrategies = new Strategy[](activeCount);
        uint256 j = 0;
        
        for (uint256 i = 0; i < allIds.length; i++) {
            if (userStrategies[user][allIds[i]].isActive) {
                activeIds[j] = allIds[i];
                activeStrategies[j] = userStrategies[user][allIds[i]];
                j++;
            }
        }
    }
}
