import { ethers } from "hardhat"
import { expect } from "chai"
import { BigNumber, Contract } from "ethers"
import { describe } from "mocha"


const deploy =async () => {

    const [owner, user1, user2, user3, user4] = await ethers.getSigners()

    const lifeOutGenesisFactory = await ethers.getContractFactory("LifeOutGenesis")

    const lifeOutGenesisDeploy : Contract = await lifeOutGenesisFactory.connect(owner).deploy()

    return {
        owner, user1, user2, user3, user4,
        lifeOutGenesisDeploy
    }

}


describe("Life Out Genesis", ()=>{

    describe("Deploy smart contract", () => {
        
        it("initial parameters", async () => {

            const availableSupply : number = 999
            const nftFirst : number = 333
            const nftSecond : number = 333
            const nftThird : number = 333
        
            const nameNft : string = "Life Out Genesis"
            const symbol : string = "LOG"
            const {lifeOutGenesisDeploy, owner} = await deploy()

            const mintCost : BigNumber = await lifeOutGenesisDeploy.getMintCost()
            const currentTokenId : BigNumber = await lifeOutGenesisDeploy.getCurrentTokenId()

            expect(await lifeOutGenesisDeploy.name()).to.equals(nameNft)
            expect(await lifeOutGenesisDeploy.symbol()).to.equals(symbol)
            expect(await lifeOutGenesisDeploy.owner()).to.equals(owner.address)
            expect(await lifeOutGenesisDeploy.getAvailabeSupply()).to.equals(availableSupply)
            expect(await lifeOutGenesisDeploy.isStartFirstStage()).to.equals(true)
            expect(await lifeOutGenesisDeploy.isStartSecondStage()).to.equals(false)
            expect(await lifeOutGenesisDeploy.isStartThirdStage()).to.equals(false)
            expect(await lifeOutGenesisDeploy.isStartPublicSale()).to.equals(false)
            expect(ethers.utils.formatEther(mintCost)).to.equals("0.1")
            expect(currentTokenId.toString()).to.equals("1")
            expect(await lifeOutGenesisDeploy.getNftCount()).to.equals(ethers.constants.Zero)
            expect(await lifeOutGenesisDeploy.getNftFirts()).to.equals(nftFirst)
            expect(await lifeOutGenesisDeploy.getNftSecond()).to.equals(nftSecond)
            expect(await lifeOutGenesisDeploy.getnftThird()).to.equals(nftThird)

        })
    })

    describe("change states and variables" , ()=>{

        it("change mint costo", async () => {

            const newMintCost : BigNumber = ethers.utils.parseEther("0.2")

            const {lifeOutGenesisDeploy, owner, user1} = await deploy()

            //revert if caller is not owner 
            await expect(lifeOutGenesisDeploy.connect(user1).setMintCost(newMintCost)).
            to.be.revertedWith("Ownable: caller is not the owner");

            await lifeOutGenesisDeploy.connect(owner).setMintCost(newMintCost)           

            const retunrNewMintCost : BigNumber = await lifeOutGenesisDeploy.getMintCost()
           
            expect(retunrNewMintCost).to.equals(newMintCost)

            await expect(lifeOutGenesisDeploy.connect(owner).setMintCost(newMintCost))
            .to.emit(lifeOutGenesisDeploy, 'SetMintCost')
            .withArgs(owner.address, newMintCost)
        })

        it("change count NFT firts stage", async () => {
            const newNumberFirstStage : number = 300

            const {lifeOutGenesisDeploy, owner, user1} = await deploy()

            //revert if caller is not owner 
            await expect(lifeOutGenesisDeploy.connect(user1).setNftFirts(newNumberFirstStage)).
            to.be.revertedWith("Ownable: caller is not the owner");

            //reverse if number is greater than total supply - nft sold
            await expect(lifeOutGenesisDeploy.connect(owner).setNftFirts(1000)).
            to.be.revertedWith("The new value is not valid");

            await lifeOutGenesisDeploy.connect(owner).setNftFirts(newNumberFirstStage)

            const retunrNftFirts : BigNumber = await lifeOutGenesisDeploy.getNftFirts()

            expect(retunrNftFirts).to.equals(newNumberFirstStage)

            await expect(lifeOutGenesisDeploy.connect(owner).setNftFirts(newNumberFirstStage))
            .to.emit(lifeOutGenesisDeploy, 'SetNftFirts')
            .withArgs(owner.address, newNumberFirstStage)

        })

        it("change count NFT Second stage", async () => {
            const newNumberStage : number = 400

            const {lifeOutGenesisDeploy, owner, user1} = await deploy()

            //revert if caller is not owner 
            await expect(lifeOutGenesisDeploy.connect(user1).setNftSecond(newNumberStage)).
            to.be.revertedWith("Ownable: caller is not the owner");

            //reverse if number is greater than total supply - nft sold
            await expect(lifeOutGenesisDeploy.connect(owner).setNftSecond(1000)).
            to.be.revertedWith("The new value is not valid");

            await lifeOutGenesisDeploy.connect(owner).setNftSecond(newNumberStage)

            const retunrNft : BigNumber = await lifeOutGenesisDeploy.getNftSecond()

            expect(retunrNft).to.equals(newNumberStage)

            await expect(lifeOutGenesisDeploy.connect(owner).setNftSecond(newNumberStage))
            .to.emit(lifeOutGenesisDeploy, 'SetNftSecond')
            .withArgs(owner.address, newNumberStage)

        })

        it("change count NFT Third stage", async () => {
            const newNumberStage : number = 400

            const {lifeOutGenesisDeploy, owner, user1} = await deploy()

            //revert if caller is not owner 
            await expect(lifeOutGenesisDeploy.connect(user1).setNftThird(newNumberStage)).
            to.be.revertedWith("Ownable: caller is not the owner");

            //reverse if number is greater than total supply - nft sold
            await expect(lifeOutGenesisDeploy.connect(owner).setNftThird(1000)).
            to.be.revertedWith("The new value is not valid");

            await lifeOutGenesisDeploy.connect(owner).setNftThird(newNumberStage)

            const retunrNft : BigNumber = await lifeOutGenesisDeploy.getnftThird()

            expect(retunrNft).to.equals(newNumberStage)

            await expect(lifeOutGenesisDeploy.connect(owner).setNftThird(newNumberStage))
            .to.emit(lifeOutGenesisDeploy, 'SetNftThird')
            .withArgs(owner.address, newNumberStage)

        })
    })

})