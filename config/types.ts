export type EnvVars = {
  readonly ALCHEMY_KEY?: string;
  readonly INFURA_KEY?: string;
  readonly OPTIMIZER: boolean;
  readonly REPORT_GAS: boolean;
  readonly PRIVATE_KEY: string;
};

export type Networks = "goerli" | "main";

export type NetworkConfig = {
  url: string;
  accounts: string[];
  chainId: number;
};
