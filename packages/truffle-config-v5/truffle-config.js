const homedir = require("os").homedir;
const path = require("path");

const HDWalletProvider = require("@truffle/hdwallet-provider");

const DEFAULT_MNEMONIC =
  "explain tackle mirror kit van hammer degree position ginger unfair soup bonus";

const defaultRPC = network => `https://${network}.eth.aragon.network`;

const configFilePath = filename => path.join(homedir(), `.aragon/${filename}`);

const mnemonic = () => {
  try {
    return require(configFilePath("mnemonic.json")).mnemonic;
  } catch (e) {
    return DEFAULT_MNEMONIC;
  }
};

const settingsForNetwork = network => {
  try {
    return require(configFilePath(`${network}_key.json`));
  } catch (e) {
    return {};
  }
};

// Lazily loaded provider
const providerForNetwork = network => () => {
  let { rpc, keys } = settingsForNetwork(network);
  rpc = rpc || defaultRPC(network);

  if (!keys || keys.length === 0) {
    return new HDWalletProvider(mnemonic(), rpc);
  }

  return new HDWalletProvider(keys, rpc);
};

const mochaGasSettings = {
  reporter: "eth-gas-reporter",
  reporterOptions: {
    currency: "USD",
    gasPrice: 3
  }
};

const mocha = process.env.GAS_REPORTER ? mochaGasSettings : {};

module.exports = {
  networks: {
    rpc: {
      network_id: 15,
      host: "localhost",
      port: 8545,
      gas: 6.9e6,
      gasPrice: 15000000001
    },
    mainnet: {
      network_id: 1,
      provider: providerForNetwork("mainnet"),
      gas: 7.9e6
    },
    fuji: {
      provider: providerForNetwork('fuji'),
      network_id: "*",
      gasPrice: 225000000000,
      blockGasLimit: 8000000
    },
    ropsten: {
      network_id: 3,
      provider: providerForNetwork("ropsten"),
      gas: 7.9e6
    },
    rinkeby: {
      network_id: 4,
      provider: providerForNetwork("rinkeby"),
      gas: 6.9e6,
      gasPrice: 15000000001
    },
    kovan: {
      network_id: 42,
      provider: providerForNetwork("kovan"),
      gas: 6.9e6
    },
    coverage: {
      host: "localhost",
      network_id: "*",
      port: 8555,
      gas: 0xffffffffff,
      gasPrice: 0x01
    }
  },
  mocha,
  // Configure your compilers
  compilers: {
    solc: {
      version: "0.4.24", // A version or constraint - Ex. "^0.5.0".
                         // Can also be set to "native" to use a native solc
      // docker: true,   // Use a version obtained through docker
      settings: {
        // See the solidity docs for advice about optimization and evmVersion
        // https://solidity.readthedocs.io/en/v0.5.12/using-the-compiler.html#setting-the-evm-version-to-target
        optimizer: {
          enabled: true,
          runs: 10000   // Optimize for how many times you intend to run the code
        }
        // evmVersion: <string>   // Default: "petersburg"
      }
    }
  }
};
