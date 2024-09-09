const hre = require("hardhat");

async function main() {
    const EntryPoint = await hre.ethers.deployContract("EntryPoint");
    await EntryPoint.waitForDeployment();
    console.log("EntryPoint deployed to:", EntryPoint.target);

    const AccountFactory = await hre.ethers.deployContract("AccountFactory");
    await AccountFactory.waitForDeployment();
    console.log("AccountFactory deployed to:", AccountFactory.target);

    const Paymaster = await hre.ethers.deployContract("Paymaster");
    await Paymaster.waitForDeployment();
    console.log("Paymaster deployed to:", Paymaster.target);
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});
