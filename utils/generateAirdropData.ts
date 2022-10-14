import { Wallet } from "ethers";
import { HardhatRuntimeEnvironment } from "hardhat/types";

import { randomBytes } from "crypto";

import {
  ADDRESSES_AMOUNT,
  MAX_AIRDROP_AMOUNT,
  MIN_AIRDROP_AMOUNT,
} from "../helpers/constants";

export const generateAirdropData = (hre: HardhatRuntimeEnvironment) => {
  const randomWallets: Wallet[] = [];
  const randomAirdropAmounts: string[] = [];
  for (let i = 0; i <= ADDRESSES_AMOUNT; i++) {
    const wallet = new Wallet(
      randomBytes(32).toString("hex"),
      hre.ethers.provider
    );

    const airdropAmount =
      Math.random() * (MAX_AIRDROP_AMOUNT - MIN_AIRDROP_AMOUNT) +
      MIN_AIRDROP_AMOUNT;

    randomWallets.push(wallet);
    randomAirdropAmounts.push(airdropAmount.toString());
  }
  const packedAirdropData: string[] = randomWallets.map((wallet, i) => {
    return hre.ethers.utils.solidityPack(
      ["address", "uint256"],
      [wallet.address, hre.ethers.utils.parseEther(randomAirdropAmounts[i])]
    );
  });
  return {
    randomWallets,
    randomAirdropAmounts,
    packedAirdropData,
  };
};
