import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "@nomiclabs/hardhat-ethers";

import "./tasks/deploy/tasks";
import { getEnvVars } from "./config/getEnvVars";
import { getNetworkConfig } from "./config/getNetworkConfig";

import "hardhat-gas-reporter";
import "hardhat-contract-sizer";

const { OPTIMIZER, REPORT_GAS } = getEnvVars();

const config: HardhatUserConfig = {
  solidity: {
    compilers: [
      {
        version: "0.8.17",
        settings: {
          optimizer: {
            enabled: OPTIMIZER,
            runs: 200,
          },
        },
      },
    ],
  },
  networks: {
    main: getNetworkConfig("main"),
    goerli: getNetworkConfig("goerli"),
  },
  contractSizer: {
    runOnCompile: OPTIMIZER,
  },
  gasReporter: {
    enabled: REPORT_GAS,
  },
};

export default config;
