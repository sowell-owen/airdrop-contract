import { expect } from "chai";
import { BigNumber, Wallet } from "ethers";
import { keccak256 } from "ethers/lib/utils";
import hre from "hardhat";
import MerkleTree from "merkletreejs";

import { randomBytes } from "crypto";

import {
  ADDRESSES_AMOUNT,
  MAX_AIRDROP_AMOUNT,
  MIN_AIRDROP_AMOUNT,
} from "../helpers/constants";
import {
  Airdrop,
  AirdropToken__factory,
  Airdrop__factory,
  ERC20,
} from "../typechain-types";
import { generateAirdropData } from "../utils/generateAirdropData";
import { setBalanceHre } from "../utils/setBalance";

describe("Airdrop test scope", () => {
  let erc20: ERC20;
  let airdrop: Airdrop;
  let merkleTree: MerkleTree;
  let eligibleWallets: Wallet[];
  let walletsAirdropAmounts: string[];
  let airdropData: string[];

  beforeEach(async () => {
    const [signer] = await hre.ethers.getSigners();
    erc20 = await new AirdropToken__factory(signer).deploy();
    await erc20.deployed();

    const { packedAirdropData, randomWallets, randomAirdropAmounts } =
      generateAirdropData(hre);

    airdropData = packedAirdropData;
    eligibleWallets = randomWallets;
    walletsAirdropAmounts = randomAirdropAmounts;

    merkleTree = new MerkleTree(airdropData, keccak256, {
      hashLeaves: true,
      sortPairs: true,
    });

    const merkleRoot = merkleTree.getHexRoot();

    airdrop = await new Airdrop__factory(signer).deploy(
      erc20.address,
      merkleRoot
    );
    await airdrop.deployed();

    await erc20.transfer(airdrop.address, hre.ethers.utils.parseEther("60000"));
  });

  it("Should check if uneligible user is able to claim", async () => {
    const notEligibleWallet = new Wallet(
      randomBytes(32).toString("hex"),
      hre.ethers.provider
    );
    await setBalanceHre(hre, notEligibleWallet.address, "0x3635c9adc5dea00000");
    const airdropContract = airdrop.connect(notEligibleWallet);

    let airdropAmount: number | BigNumber =
      Math.random() * (MAX_AIRDROP_AMOUNT - MIN_AIRDROP_AMOUNT) +
      MIN_AIRDROP_AMOUNT;
    airdropAmount = hre.ethers.utils.parseEther(airdropAmount.toString());

    const notEligbleAirdropData = hre.ethers.utils.solidityPack(
      ["address", "uint256"],
      [notEligibleWallet.address, airdropAmount]
    );
    const proof = merkleTree.getHexProof(keccak256(notEligbleAirdropData));

    expect(
      await airdropContract.isCanClaim(
        airdropAmount,
        proof,
        notEligibleWallet.address
      )
    ).to.eq(false);

    await expect(
      airdropContract.claimTokens(airdropAmount, proof)
    ).rejectedWith("Airdrop: Can't claim tokens");
  });

  it("Should verify that the eligible user is able to claim tokens", async () => {
    for (let i = 0; i < ADDRESSES_AMOUNT; i++) {
      const proof = merkleTree.getHexProof(keccak256(airdropData[i]));
      const isCanClaim = await airdrop.isCanClaim(
        hre.ethers.utils.parseEther(walletsAirdropAmounts[i]),
        proof,
        eligibleWallets[i].address
      );
      expect(isCanClaim).to.eq(true);
    }
  });

  it("Eligible user should successfully claim tokens", async () => {
    for (let i = 0; i < ADDRESSES_AMOUNT; i++) {
      const airdropContract = airdrop.connect(eligibleWallets[i]);
      const amountToClaim = hre.ethers.utils.parseEther(
        walletsAirdropAmounts[i]
      );
      const proof = merkleTree.getHexProof(keccak256(airdropData[i]));

      await setBalanceHre(
        hre,
        eligibleWallets[i].address,
        "0x3635c9adc5dea00000"
      );

      const claim = await airdropContract.claimTokens(amountToClaim, proof);
      await claim.wait();

      const usersBalance = await erc20.balanceOf(eligibleWallets[i].address);
      const isUserClaimed = await airdrop.userClaimed(
        eligibleWallets[i].address
      );

      expect(usersBalance).to.eq(amountToClaim);
      expect(isUserClaimed).to.eq(true);
      expect(claim).to.emit(airdrop, "Claim");
    }
  });
});
