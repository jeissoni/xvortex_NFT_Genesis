import { ethers } from "hardhat";

const deploy = async() => {    

    const [deployer] = await ethers.getSigners();
    console.log('Deploying contrat with the account: ', deployer.address)

    const LifeOutGenesisFactory = await ethers.getContractFactory("LifeOutGenesis");
    const LifeOutGenesisDeploy = await LifeOutGenesisFactory.deploy();
   
    console.log("LifeOutGenesisDeploy at:", LifeOutGenesisDeploy.address )
}

deploy().then(()=> process.exit(0)).catch(error => {
    console.log(error);
    process.exit(1);
});
