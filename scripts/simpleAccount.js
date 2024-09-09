const hre = require("hardhat");

const EP_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
const AF_ADDRESS = "0xe7f1725e7734ce288f8367e1bb143e90bb3f0512";
const PM_ADDRESS = "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0";

async function main() {
    const sender = '0xCafac3dD18aC6c6e92c921884f9E4176737C052c'
    const account = await hre.ethers.getContractAt("Account", sender);
    console.log("Account:", account.target);

    const count = await account.count();
    console.log("Count:", count);
   
    const paymasterBalance = await hre.ethers.provider.getBalance(PM_ADDRESS);

    const EntryPoint = await hre.ethers.getContractAt("EntryPoint", EP_ADDRESS);
    const senderBalanceOnEP = await EntryPoint.balanceOf(sender);
    console.log("Sender balance on EntryPoint:", hre.ethers.formatEther(senderBalanceOnEP));
    const paymasterBalanceOnEP = await EntryPoint.balanceOf(PM_ADDRESS);
    console.log("Paymaster balance on EntryPoint:", hre.ethers.formatEther(paymasterBalanceOnEP));
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});