const hre = require("hardhat");

const EP_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

async function main() {
    const [signer] = await hre.ethers.getSigners();
    const address = await signer.getAddress();
    const entryPoint = await hre.ethers.getContractAt("EntryPoint", EP_ADDRESS);
    console.log("EntryPoint:", entryPoint.target);
    const balance = await entryPoint.balanceOf('0xCafac3dD18aC6c6e92c921884f9E4176737C052c');
    console.log("Balance:", hre.ethers.formatEther(balance));
}


main().catch((error) => {
    console.error(error);
    process.exit(1);
});
