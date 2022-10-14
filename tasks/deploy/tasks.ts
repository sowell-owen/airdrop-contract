import "@nomicfoundation/hardhat-toolbox";
import { keccak256 } from "ethers/lib/utils";
import { task, types } from "hardhat/config";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { MerkleTree } from "merkletreejs";

import { DEPLOY_AIRDROP, DEPLOY_ERC20 } from "./task-names";
import { preAction } from "./utils";

import { AirdropToken__factory, Airdrop__factory } from "../../typechain-types";
import { generateAirdropData } from "../../utils/generateAirdropData";

task(DEPLOY_ERC20, "Deploy ERC20 AirdropToken contract").setAction(
  async (_, hre: HardhatRuntimeEnvironment) => {
    await preAction(hre);
    const [signer] = await hre.ethers.getSigners();
    console.log("ERC20 deployer: ", signer.address + "\n");

    const factory = new AirdropToken__factory(signer);
    const ERC20 = await factory.deploy();
    await ERC20.deployed();
    console.log("ERC20 token address: ", ERC20.address + "\n");
    return ERC20.address;
  }
);

task(DEPLOY_AIRDROP, "Deploy Airdrop contract")
  .addParam("token", "Airdrop token", "", types.string)
  .addParam("merkleRoot", "Merkle root hash", "", types.string)
  .setAction(async (params, hre) => {
    await preAction(hre);
    const [signer] = await hre.ethers.getSigners();
    console.log("Airdrop deployer: ", signer.address + "\n");

    const token = params.token || hre.run(DEPLOY_ERC20);
    const { packedAirdropData } = generateAirdropData(hre);
    const merkleTree = new MerkleTree(packedAirdropData, keccak256, {
      hashLeaves: true,
      sortPairs: true,
    });

    const root = merkleTree.getHexRoot();
    console.log("Merkle tree root: ", root + "\n");

    const factory = new Airdrop__factory(signer);
    const airdrop = await factory.deploy(token, root);
    await airdrop.deployed();
    console.log("Airdrop contract address: ", airdrop.address + "\n");
    return airdrop;
  });
