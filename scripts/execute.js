const hre = require("hardhat");

const FACTORY_NONCE = 1;
const AF_ADDRESS = "0xe7f1725e7734ce288f8367e1bb143e90bb3f0512";
const EP_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
const PM_ADDRESS = "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0";

/**
 * address sender;
 * uint256 nonce;
 * bytes initCode;
 * bytes callData;
 * bytes32 accountGasLimits;
 * uint256 preVerificationGas;
 * bytes32 gasFees;
 * bytes paymasterAndData;
 * bytes signature;
 */

const DefaultsForUserOp = {
    sender: hre.ethers.ZeroAddress,
    nonce: 0,
    initCode: '0x',
    callData: '0x',
    callGasLimit: 0,
    verificationGasLimit: 150000, // default verification gas. will add create2 cost (3200+200*length) if initCode exists
    preVerificationGas: 21000, // should also cover calldata cost.
    maxFeePerGas: 0,
    maxPriorityFeePerGas: 1e9,
    paymaster: hre.ethers.ZeroAddress,
    paymasterData: '0x',
    paymasterVerificationGasLimit: 3e5,
    paymasterPostOpGasLimit: 0,
    signature: '0x'
}

function packAccountGasLimits (verificationGasLimit, callGasLimit) {
    return hre.ethers.concat([
        hre.ethers.zeroPadValue(hre.ethers.toBeHex(verificationGasLimit), 16), hre.ethers.zeroPadValue(hre.ethers.toBeHex(callGasLimit), 16)
    ])
}
  
function packPaymasterData (paymaster, paymasterVerificationGasLimit, postOpGasLimit, paymasterData) {
    return hre.ethers.concat([
        paymaster, hre.ethers.zeroPadValue(hre.ethers.toBeHex(paymasterVerificationGasLimit), 16),
        hre.ethers.zeroPadValue(hre.ethers.toBeHex(postOpGasLimit), 16), paymasterData
    ])
}


function packUserOp (userOp) {
    const accountGasLimits = packAccountGasLimits(userOp.verificationGasLimit, userOp.callGasLimit)
    const gasFees = packAccountGasLimits(userOp.maxPriorityFeePerGas, userOp.maxFeePerGas)
    let paymasterAndData = '0x'
    if (userOp.paymaster?.length >= 20 && userOp.paymaster !== hre.ethers.ZeroAddress) {
      paymasterAndData = packPaymasterData(userOp.paymaster, userOp.paymasterVerificationGasLimit, userOp.paymasterPostOpGasLimit, userOp.paymasterData)
    }
    return {
      sender: userOp.sender,
      nonce: userOp.nonce,
      callData: userOp.callData,
      accountGasLimits,
      initCode: userOp.initCode,
      preVerificationGas: userOp.preVerificationGas,
      gasFees,
      paymasterAndData,
      signature: userOp.signature
    }
  }

async function main() {
    const [signer] = await hre.ethers.getSigners();
    const address0 = await signer.getAddress();
    const sender = await hre.ethers.getCreateAddress({from: AF_ADDRESS, nonce: FACTORY_NONCE});
    const entryPoint = await hre.ethers.getContractAt("EntryPoint", EP_ADDRESS);

    const accountFactory = await hre.ethers.getContractAt("AccountFactory", AF_ADDRESS);
    const initCode = AF_ADDRESS + (accountFactory.interface.encodeFunctionData("createAccount", [address0])).slice(2);

    const Account = await hre.ethers.getContractFactory("Account");

    // const tx1 = await entryPoint.depositTo(PM_ADDRESS, {value: hre.ethers.parseEther("100")});
    // const receipt1 = await tx1.wait();
    // console.log("receipt1:", receipt1);
    // console.log("sender:", sender);
    const userOp = {
        sender: sender,
        nonce: await entryPoint.getNonce(sender, 0),
        initCode: '0x',
        callData: Account.interface.encodeFunctionData("execute", []),
        callGasLimit: 200_000,
        verificationGasLimit: 1500000, // default verification gas. will add create2 cost (3200+200*length) if initCode exists
        preVerificationGas: 50_000, // should also cover calldata cost.
        maxFeePerGas: hre.ethers.parseUnits("10", "gwei"), 
        maxPriorityFeePerGas: hre.ethers.parseUnits("5", "gwei"),
        paymaster: PM_ADDRESS,
        paymasterData: '0x',
        paymasterVerificationGasLimit: 3e5,
        paymasterPostOpGasLimit: 0,
        signature: '0x'
    }
    const packedUserOp = packUserOp(userOp);    
    console.log("packedUserOp:", packedUserOp);

    const tx2 = await entryPoint.handleOps([packedUserOp], address0);
    const receipt2 = await tx2.wait();
    console.log("receipt2:", receipt2);
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});