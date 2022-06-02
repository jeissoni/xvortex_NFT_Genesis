import { task } from "hardhat/config";
import "@nomiclabs/hardhat-waffle";
import "@nomiclabs/hardhat-etherscan";
import "hardhat-gas-reporter"


require('dotenv').config()

const projeId=process.env.INFURA_PROJECT_ID
const privateKey = process.env.DEPLOYER_SIGNER_PRIVATE_KEY
const etherscanApi = process.env.ETHERSCAN_API_KEY;

task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});


module.exports = {
  solidity: "0.8.4",

  networks:{

    rinkeby:{
      url:`https://rinkeby.infura.io/v3/${projeId}`,
      accounts:[
        privateKey
      ]
    }
  },

  etherscan: {
    apiKey: etherscanApi
  },

  settings: {
    optimizer: {
      enabled: true,
      runs: 200
    }
  }
};
