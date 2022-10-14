import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "@nomiclabs/hardhat-ethers";

import "./tasks/deploy/tasks";

const config: HardhatUserConfig = {
  solidity: "0.8.17",
};

export default config;
