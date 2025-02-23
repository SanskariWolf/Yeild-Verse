// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.8.0;

import "../lib/openzeppelin-contracts/contracts/token/ERC20/IERC20.sol";
import "../lib/reactive-lib/src/abstract-base/AbstractCallback.sol";
import "../lib/v2-periphery/contracts/interfaces/IUniswapV2Router02.sol";
import "../lib/chainlink-brownie-contracts/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

contract YieldVerseReactiveCallback is AbstractCallback {
    event RebalanceExecuted(
        address indexed user,
        address indexed assetFrom,
        address indexed assetTo,
        uint256 amountFrom,
        uint256 amountTo,
        uint256 timestamp
    );

    event SlippageExceeded(
        address indexed user,
        address indexed assetFrom,
        address indexed assetTo,
        uint256 expectedAmount,
        uint256 actualAmount
    );

    event PriceCheckCompleted(
        address indexed token,
        uint256 price,
        uint256 timestamp
    );

    struct RebalanceConfig {
        uint256 slippageTolerance; // in basis points (e.g., 100 = 1%)
        uint256 deadlineMinutes;    // minutes until trade deadline
        uint256 minExecutionPrice;  // minimum price to execute trade
    }

    IUniswapV2Router02 private immutable uniswapRouter;
    mapping(address => mapping(address => AggregatorV3Interface)) public priceFeeds;
    mapping(address => RebalanceConfig) public userConfigs;

    constructor(
        address _callback_sender,
        address _uniswapRouter
    ) AbstractCallback(_callback_sender) payable {
        uniswapRouter = IUniswapV2Router02(_uniswapRouter);
    }

    function setUserConfig(
        uint256 _slippageTolerance,
        uint256 _deadlineMinutes,
        uint256 _minExecutionPrice
    ) external {
        require(_slippageTolerance <= 1000, "Slippage tolerance too high"); // Max 10%
        require(_deadlineMinutes <= 60, "Deadline too long"); // Max 1 hour

        userConfigs[msg.sender] = RebalanceConfig({
            slippageTolerance: _slippageTolerance,
            deadlineMinutes: _deadlineMinutes,
            minExecutionPrice: _minExecutionPrice
        });
    }

    function setPriceFeed(
        address token,
        address baseToken,
        address priceFeed
    ) external {
        priceFeeds[token][baseToken] = AggregatorV3Interface(priceFeed);
    }

    function executeRebalance(
        address user,
        address assetFrom,
        address assetTo,
        uint256 amount
    ) external authorizedSenderOnly {
        require(user != address(0), "Invalid user address");
        require(assetFrom != address(0), "Invalid source token");
        require(assetTo != address(0), "Invalid destination token");
        require(amount > 0, "Amount must be greater than 0");

        // Get user configuration or use defaults
        RebalanceConfig memory config = userConfigs[user];
        if (config.slippageTolerance == 0) {
            config.slippageTolerance = 100; // Default 1%
            config.deadlineMinutes = 15;     // Default 15 minutes
        }

        // Check if price conditions are still favorable
        if (config.minExecutionPrice > 0) {
            require(
                getCurrentPrice(assetFrom, assetTo) >= config.minExecutionPrice,
                "Price below minimum execution price"
            );
        }

        // Transfer tokens from user
        require(
            IERC20(assetFrom).balanceOf(user) >= amount,
            "Insufficient balance"
        );
        require(
            IERC20(assetFrom).allowance(user, address(this)) >= amount,
            "Insufficient allowance"
        );

        // Transfer tokens to this contract
        IERC20(assetFrom).transferFrom(user, address(this), amount);
        IERC20(assetFrom).approve(address(uniswapRouter), amount);

        // Calculate minimum amount out based on slippage tolerance
        uint256 minAmountOut = (amount * (10000 - config.slippageTolerance)) / 10000;

        // Execute swap
        address[] memory path = new address[](2);
        path[0] = assetFrom;
        path[1] = assetTo;

        uint256[] memory amounts = uniswapRouter.swapExactTokensForTokens(
            amount,
            minAmountOut,
            path,
            user,
            block.timestamp + (config.deadlineMinutes * 1 minutes)
        );

        uint256 amountReceived = amounts[amounts.length - 1];

        // Check if slippage is within acceptable range
        if (amountReceived < minAmountOut) {
            emit SlippageExceeded(
                user,
                assetFrom,
                assetTo,
                minAmountOut,
                amountReceived
            );
        }

        emit RebalanceExecuted(
            user,
            assetFrom,
            assetTo,
            amount,
            amountReceived,
            block.timestamp
        );
    }

    function executeETHRebalance(
        address user,
        address token,
        bool isETHFrom
    ) external payable authorizedSenderOnly {
        require(user != address(0), "Invalid user address");
        require(token != address(0), "Invalid token address");

        RebalanceConfig memory config = userConfigs[user];
        if (config.slippageTolerance == 0) {
            config.slippageTolerance = 100; // Default 1%
            config.deadlineMinutes = 15;     // Default 15 minutes
        }

        if (isETHFrom) {
            // ETH to Token
            require(msg.value > 0, "Must send ETH");
            uint256 minAmountOut = (msg.value * (10000 - config.slippageTolerance)) / 10000;

            address[] memory path = new address[](2);
            path[0] = uniswapRouter.WETH();
            path[1] = token;

            uint256[] memory amounts = uniswapRouter.swapExactETHForTokens{value: msg.value}(
                minAmountOut,
                path,
                user,
                block.timestamp + (config.deadlineMinutes * 1 minutes)
            );

            emit RebalanceExecuted(
                user,
                address(0),
                token,
                msg.value,
                amounts[amounts.length - 1],
                block.timestamp
            );
        } else {
            // Token to ETH
            uint256 amount = IERC20(token).balanceOf(user);
            require(amount > 0, "No tokens to swap");
            
            IERC20(token).transferFrom(user, address(this), amount);
            IERC20(token).approve(address(uniswapRouter), amount);

            uint256 minAmountOut = (amount * (10000 - config.slippageTolerance)) / 10000;

            address[] memory path = new address[](2);
            path[0] = token;
            path[1] = uniswapRouter.WETH();

            uint256[] memory amounts = uniswapRouter.swapExactTokensForETH(
                amount,
                minAmountOut,
                path,
                user,
                block.timestamp + (config.deadlineMinutes * 1 minutes)
            );

            emit RebalanceExecuted(
                user,
                token,
                address(0),
                amount,
                amounts[amounts.length - 1],
                block.timestamp
            );
        }
    }

    function getCurrentPrice(
        address tokenFrom,
        address tokenTo
    ) public view returns (uint256) {
        AggregatorV3Interface priceFeed = priceFeeds[tokenFrom][tokenTo];
        require(address(priceFeed) != address(0), "Price feed not found");

        (, int256 price,,,) = priceFeed.latestRoundData();
        require(price > 0, "Invalid price");

        return uint256(price);
    }

    // Required override for receiving ETH
    receive() external payable override {}
}
