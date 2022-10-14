import { HardhatRuntimeEnvironment } from "hardhat/types";

export const preAction = (hre: HardhatRuntimeEnvironment): Promise<void> =>
  hre.run("clean").then(() => hre.run("compile").then(() => console.log("")));
