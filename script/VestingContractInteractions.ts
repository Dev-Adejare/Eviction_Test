import { ethers } from "hardhat";
import hre from 'hardhat';
import { time } from "@nomicfoundation/hardhat-network-helpers";

async function main() {
  const [deployer, beneficiary] = await ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address);

  // ####### Token Deployment ##########
  const Token = await ethers.getContractFactory("Token");
  const token = await Token.deploy("kenny", "KEN");

  await token.waitForDeployment();
  console.log("Token deployed to:", token.target);

  // ########## TokenVesting Deployment #######
  const TokenVesting = await ethers.getContractFactory("TokenVesting");
  const tokenVesting = await TokenVesting.deploy(token.target);

  await tokenVesting.waitForDeployment();
  console.log("TokenVesting deployed to:", tokenVesting.target);

  // #### Transfer tokens to TokenVesting contract ####
  const totalVestingTokens = ethers.parseEther("1000");
  await token.transfer(tokenVesting.target, totalVestingTokens);
  console.log("Transferred tokens to TokenVesting contract");

  // ############ Add Beneficiary #######
  console.log("Adding beneficiary:", beneficiary.address);

  const startTime = Math.floor(Date.now() / 1000) + 60; // Vesting starts 1 minute from now
  const duration = 365 * 24 * 60 * 60; // 1-year vesting duration
  const totalAmount = ethers.parseEther("1000");

  const tx = await tokenVesting.addBeneficiary(
    beneficiary.address,
    startTime,
    duration,
    totalAmount
  );
  await tx.wait();
  console.log("Beneficiary added successfully");

  // ##### Simulate Passage of Time ######
  const targetTime = startTime + duration;
  await time.increaseTo(targetTime);
  console.log("Time advanced successfully to end of vesting period");

  // #### Claim vested tokens for the beneficiary #####
  console.log("Claiming vested tokens for beneficiary");
  const claimTx = await tokenVesting.connect(beneficiary).claimTokens();
  await claimTx.wait();
  console.log("Tokens claimed by beneficiary");

  // #### Check balance of beneficiary ####
  const beneficiaryBalance = await token.balanceOf(beneficiary.address);
  console.log("Beneficiary balance after claim:", ethers.formatEther(beneficiaryBalance), "KEN");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
