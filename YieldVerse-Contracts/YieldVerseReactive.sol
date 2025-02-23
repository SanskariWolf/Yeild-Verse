// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.8.0;

import '../lib/reactive-lib/src/interfaces/IReactive.sol';
import '../lib/reactive-lib/src/abstract-base/AbstractReactive.sol';
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract YieldVerseReactive is IReactive, AbstractReactive {
    event Subscribed(
        address indexed service_address,
        address indexed _contract,
        uint256 indexed topic_0
    );

    event PriceThresholdReached(
        address indexed token,
        uint256 price,
        uint256 threshold
    );

    event RebalanceTrigger(
        address indexed user,
        address indexed assetFrom,
        address indexed assetTo,
        uint256 amount
    );

    event OrderCreated(
        bytes32 indexed orderId,
        address indexed user,
        address assetFrom,
        address assetTo
    );

    event OrderCancelled(
        bytes32 indexed orderId,
        address indexed user
    );

    event CallbackSent();
    event RebalanceCompleted();

    uint256 private constant SEPOLIA_CHAIN_ID = 11155111;
    uint256 private constant PRICE_UPDATE_TOPIC = 0x0559884fd3a460db3073b7fc896cc77986f16e378210ded43186175bf646fc5f;
    uint64 private constant CALLBACK_GAS_LIMIT = 1000000;

    struct RebalanceOrder {
        address user;
        address assetFrom;
        address assetTo;
        uint256 amount;
        uint256 priceThreshold;
        bool active;
        uint256 index; // Position in activeOrderIds array
    }

    // State variables
    address private immutable callbackContract;
    
    // Order tracking
    mapping(bytes32 => RebalanceOrder) private rebalanceOrders;
    bytes32[] private activeOrderIds;
    mapping(address => bytes32[]) private userOrders;

    // User thresholds
    mapping(address => mapping(address => uint256)) private userThresholds;

    constructor(address _callbackContract) payable {
        callbackContract = _callbackContract;

        if (!vm) {
            // Subscribe to price feed updates
            service.subscribe(
                SEPOLIA_CHAIN_ID,
                _callbackContract,  // Price feed contract address
                PRICE_UPDATE_TOPIC,
                REACTIVE_IGNORE,
                REACTIVE_IGNORE,
                REACTIVE_IGNORE
            );
        }
    }

    function createRebalanceOrder(
        address assetFrom,
        address assetTo,
        uint256 amount,
        uint256 priceThreshold
    ) external returns (bytes32) {
        require(assetFrom != address(0), "Invalid asset from");
        require(assetTo != address(0), "Invalid asset to");
        require(amount > 0, "Invalid amount");
        require(priceThreshold > 0, "Invalid threshold");

        bytes32 orderId = keccak256(
            abi.encodePacked(
                msg.sender,
                assetFrom,
                assetTo,
                amount,
                priceThreshold,
                block.timestamp
            )
        );

        require(rebalanceOrders[orderId].user == address(0), "Order already exists");

        // Create and store the order
        rebalanceOrders[orderId] = RebalanceOrder({
            user: msg.sender,
            assetFrom: assetFrom,
            assetTo: assetTo,
            amount: amount,
            priceThreshold: priceThreshold,
            active: true,
            index: activeOrderIds.length
        });

        // Add to active orders array
        activeOrderIds.push(orderId);
        
        // Add to user's orders
        userOrders[msg.sender].push(orderId);

        // Update user thresholds
        userThresholds[msg.sender][assetFrom] = priceThreshold;

        emit OrderCreated(orderId, msg.sender, assetFrom, assetTo);
        
        return orderId;
    }

    function react(LogRecord calldata log) external vmOnly {
        // Decode price update data
        (uint256 price, address token) = abi.decode(log.data, (uint256, address));

        // Check all active rebalance orders
        for (uint256 i = 0; i < activeOrderIds.length; i++) {
            bytes32 orderId = activeOrderIds[i];
            RebalanceOrder storage order = rebalanceOrders[orderId];

            if (order.active && token == order.assetFrom) {
                if (price <= order.priceThreshold) {
                    emit PriceThresholdReached(token, price, order.priceThreshold);

                    // Prepare callback to execute rebalance
                    bytes memory payload = abi.encodeWithSignature(
                        "executeRebalance(address,address,address,uint256)",
                        order.user,
                        order.assetFrom,
                        order.assetTo,
                        order.amount
                    );

                    // Deactivate the order
                    _deactivateOrder(orderId);

                    emit RebalanceTrigger(
                        order.user,
                        order.assetFrom,
                        order.assetTo,
                        order.amount
                    );

                    emit CallbackSent();
                    emit Callback(log.chain_id, callbackContract, CALLBACK_GAS_LIMIT, payload);
                }
            }
        }
    }

    function _deactivateOrder(bytes32 orderId) internal {
        RebalanceOrder storage order = rebalanceOrders[orderId];
        require(order.active, "Order already inactive");

        // Remove from active orders array by swapping with last element and popping
        uint256 orderIndex = order.index;
        uint256 lastOrderIndex = activeOrderIds.length - 1;
        
        if (orderIndex != lastOrderIndex) {
            bytes32 lastOrderId = activeOrderIds[lastOrderIndex];
            activeOrderIds[orderIndex] = lastOrderId;
            rebalanceOrders[lastOrderId].index = orderIndex;
        }
        
        activeOrderIds.pop();
        order.active = false;
    }

    function cancelRebalanceOrder(bytes32 orderId) external {
        RebalanceOrder storage order = rebalanceOrders[orderId];
        require(order.user == msg.sender, "Not order owner");
        require(order.active, "Order not active");

        _deactivateOrder(orderId);
        emit OrderCancelled(orderId, msg.sender);
    }

    // View functions for order management
    function getActiveOrdersCount() public view returns (uint256) {
        return activeOrderIds.length;
    }

    function getOrderIdAtIndex(uint256 index) public view returns (bytes32) {
        require(index < activeOrderIds.length, "Index out of bounds");
        return activeOrderIds[index];
    }

    function getUserOrders(address user) external view returns (bytes32[] memory) {
        return userOrders[user];
    }

    function getOrder(bytes32 orderId) external view returns (
        address user,
        address assetFrom,
        address assetTo,
        uint256 amount,
        uint256 priceThreshold,
        bool active
    ) {
        RebalanceOrder storage order = rebalanceOrders[orderId];
        return (
            order.user,
            order.assetFrom,
            order.assetTo,
            order.amount,
            order.priceThreshold,
            order.active
        );
    }

    function isOrderActive(bytes32 orderId) external view returns (bool) {
        return rebalanceOrders[orderId].active;
    }
}
