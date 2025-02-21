// scripts/deploy.ts
import { ethers } from "hardhat";

async function main() {
    const [deployer] = await ethers.getSigners();

    console.log("Deploying contracts with the account:", deployer.address);

    // Deploy AgentRegistry
    const AgentRegistry = await ethers.getContractFactory("AgentRegistry");
    const agentRegistry = await AgentRegistry.deploy();
    await agentRegistry.waitForDeployment()
    const agentRegistryAddress = await agentRegistry.getAddress();
    console.log("AgentRegistry deployed to:", agentRegistryAddress);

    // Deploy PortfolioManager
    const PortfolioManager = await ethers.getContractFactory("PortfolioManager");
    const portfolioManager = await PortfolioManager.deploy(agentRegistryAddress);
    await portfolioManager.waitForDeployment();
    const portfolioManagerAddress = await portfolioManager.getAddress();
    console.log("PortfolioManager deployed to:", portfolioManagerAddress);

    // Example: Register an agent (replace with the actual agent address)
    // In a real deployment, you'd likely do this from a separate script or UI.
    const agentAddress = deployer.address; // For testing, use the deployer as the agent
    await agentRegistry.registerAgent(agentAddress);
    console.log("Agent registered:", agentAddress);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });