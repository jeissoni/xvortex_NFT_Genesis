import { ethers } from "hardhat"
import { expect } from "chai"
import { BigNumber, Contract, providers, Signer, Wallet } from "ethers"
import { describe } from "mocha"



async function latest() {
    const blockNumBefore: number = await ethers.provider.getBlockNumber();
    const blockBefore = await ethers.provider.getBlock(blockNumBefore);
    const timestampBefore: BigNumber = BigNumber.from(blockBefore.timestamp);
    return (timestampBefore);
}

const duration = {
    seconds: function (val: BigNumber) { return (BigNumber.from(val)); },
    minutes: function (val: BigNumber) { return val.mul(this.seconds(BigNumber.from(60))) },
    hours: function (val: BigNumber) { return val.mul(this.minutes(BigNumber.from(60))) },
    days: function (val: BigNumber) { return val.mul(this.hours(BigNumber.from(24))) },
    weeks: function (val: BigNumber) { return val.mul(this.days(BigNumber.from(7))) },
    years: function (val: BigNumber) { return val.mul(this.days(BigNumber.from(365))) },
};


async function manySigner(_count: number) {

    let arraySigner: Wallet[] = []

    for (let i = 0; i < _count; i++) {

        let wallet: Wallet = ethers.Wallet.createRandom();

        wallet = wallet.connect(ethers.provider);

        arraySigner.push(wallet)
    }

    return { arraySigner }
}

const deploy = async () => {

    const [owner, user1, user2, user3, user4] = await ethers.getSigners()

    const lifeOutGenesisFactory = await ethers.getContractFactory("LifeOutGenesis")

    const lifeOutGenesisDeploy: Contract = await lifeOutGenesisFactory.connect(owner).deploy()

    return {
        owner, user1, user2, user3, user4,
        lifeOutGenesisDeploy
    }

}


describe.only("Life Out Genesis", () => {

    describe("Deploy smart contract", () => {

        it("initial parameters", async () => {

            const availableSupply: number = 999

            const nameNft: string = "Life Out Genesis"
            const symbol: string = "LOG"
            const { lifeOutGenesisDeploy, owner } = await deploy()

            const mintCost: BigNumber = await lifeOutGenesisDeploy.getMintCost()
            const currentTokenId: BigNumber = await lifeOutGenesisDeploy.getCurrentTokenId()

            expect(await lifeOutGenesisDeploy.name()).to.equals(nameNft)
            expect(await lifeOutGenesisDeploy.symbol()).to.equals(symbol)
            expect(await lifeOutGenesisDeploy.owner()).to.equals(owner.address)
            expect(await lifeOutGenesisDeploy.getAvailabeSupply()).to.equals(availableSupply)
            expect(await lifeOutGenesisDeploy.isStartSale()).to.equals(false)            

            expect(ethers.utils.formatEther(mintCost)).to.equals("0.3")
            expect(currentTokenId.toString()).to.equals("1")
            expect(await lifeOutGenesisDeploy.getAvailabeSupply()).to.equals(availableSupply)
     
        })
    })

    describe("change states and variables", () => {

        it("change mint costo", async () => {

            const newMintCost: BigNumber = ethers.utils.parseEther("0.2")

            const { lifeOutGenesisDeploy, owner, user1 } = await deploy()

            await expect(lifeOutGenesisDeploy.connect(user1).setMintCost(newMintCost)).
                to.be.revertedWith("Ownable: caller is not the owner");

            await lifeOutGenesisDeploy.connect(owner).setMintCost(newMintCost)

            const retunrNewMintCost: BigNumber = await lifeOutGenesisDeploy.getMintCost()

            expect(retunrNewMintCost).to.equals(newMintCost)
           
        })

        it("change count NFT firts stage", async () => {
            const newNumberFirstStage: number = 300

            const { lifeOutGenesisDeploy, owner, user1 } = await deploy()

            //revert if caller is not owner 
            await expect(lifeOutGenesisDeploy.connect(user1).setNftFirts(newNumberFirstStage)).
                to.be.revertedWith("Ownable: caller is not the owner");

            //reverse if number is greater than total supply - nft sold
            await expect(lifeOutGenesisDeploy.connect(owner).setNftFirts(1000)).
                to.be.revertedWith("SetNumberNftInvalid");

            await lifeOutGenesisDeploy.connect(owner).setNftFirts(newNumberFirstStage)

            const retunrNftFirts: BigNumber = await lifeOutGenesisDeploy.getNftFirts()

            expect(retunrNftFirts).to.equals(newNumberFirstStage)

        })

        it("change count NFT Second stage", async () => {
            const newNumberStage: number = 400

            const { lifeOutGenesisDeploy, owner, user1 } = await deploy()

            //revert if caller is not owner 
            await expect(lifeOutGenesisDeploy.connect(user1).setNftSecond(newNumberStage)).
                to.be.revertedWith("Ownable: caller is not the owner");

            //reverse if number is greater than total supply - nft sold
            await expect(lifeOutGenesisDeploy.connect(owner).setNftSecond(1000)).
                to.be.revertedWith("SetNumberNftInvalid");

            await lifeOutGenesisDeploy.connect(owner).setNftSecond(newNumberStage)

            const retunrNft: BigNumber = await lifeOutGenesisDeploy.getNftSecond()

            expect(retunrNft).to.equals(newNumberStage)

        })

        it("change count NFT Third stage", async () => {

            const newNumberStage: number = 400

            const { lifeOutGenesisDeploy, owner, user1 } = await deploy()

            //revert if caller is not owner 
            await expect(lifeOutGenesisDeploy.connect(user1).setNftThird(newNumberStage)).
                to.be.revertedWith("Ownable: caller is not the owner");

            //reverse if number is greater than total supply - nft sold
            await expect(lifeOutGenesisDeploy.connect(owner).setNftThird(1000)).
                to.be.revertedWith("SetNumberNftInvalid");

            await lifeOutGenesisDeploy.connect(owner).setNftThird(newNumberStage)

            const retunrNft: BigNumber = await lifeOutGenesisDeploy.getnftThird()

            expect(retunrNft).to.equals(newNumberStage)
          

        })


        describe("change state", () => {

            describe("First state", ()=>{

                it("set first state", async () => {

                    const { lifeOutGenesisDeploy, owner, user1 } = await deploy()
    
                    await expect(lifeOutGenesisDeploy.connect(user1).setStartFirstStage()).
                        to.be.revertedWith("Ownable: caller is not the owner")
    
                    await lifeOutGenesisDeploy.connect(owner).setStartFirstStage()
    
                    const isStartFirstStage: boolean = await lifeOutGenesisDeploy.isStartFirstStage()
                    const isStartSecondStage: boolean = await lifeOutGenesisDeploy.isStartSecondStage()
                    const isStartThirdStage: boolean = await lifeOutGenesisDeploy.isStartThirdStage()
                    expect(isStartFirstStage).to.equals(true)
                    expect(isStartSecondStage).to.equals(false)
                    expect(isStartThirdStage).to.equals(false)   
             
                })

                describe("set first stage public sale", ()=>{

                    it("revert set Public Sale First Stage if caller if not owner",async () => {
                
                        const { lifeOutGenesisDeploy, user1 } = await deploy()
        
                        await expect(lifeOutGenesisDeploy.connect(user1).setPublicSaleSecondStage(true, 1652218191)).
                        to.be.revertedWith("Ownable: caller is not the owner");
                    })
        
                    it("revert id end date is invalided",async () => {
                        const { lifeOutGenesisDeploy, owner } = await deploy()
        
                        const lastBlockTime : BigNumber = await latest()
        
                        await expect(lifeOutGenesisDeploy.connect(owner)
                            .setPublicSaleSecondStage(true, lastBlockTime.sub(1000)))
                            .to.be.revertedWith('DateInvalid')
                    })       
                    
                })

            })

            describe("Second state", ()=>{
                
                it("set second state", async () => {

                    const { lifeOutGenesisDeploy, owner, user1 } = await deploy()
    
                    await expect(lifeOutGenesisDeploy.connect(user1).setStartSecondStage()).
                        to.be.revertedWith("Ownable: caller is not the owner")
    
                    await lifeOutGenesisDeploy.connect(owner).setStartSecondStage()
    
                    const isStartFirstStage: boolean = await lifeOutGenesisDeploy.isStartFirstStage()
                    const isStartSecondStage: boolean = await lifeOutGenesisDeploy.isStartSecondStage()
                    const isStartThirdStage: boolean = await lifeOutGenesisDeploy.isStartThirdStage()
                    expect(isStartFirstStage).to.equals(false)
                    expect(isStartSecondStage).to.equals(true)
                    expect(isStartThirdStage).to.equals(false)
    
                
                })

                describe("set second stage public sale", ()=>{

                    it("start Public Sale Second Stage by owner",async () => {
                        const { lifeOutGenesisDeploy, owner } = await deploy()
        
                        const lastBlockTime : BigNumber = await latest()
                        const state : boolean = true
                        
                        await lifeOutGenesisDeploy.connect(owner).setPublicSaleSecondStage(
                            state,
                            lastBlockTime.mul(5)
                        )

                        const stateAfter : boolean = await lifeOutGenesisDeploy.isStartPublicSaleSecondSatge()
                        expect(stateAfter).to.equals(state)
                       
                    })
    
                    it("stop Public Sale Second Satege by owner" ,async () => {
                        const { lifeOutGenesisDeploy, owner } = await deploy()
        
                        const lastBlockTime : BigNumber = await latest()
                        const state : boolean = false

                        await lifeOutGenesisDeploy.connect(owner).setPublicSaleSecondStage(
                            state,
                            lastBlockTime.mul(5)
                        )

                        const stateAfter : boolean = await lifeOutGenesisDeploy.isStartPublicSaleSecondSatge()
                        expect(stateAfter).to.equals(state)
                    })
                })
            })

            describe("Third state", ()=>{
                
                it("set third state", async () => {

                    const { lifeOutGenesisDeploy, owner, user1 } = await deploy()
    
                    await expect(lifeOutGenesisDeploy.connect(user1).setStartThirdStage()).
                        to.be.revertedWith("Ownable: caller is not the owner")
    
                    await lifeOutGenesisDeploy.connect(owner).setStartThirdStage()
    
                    const isStartFirstStage: boolean = await lifeOutGenesisDeploy.isStartFirstStage()
                    const isStartSecondStage: boolean = await lifeOutGenesisDeploy.isStartSecondStage()
                    const isStartThirdStage: boolean = await lifeOutGenesisDeploy.isStartThirdStage()
                    expect(isStartFirstStage).to.equals(false)
                    expect(isStartSecondStage).to.equals(false)
                    expect(isStartThirdStage).to.equals(true)
                       
                })

            }) 

        })

    })

    describe("withdraw Proceeds", () => {

        it("cannot be invoked if you are not the owner of the contract", async () => {
            const { lifeOutGenesisDeploy, user1, user2, user3, user4 } = await deploy()

            const amount: BigNumber = ethers.utils.parseEther("1.0")

            await user1.sendTransaction({
                to: lifeOutGenesisDeploy.address,
                value: amount
            });
            await user2.sendTransaction({
                to: lifeOutGenesisDeploy.address,
                value: amount
            });
            await user3.sendTransaction({
                to: lifeOutGenesisDeploy.address,
                value: amount
            });
            await user4.sendTransaction({
                to: lifeOutGenesisDeploy.address,
                value: amount
            });

            const balanceContract: BigNumber = await ethers.provider.getBalance(lifeOutGenesisDeploy.address)

            expect(balanceContract).to.equals(amount.mul(4))

            await expect(lifeOutGenesisDeploy.connect(user1).withdrawProceeds()).
                to.be.revertedWith("Ownable: caller is not the owner")
        })

        it("claim the founds only by owner", async () => {

            const { lifeOutGenesisDeploy, owner, user1, user2, user3, user4 } = await deploy()

            const amount: BigNumber = ethers.utils.parseEther("1.0")

            await user1.sendTransaction({
                to: lifeOutGenesisDeploy.address,
                value: amount
            });
            await user2.sendTransaction({
                to: lifeOutGenesisDeploy.address,
                value: amount
            });
            await user3.sendTransaction({
                to: lifeOutGenesisDeploy.address,
                value: amount
            });
            await user4.sendTransaction({
                to: lifeOutGenesisDeploy.address,
                value: amount
            });

            const balanceContract: BigNumber = await ethers.provider.getBalance(lifeOutGenesisDeploy.address)

            expect(balanceContract).to.equals(amount.mul(4))

            const balanceOwnerBefore: BigNumber = await ethers.provider.getBalance(owner.address)

            const tx = await lifeOutGenesisDeploy.connect(owner).withdrawProceeds()
            const gasUsed: BigNumber = (await tx.wait()).gasUsed
            const gasPrice: BigNumber = tx.gasPrice
            var gasCost: BigNumber = gasUsed.mul(gasPrice)

            const balanceOwnerAfter: BigNumber = await ethers.provider.getBalance(owner.address)

            expect(balanceOwnerAfter).to.equals(balanceOwnerBefore.add(balanceContract).sub(gasCost))
            expect(await ethers.provider.getBalance(lifeOutGenesisDeploy.address)).to.equals(ethers.constants.Zero)

        })

        it("emit event WithdrawProceeds", async () => {

            const { lifeOutGenesisDeploy, owner, user1, user2, user3, user4 } = await deploy()

            const amount: BigNumber = ethers.utils.parseEther("1.0")

            await user1.sendTransaction({
                to: lifeOutGenesisDeploy.address,
                value: amount
            });
            await user2.sendTransaction({
                to: lifeOutGenesisDeploy.address,
                value: amount
            });
            await user3.sendTransaction({
                to: lifeOutGenesisDeploy.address,
                value: amount
            });
            await user4.sendTransaction({
                to: lifeOutGenesisDeploy.address,
                value: amount
            });

            await expect(lifeOutGenesisDeploy.connect(owner).withdrawProceeds())
                .to.emit(lifeOutGenesisDeploy, 'WithdrawProceeds')
                .withArgs(owner.address, amount.mul(4))
        })


    })

    describe("white list", () => {

        describe("first stage", () => {

            describe("add white list first stage", () => {

                it("cannot be added to the list if the caller is not the owner", async () => {

                    const { lifeOutGenesisDeploy, user1 } = await deploy()

                    await expect(lifeOutGenesisDeploy.connect(user1).addListWhiteListFirstStage([user1.address])).
                        to.be.revertedWith("Ownable: caller is not the owner")

                })

                it("insert one address to list by owner", async () => {

                    const { lifeOutGenesisDeploy, owner, user1 } = await deploy()

                    await expect(lifeOutGenesisDeploy.connect(owner).addListWhiteListFirstStage([user1.address]))
                        .to.emit(lifeOutGenesisDeploy, 'AddWhiteListFirstStage')
                        .withArgs(owner.address, user1.address)

                    const isWhiteListUser1: boolean = await lifeOutGenesisDeploy.isWhiteListFirstStage(user1.address)

                    expect(isWhiteListUser1).to.equals(true)

                })

                it("cannot add a list of addresses greater than the number of NFTs available in the stage", async () => {
                    const { lifeOutGenesisDeploy, owner } = await deploy()

                    const { arraySigner } = await manySigner(334)

                    const arrayAddress: string[] = arraySigner.map((x) => {
                        return x.address
                    })

                    await expect(lifeOutGenesisDeploy.connect(owner).
                        addListWhiteListFirstStage(arrayAddress)).
                        to.be.revertedWith('ListToAddInWhiteListFirstIsInvalid')

                })

                it("cannot add new address if First whitelist  is already full", async () => {

                    const { lifeOutGenesisDeploy, owner, user2 } = await deploy()

                    const { arraySigner } = await manySigner(333)

                    const arrayAddress: string[] = arraySigner.map((x) => {
                        return x.address
                    })

                    await lifeOutGenesisDeploy.connect(owner).
                        addListWhiteListFirstStage(arrayAddress)

                    await expect(lifeOutGenesisDeploy.connect(owner).
                        addListWhiteListFirstStage([user2.address])).
                        to.be.revertedWith('WhiteListFirstIsFull')
                })

                it("insert list address by owner", async () => {

                    const { lifeOutGenesisDeploy, owner } = await deploy()

                    const { arraySigner } = await manySigner(333)

                    const arrayAddress: string[] = arraySigner.map((x) => {
                        return x.address
                    })

                    await lifeOutGenesisDeploy.connect(owner).addListWhiteListFirstStage(arrayAddress)

                    for (let i = 0; i < arrayAddress.length; i++) {
                        expect(await lifeOutGenesisDeploy.isWhiteListFirstStage(arrayAddress[i])).
                            to.equals(true)
                    }
                })
            })

            describe("delete white list first stage", () => {

                it("only addres only by owner", async () => {

                    const { lifeOutGenesisDeploy, user1 } = await deploy()

                    await expect(lifeOutGenesisDeploy.connect(user1).deleteListWhiteListFirstStage([user1.address])).
                        to.be.revertedWith("Ownable: caller is not the owner")

                })

                it("error if address not contains in white list", async () => {

                    const { lifeOutGenesisDeploy, owner, user1 } = await deploy()
                     
                    await expect(lifeOutGenesisDeploy.connect(owner).
                    deleteListWhiteListFirstStage([user1.address])).
                        to.be.revertedWith('IsNotWhiteList')

                })

                it("error is address if already Claimed NFT",async () => {
                    
                    const { lifeOutGenesisDeploy, owner, user1 } = await deploy()

                    const mintCost: BigNumber = await lifeOutGenesisDeploy.getMintCost()

                    await lifeOutGenesisDeploy.connect(owner).addListWhiteListFirstStage([user1.address])

                    await lifeOutGenesisDeploy.connect(owner).setStartFirstStage()

                    await lifeOutGenesisDeploy.connect(user1).whiteListMintFirstStage({
                        value : mintCost
                    })

                    await expect(lifeOutGenesisDeploy.connect(owner).
                    deleteListWhiteListFirstStage([user1.address])).
                    to.be.revertedWith('AddressAlreadyClaimed')
                })

                it("delete one address by owner", async () => {

                    const { lifeOutGenesisDeploy, owner, user1 } = await deploy()

                    await lifeOutGenesisDeploy.connect(owner).addListWhiteListFirstStage([user1.address])
                    const addresInWhiteListAfter : BigNumber = await lifeOutGenesisDeploy.getLengtWhiteListFirst()

                    const isWhiteListBefore: boolean = await lifeOutGenesisDeploy.isWhiteListFirstStage(user1.address)

                    await lifeOutGenesisDeploy.connect(owner).deleteListWhiteListFirstStage([user1.address])
                    const addresInWhiteListBefore : BigNumber = await lifeOutGenesisDeploy.getLengtWhiteListFirst()

                    const isWhiteListAfter: boolean = await lifeOutGenesisDeploy.isWhiteListFirstStage(user1.address)

                    expect(isWhiteListBefore).to.equals(true)
                    expect(isWhiteListAfter).to.equals(false)
                    expect(addresInWhiteListBefore).to.equal(addresInWhiteListAfter.sub(1))

                })

                it("delete list address by owner", async () => {

                    const numberAddress: number = 333

                    const { lifeOutGenesisDeploy, owner } = await deploy()

                    const { arraySigner } = await manySigner(numberAddress)

                    const arrayAddress: string[] = arraySigner.map((x) => {
                        return x.address
                    })

                    await lifeOutGenesisDeploy.connect(owner).addListWhiteListFirstStage(arrayAddress)
                    const addresInWhiteListAfter : BigNumber = await lifeOutGenesisDeploy.getLengtWhiteListFirst()

                    for (let i = 0; i < arrayAddress.length; i++) {

                        expect(await lifeOutGenesisDeploy.isWhiteListFirstStage(arrayAddress[i])).
                            to.equals(true)

                    }

                    await lifeOutGenesisDeploy.connect(owner).deleteListWhiteListFirstStage(arrayAddress)
                    const addresInWhiteListBefore : BigNumber = await lifeOutGenesisDeploy.getLengtWhiteListFirst()

                    for (let i = 0; i < arrayAddress.length; i++) {

                        expect(await lifeOutGenesisDeploy.isWhiteListFirstStage(arrayAddress[i])).
                            to.equals(false)

                    }

                    expect(addresInWhiteListBefore).to.equals(addresInWhiteListAfter.sub(numberAddress))

                })

            })

        })

        describe("Second Stage", () => {

            describe("add white list Second stage", () => {

                it("cannot be added to the list if the caller is not the owner", async () => {

                    const { lifeOutGenesisDeploy, user1 } = await deploy()

                    await expect(lifeOutGenesisDeploy.connect(user1).addListWhiteListSecondStage([user1.address])).
                        to.be.revertedWith("Ownable: caller is not the owner")

                })

                it("insert one address to list by owner", async () => {

                    const { lifeOutGenesisDeploy, owner, user1 } = await deploy()

                    await expect(lifeOutGenesisDeploy.connect(owner).addListWhiteListSecondStage([user1.address]))
                        .to.emit(lifeOutGenesisDeploy, 'AddWhiteListSecondStage')
                        .withArgs(owner.address, user1.address)

                    const isWhiteListUser1: boolean = await lifeOutGenesisDeploy.isWhiteListSecondStage(user1.address)

                    expect(isWhiteListUser1).to.equals(true)

                })


                it("cannot add a list of addresses greater than the number of NFTs available in the stage", async () => {

                    const { lifeOutGenesisDeploy, owner } = await deploy()

                    const { arraySigner } = await manySigner(334)

                    const arrayAddress: string[] = arraySigner.map((x) => {
                        return x.address
                    })

                    await expect(lifeOutGenesisDeploy.connect(owner).
                        addListWhiteListSecondStage(arrayAddress)).
                        to.be.revertedWith('ListToAddInWhiteListSecondIsInvalid')

                })

                it("cannot add new address if second whitelist  is already full", async () => {

                    const { lifeOutGenesisDeploy, owner, user2 } = await deploy()

                    const { arraySigner } = await manySigner(333)

                    const arrayAddress: string[] = arraySigner.map((x) => {
                        return x.address
                    })

                    await lifeOutGenesisDeploy.connect(owner).
                        addListWhiteListSecondStage(arrayAddress)

                    await expect(lifeOutGenesisDeploy.connect(owner).
                        addListWhiteListSecondStage([user2.address])).
                        to.be.revertedWith('WhiteListSecondIsFull')
                })

                it("insert list address by owner", async () => {

                    const { lifeOutGenesisDeploy, owner } = await deploy()

                    const { arraySigner } = await manySigner(333)

                    const arrayAddress: string[] = arraySigner.map((x) => {
                        return x.address
                    })

                    await lifeOutGenesisDeploy.connect(owner).addListWhiteListSecondStage(arrayAddress)

                    for (let i = 0; i < arrayAddress.length; i++) {
                        expect(await lifeOutGenesisDeploy.isWhiteListSecondStage(arrayAddress[i])).
                            to.equals(true)
                    }
                })                
            })

            describe("delete white list Second stage", () => {

                it("only addres only by owner", async () => {

                    const { lifeOutGenesisDeploy, user1 } = await deploy()

                    await expect(lifeOutGenesisDeploy.connect(user1).deleteListWhiteListSecondStage([user1.address])).
                        to.be.revertedWith("Ownable: caller is not the owner")

                })

                it("error if address not contains in white list", async () => {

                    const { lifeOutGenesisDeploy, owner, user1 } = await deploy()

                    await expect(lifeOutGenesisDeploy.connect(owner).
                        deleteListWhiteListSecondStage([user1.address])).
                        to.be.revertedWith('IsNotWhiteList')
                })

                it("error is address if already Claimed NFT",async () => {
                
                    const { lifeOutGenesisDeploy, owner, user1 } = await deploy()

                    const mintCost: BigNumber = await lifeOutGenesisDeploy.getMintCost()

                    await lifeOutGenesisDeploy.connect(owner).addListWhiteListSecondStage([user1.address])

                    await lifeOutGenesisDeploy.connect(owner).setStartSecondStage()

                    await lifeOutGenesisDeploy.connect(user1).whiteListMintSecondStage({
                        value : mintCost
                    })

                    await expect(lifeOutGenesisDeploy.connect(owner).
                    deleteListWhiteListSecondStage([user1.address])).
                    to.be.revertedWith('AddressAlreadyClaimed')
                })

                it("delete one address by owner", async () => {

                    const { lifeOutGenesisDeploy, owner, user1 } = await deploy()

                    await lifeOutGenesisDeploy.connect(owner).addListWhiteListSecondStage([user1.address])
                    const addresInWhiteListAfter : BigNumber = await lifeOutGenesisDeploy.getLengtWhiteListSecond()

                    const isWhiteListBefore: boolean = await lifeOutGenesisDeploy.isWhiteListSecondStage(user1.address)

                    await lifeOutGenesisDeploy.connect(owner).deleteListWhiteListSecondStage([user1.address])
                    const addresInWhiteListBefore : BigNumber = await lifeOutGenesisDeploy.getLengtWhiteListSecond()

                    const isWhiteListAfter: boolean = await lifeOutGenesisDeploy.isWhiteListSecondStage(user1.address)

                    expect(isWhiteListBefore).to.equals(true)
                    expect(isWhiteListAfter).to.equals(false)
                    expect(addresInWhiteListBefore).to.equals(addresInWhiteListAfter.sub(1))

                })

                it("delete list address by owner", async () => {

                    const numberAddress: number = 333

                    const { lifeOutGenesisDeploy, owner } = await deploy()

                    const { arraySigner } = await manySigner(numberAddress)

                    const arrayAddress: string[] = arraySigner.map((x) => {
                        return x.address
                    })

                    await lifeOutGenesisDeploy.connect(owner).addListWhiteListSecondStage(arrayAddress)
                    const addresInWhiteListAfter : BigNumber = await lifeOutGenesisDeploy.getLengtWhiteListSecond()

                    for (let i = 0; i < arrayAddress.length; i++) {

                        expect(await lifeOutGenesisDeploy.isWhiteListSecondStage(arrayAddress[i])).
                            to.equals(true)

                    }

                    await lifeOutGenesisDeploy.connect(owner).deleteListWhiteListSecondStage(arrayAddress)
                    const addresInWhiteListBefore : BigNumber = await lifeOutGenesisDeploy.getLengtWhiteListSecond()

                    for (let i = 0; i < arrayAddress.length; i++) {

                        expect(await lifeOutGenesisDeploy.isWhiteListSecondStage(arrayAddress[i])).
                            to.equals(false)

                    }

                    expect(addresInWhiteListBefore).to.equals(addresInWhiteListAfter.sub(numberAddress))

                })

            })
        })
    })

    describe("mint Nft", function () {

        describe("First stage", () => {

            it("revert first stage is not open", async () => {

                const { lifeOutGenesisDeploy, user1 } = await deploy()

                await expect(lifeOutGenesisDeploy.connect(user1).
                    whiteListMintFirstStage({ value: BigNumber.from(1).mul(10).pow(18) })).
                    to.be.revertedWith('StageNotOpen')

            })

            it("revert is address not withe list", async () => {

                const { lifeOutGenesisDeploy, owner, user1 } = await deploy()

                await lifeOutGenesisDeploy.connect(owner).setStartFirstStage()

                await expect(lifeOutGenesisDeploy.connect(user1).
                    whiteListMintFirstStage({ value: BigNumber.from(1).mul(10).pow(18) })).
                    to.be.revertedWith('AddressIsNotWhitleList')

            })

            it("revert is value send not is equals to mint cost", async () => {
                const { lifeOutGenesisDeploy, owner, user1 } = await deploy()

                await lifeOutGenesisDeploy.connect(owner).setStartFirstStage()

                await lifeOutGenesisDeploy.connect(owner).addListWhiteListFirstStage([user1.address])

                await expect(lifeOutGenesisDeploy.connect(user1).
                    whiteListMintFirstStage({ value: BigNumber.from(1).mul(10).pow(15) })).
                    to.be.revertedWith('IncorrectPayment')
            })

            it("revert is address already claimed", async () => {

                const { lifeOutGenesisDeploy, owner, user1 } = await deploy()

                const mintCost: BigNumber = await lifeOutGenesisDeploy.getMintCost()

                await lifeOutGenesisDeploy.connect(owner).setStartFirstStage()

                await lifeOutGenesisDeploy.connect(owner).addListWhiteListFirstStage([user1.address])

                await lifeOutGenesisDeploy.connect(user1).whiteListMintFirstStage({
                    value: mintCost
                })

                await expect(lifeOutGenesisDeploy.connect(user1).
                    whiteListMintFirstStage({ value: mintCost })).
                    to.be.revertedWith('AddressAlreadyClaimed')
            })

           

            it("claim NFT by address in white list", async () => {

                const { lifeOutGenesisDeploy, owner, user1 } = await deploy()

                const mintCost: BigNumber = await lifeOutGenesisDeploy.getMintCost()

                const currentIdToken: BigNumber = await lifeOutGenesisDeploy.getCurrentTokenId()

                await lifeOutGenesisDeploy.connect(owner).setStartFirstStage()

                await lifeOutGenesisDeploy.connect(owner).addListWhiteListFirstStage([user1.address])

                const balanceContractBefore : BigNumber = await ethers.provider.getBalance(lifeOutGenesisDeploy.address)

                await expect(lifeOutGenesisDeploy.connect(user1).whiteListMintFirstStage({
                    value: mintCost
                })).to.emit(lifeOutGenesisDeploy, 'MintNftFirtStage')
                    .withArgs(user1.address, currentIdToken)

                const balanceContractAfter : BigNumber = await ethers.provider.getBalance(lifeOutGenesisDeploy.address)

                expect(await lifeOutGenesisDeploy.getCurrentTokenId()).to.equals(currentIdToken.add(1))

                expect(await lifeOutGenesisDeploy.isWhiteListFirstStage(user1.address)).to.equals(true)

                expect(await lifeOutGenesisDeploy.ownerOf(currentIdToken)).to.equals(user1.address)

                expect(await lifeOutGenesisDeploy.balanceOf(user1.address)).to.equals(1)

                expect(balanceContractAfter).to.equals(balanceContractBefore.add(mintCost))
            })

            it("claim NFT by address in white list", async () => {

                const { lifeOutGenesisDeploy, owner, user1 } = await deploy()

                const mintCost: BigNumber = await lifeOutGenesisDeploy.getMintCost()

                const numNFtFirstStage : number = 50
                
                await lifeOutGenesisDeploy.connect(owner)
                .setNftFirts(numNFtFirstStage)

                const { arraySigner } = await manySigner(numNFtFirstStage)

                    const arrayAddress: string[] = arraySigner.map((x) => {
                        return x.address
                    })

                await lifeOutGenesisDeploy.connect(owner).addListWhiteListFirstStage(arrayAddress)

                for (let i = 0; i < arrayAddress.length; i++) {
                    
                    await user1.sendTransaction({
                        to: arrayAddress[i],
                        value: mintCost.mul(2) 
                    })
                    
                }

                const balanceContractBefore : BigNumber = await ethers.provider.getBalance(lifeOutGenesisDeploy.address)

                await lifeOutGenesisDeploy.connect(owner).setStartFirstStage()

                for (let i = 0; i < arraySigner.length; i++) {                                 

                    await expect(lifeOutGenesisDeploy.connect(arraySigner[i]).whiteListMintFirstStage({
                        value : mintCost}))
                    .to.emit(lifeOutGenesisDeploy, 'MintNftFirtStage')
                    .withArgs(arraySigner[i].address, i+1)
                    
                }

                const balanceContractAfter : BigNumber = await ethers.provider.getBalance(lifeOutGenesisDeploy.address)

                expect(balanceContractAfter).to.equals(balanceContractBefore.add(mintCost).mul(numNFtFirstStage))

            })
        })

        describe("First stage public sale", () => {
            
            describe("change states",async () => {

                it("revert set Public Sale First Stage if caller if not owner",async () => {
                
                    const { lifeOutGenesisDeploy, user1 } = await deploy()
    
                    await expect(lifeOutGenesisDeploy.connect(user1).setPublicSaleFirstStage(true, 1652218191)).
                    to.be.revertedWith("Ownable: caller is not the owner");
                })
    
                it("revert if end date is invalided",async () => {
                    const { lifeOutGenesisDeploy, owner } = await deploy()
    
                    const lastBlockTime : BigNumber = await latest()
    
                    await expect(lifeOutGenesisDeploy.connect(owner).
                    setPublicSaleFirstStage(true, lastBlockTime.sub(1000))).
                        to.be.revertedWith('DateInvalid')
                })
    
                it("start Public Sale First Stage by owner",async () => {
                    const { lifeOutGenesisDeploy, owner } = await deploy()
    
                    const lastBlockTime : BigNumber = await latest()
                    const state : boolean = true
    
                    await lifeOutGenesisDeploy.connect(owner).setPublicSaleFirstStage(
                        state,
                        lastBlockTime.mul(5)
                    )

                    const stateAfter : boolean = await lifeOutGenesisDeploy.isStartPublicSaleFirstSatge()
                    expect(stateAfter).to.equals(state)
                })

                it("stop Public Sale First Satege by owner" ,async () => {
                    const { lifeOutGenesisDeploy, owner } = await deploy()
    
                    const lastBlockTime : BigNumber = await latest()
                    const state : boolean = false
    
                    const stateAfter : boolean = await lifeOutGenesisDeploy.isStartPublicSaleFirstSatge()
                    expect(stateAfter).to.equals(state)
                })
            })

            describe("Mint First stape Public Sale", () => {
                
                it("revert if the public sale is not actived", async () => {
                    const { lifeOutGenesisDeploy, user1 } = await deploy()

                    await expect(lifeOutGenesisDeploy.connect(user1).
                    firstStagePublicSale()).
                        to.be.revertedWith('StageNotOpen')
                })

                it("revert if value send is invalid",async () => {
                    const { lifeOutGenesisDeploy, owner, user1 } = await deploy()
                    
                    const mintCost : BigNumber = await lifeOutGenesisDeploy.getMintCost()
                    
                    const lastBlockDate : BigNumber = await latest()
                    const endData: BigNumber = lastBlockDate.add(duration.days(BigNumber.from(1)))


                    await lifeOutGenesisDeploy.connect(owner).
                        setPublicSaleFirstStage(true, endData )

                    await expect(lifeOutGenesisDeploy.connect(user1).
                        firstStagePublicSale({value:mintCost.sub(1)})).
                            to.be.revertedWith('IncorrectPayment') 
                })

                it("revert if time now is greater than time end public sale",async () => {
                    const { lifeOutGenesisDeploy, owner, user1 } = await deploy()
                    
                    const mintCost : BigNumber = await lifeOutGenesisDeploy.getMintCost()
                    
                    const lastBlockDate : BigNumber = await latest()
                    const endData: BigNumber = lastBlockDate.add(duration.hours(BigNumber.from(1)))

                    await lifeOutGenesisDeploy.connect(owner).
                        setPublicSaleFirstStage(true, endData)

                    await ethers.provider.send("evm_increaseTime",
                        //[(60 * 60 * 24 * 7) + 1] // una semana + 1 segundo
                        [60 * 60 * 2] //==> 2 horas
                    )

                    await expect(lifeOutGenesisDeploy.connect(user1).
                    firstStagePublicSale({value: mintCost})).
                        to.be.revertedWith('TimePublicSaleOver') 
                })

                it("revert if all available nft were minted",async () => {
                    const { lifeOutGenesisDeploy, owner, user1 } = await deploy()
                    
                    const mintCost : BigNumber = await lifeOutGenesisDeploy.getMintCost()
                                       
                    const lastBlockDate : BigNumber = await latest()
                    const endData: BigNumber = lastBlockDate.add(duration.hours(BigNumber.from(1)))

                    await lifeOutGenesisDeploy.connect(owner).setNftFirts(2)
                    
                    await lifeOutGenesisDeploy.connect(owner).
                        setPublicSaleFirstStage(true, endData)
                    
                    for (let i = 0; i < 2; i++) {                        
                        await lifeOutGenesisDeploy.connect(user1)
                            .firstStagePublicSale({value : mintCost})                        
                    }                                                    

                    await expect(lifeOutGenesisDeploy.connect(user1).
                    firstStagePublicSale({value: mintCost})).
                        to.be.revertedWith('NftCountExceededStage')                     
                })

                it("mint all nft available",async () => {
                    const { lifeOutGenesisDeploy, owner, user1 } = await deploy()
                    
                    const mintCost : BigNumber = await lifeOutGenesisDeploy.getMintCost()
                    const numbreNftAvailable : number = 10

                    const lastBlockDate : BigNumber = await latest()
                    const endData: BigNumber = lastBlockDate.add(duration.hours(BigNumber.from(1)))

                    await lifeOutGenesisDeploy.connect(owner).setNftFirts(numbreNftAvailable)
                    
                    await lifeOutGenesisDeploy.connect(owner).
                        setPublicSaleFirstStage(true, endData)

                    for (let i = 0; i < numbreNftAvailable; i++) {                        
                     
                        await expect(lifeOutGenesisDeploy
                            .connect(user1)
                            .firstStagePublicSale(
                            {value : mintCost}
                        )).to.emit(lifeOutGenesisDeploy, 'MintPublicSaleFirstStage')
                            .withArgs(user1.address, i+1)
                    }   

                    await expect(lifeOutGenesisDeploy.connect(user1).
                        firstStagePublicSale({value: mintCost})).
                        to.be.revertedWith('NftCountExceededStage')      
                })

            })

            
        })        
        
        describe("Second stage", () => {

            it("revert Second stage is not open", async () => {

                const { lifeOutGenesisDeploy, user1 } = await deploy()

                await expect(lifeOutGenesisDeploy.connect(user1).
                    whiteListMintSecondStage({ value: BigNumber.from(1).mul(10).pow(18) })).
                    to.be.revertedWith('StageNotOpen')

            })

            it("revert is address not withe list", async () => {

                const { lifeOutGenesisDeploy, owner, user1 } = await deploy()

                await lifeOutGenesisDeploy.connect(owner).setStartSecondStage()

                await expect(lifeOutGenesisDeploy.connect(user1).
                whiteListMintSecondStage({ value: BigNumber.from(1).mul(10).pow(18) })).
                    to.be.revertedWith('AddressIsNotWhitleList')

            })

            it("revert is value send not is equals to mint cost", async () => {
                const { lifeOutGenesisDeploy, owner, user1 } = await deploy()

                await lifeOutGenesisDeploy.connect(owner).setStartSecondStage()

                await lifeOutGenesisDeploy.connect(owner).addListWhiteListSecondStage([user1.address])

                await expect(lifeOutGenesisDeploy.connect(user1).
                    whiteListMintSecondStage({ value: BigNumber.from(1).mul(10).pow(15) })).
                    to.be.revertedWith('IncorrectPayment')
            })

            it("revert is address already claimed", async () => {

                const { lifeOutGenesisDeploy, owner, user1 } = await deploy()

                const mintCost: BigNumber = await lifeOutGenesisDeploy.getMintCost()

                await lifeOutGenesisDeploy.connect(owner).setStartSecondStage()

                await lifeOutGenesisDeploy.connect(owner).addListWhiteListSecondStage([user1.address])

                await lifeOutGenesisDeploy.connect(user1).whiteListMintSecondStage({
                    value: mintCost
                })

                await expect(lifeOutGenesisDeploy.connect(user1).
                    whiteListMintSecondStage({ value: mintCost })).
                    to.be.revertedWith('AddressAlreadyClaimed')
            })

           

            it("claim NFT by address in white list", async () => {

                const { lifeOutGenesisDeploy, owner, user1 } = await deploy()

                const mintCost: BigNumber = await lifeOutGenesisDeploy.getMintCost()

                const currentIdToken: BigNumber = await lifeOutGenesisDeploy.getCurrentTokenId()

                await lifeOutGenesisDeploy.connect(owner).setStartSecondStage()

                await lifeOutGenesisDeploy.connect(owner).addListWhiteListSecondStage([user1.address])

                const balanceContractBefore : BigNumber = await ethers.provider.getBalance(lifeOutGenesisDeploy.address)

                await expect(lifeOutGenesisDeploy.connect(user1).whiteListMintSecondStage({
                    value: mintCost
                })).to.emit(lifeOutGenesisDeploy, 'MintNftSecondStage')
                    .withArgs(user1.address, currentIdToken)

                const balanceContractAfter : BigNumber = await ethers.provider.getBalance(lifeOutGenesisDeploy.address)

                expect(await lifeOutGenesisDeploy.getCurrentTokenId()).to.equals(currentIdToken.add(1))

                expect(await lifeOutGenesisDeploy.isWhiteListSecondStage(user1.address)).to.equals(true)

                expect(await lifeOutGenesisDeploy.ownerOf(currentIdToken)).to.equals(user1.address)

                expect(await lifeOutGenesisDeploy.balanceOf(user1.address)).to.equals(1)

                expect(balanceContractAfter).to.equals(balanceContractBefore.add(mintCost))
            })

            it("claim NFT by address in white list", async () => {

                const { lifeOutGenesisDeploy, owner, user1 } = await deploy()

                const mintCost: BigNumber = await lifeOutGenesisDeploy.getMintCost()

                const numNFtSecondtStage : number = 50
                
                await lifeOutGenesisDeploy.connect(owner)
                .setNftSecond(numNFtSecondtStage)

                const { arraySigner } = await manySigner(numNFtSecondtStage)

                    const arrayAddress: string[] = arraySigner.map((x) => {
                        return x.address
                    })

                await lifeOutGenesisDeploy.connect(owner).addListWhiteListSecondStage(arrayAddress)

                for (let i = 0; i < arrayAddress.length; i++) {
                    
                    await user1.sendTransaction({
                        to: arrayAddress[i],
                        value: mintCost.mul(2) 
                    })
                    
                }

                const balanceContractBefore : BigNumber = await ethers.provider.getBalance(lifeOutGenesisDeploy.address)

                await lifeOutGenesisDeploy.connect(owner).setStartSecondStage()

                for (let i = 0; i < arraySigner.length; i++) {                                 

                    await expect(lifeOutGenesisDeploy.connect(arraySigner[i]).whiteListMintSecondStage({
                        value : mintCost}))
                    .to.emit(lifeOutGenesisDeploy, 'MintNftSecondStage')
                    .withArgs(arraySigner[i].address, i+1)
                    
                }

                const balanceContractAfter : BigNumber = await ethers.provider.getBalance(lifeOutGenesisDeploy.address)

                expect(balanceContractAfter).to.equals(balanceContractBefore.add(mintCost).mul(numNFtSecondtStage))

            })
        })

        describe("Second stage public sale", () => {           
    

            describe("Mint Second stape Public Sale", () => {
                
                it("revert if the public sale is not actived", async () => {
                    const { lifeOutGenesisDeploy, user1 } = await deploy()

                    await expect(lifeOutGenesisDeploy.connect(user1)
                        .secondStagePublicSale())
                        .to.be.revertedWith('StageNotOpen')
                })

                it("revert if value send is invalid",async () => {
                    const { lifeOutGenesisDeploy, owner, user1 } = await deploy()
                    
                    const mintCost : BigNumber = await lifeOutGenesisDeploy.getMintCost()
                    
                    const lastBlockDate : BigNumber = await latest()
                    const endData: BigNumber = lastBlockDate.add(duration.days(BigNumber.from(1)))


                    await lifeOutGenesisDeploy.connect(owner)
                        .setPublicSaleSecondStage(true, endData)

                    await expect(lifeOutGenesisDeploy.connect(user1)
                        .secondStagePublicSale({value:mintCost.sub(1)}))
                        .to.be.revertedWith('IncorrectPayment') 
                })

                it("revert if time now is greater than time end public sale",async () => {
                    const { lifeOutGenesisDeploy, owner, user1 } = await deploy()
                    
                    const mintCost : BigNumber = await lifeOutGenesisDeploy.getMintCost()
                    
                    const lastBlockDate : BigNumber = await latest()
                    const endData: BigNumber = lastBlockDate.add(duration.hours(BigNumber.from(1)))

                    await lifeOutGenesisDeploy.connect(owner)
                        .setPublicSaleSecondStage(true, endData)                        

                    await ethers.provider.send("evm_increaseTime",
                        //[(60 * 60 * 24 * 7) + 1] // una semana + 1 segundo
                        [60 * 60 * 2] //==> 2 horas
                    )

                    await expect(lifeOutGenesisDeploy.connect(user1)
                        .secondStagePublicSale({value: mintCost}))
                        .to.be.revertedWith('TimePublicSaleOver') 
                })

                it("revert if all available nft were minted",async () => {
                    const { lifeOutGenesisDeploy, owner, user1 } = await deploy()
                    
                    const mintCost : BigNumber = await lifeOutGenesisDeploy.getMintCost()
                                       
                    const lastBlockDate : BigNumber = await latest()
                    const endData: BigNumber = lastBlockDate.add(duration.hours(BigNumber.from(1)))

                    await lifeOutGenesisDeploy.connect(owner).setNftSecond(2)
                    
                    await lifeOutGenesisDeploy.connect(owner)
                        .setPublicSaleSecondStage(true, endData)
                    
                    for (let i = 0; i < 2; i++) {                        
                        await lifeOutGenesisDeploy.connect(user1)
                            .secondStagePublicSale({value : mintCost})                        
                    }                                                    

                    await expect(lifeOutGenesisDeploy.connect(user1)
                        .secondStagePublicSale({value: mintCost}))
                        .to.be.revertedWith('NftCountExceededStage')                     
                })

                it("mint all nft available",async () => {
                    const { lifeOutGenesisDeploy, owner, user1 } = await deploy()
                    
                    const mintCost : BigNumber = await lifeOutGenesisDeploy.getMintCost()
                    const numbreNftAvailable : number = 10

                    const lastBlockDate : BigNumber = await latest()
                    const endData: BigNumber = lastBlockDate.add(duration.hours(BigNumber.from(1)))

                    await lifeOutGenesisDeploy.connect(owner).setNftSecond(numbreNftAvailable)
                    
                    await lifeOutGenesisDeploy.connect(owner)
                        .setPublicSaleSecondStage(true, endData)

                    const balanceContractBefore : BigNumber = await ethers.provider.getBalance(lifeOutGenesisDeploy.address)

                    for (let i = 0; i < numbreNftAvailable; i++) {                        
                     
                        await expect(lifeOutGenesisDeploy
                            .connect(user1)
                            .secondStagePublicSale(
                            {value : mintCost}
                        )).to.emit(lifeOutGenesisDeploy, 'MintPublicSaleSecondStage')
                            .withArgs(user1.address, i+1)
                    }   

                    await expect(lifeOutGenesisDeploy.connect(user1)
                        .secondStagePublicSale({value: mintCost}))
                        .to.be.revertedWith('NftCountExceededStage')  
                        
                    const balanceContractAfter : BigNumber = await ethers.provider.getBalance(lifeOutGenesisDeploy.address)
                
                    expect(balanceContractAfter).to.equals(balanceContractBefore.add(mintCost).mul(numbreNftAvailable))
                })

            })

            
        })  

        describe("Third stage", ()=>{

            it("revert set Public Sale First Stage if caller if not owner",async () => {
                
                const { lifeOutGenesisDeploy, user1 } = await deploy()
    
                await expect(lifeOutGenesisDeploy.connect(user1).thirdtStagePublicSale())
                    .to.be.revertedWith("StageNotOpen");
            }) 
            
            it("revert if value send is invalid",async () => {
                const { lifeOutGenesisDeploy, owner, user1 } = await deploy()
                
                const mintCost : BigNumber = await lifeOutGenesisDeploy.getMintCost()

                await lifeOutGenesisDeploy.connect(owner)
                    .setStartThirdStage()

                await expect(lifeOutGenesisDeploy.connect(user1)
                    .thirdtStagePublicSale({value:mintCost.sub(1)}))
                    .to.be.revertedWith('IncorrectPayment') 
            })

            it("revert if all available nft were minted",async () => {
                const { lifeOutGenesisDeploy, owner, user1 } = await deploy()
                
                const mintCost : BigNumber = await lifeOutGenesisDeploy.getMintCost()

                const numbreNftAvailable : number = 2
                                   
                await lifeOutGenesisDeploy.connect(owner).setNftThird(numbreNftAvailable)
                
                await lifeOutGenesisDeploy.connect(owner)
                    .setStartThirdStage()
                
                for (let i = 0; i < numbreNftAvailable; i++) {                        
                    await lifeOutGenesisDeploy.connect(user1)
                        .thirdtStagePublicSale({value : mintCost})                        
                }                                                    

                await expect(lifeOutGenesisDeploy.connect(user1).
                thirdtStagePublicSale({value: mintCost})).
                    to.be.revertedWith('NftCountExceededStage')                     
            })

            it("mint all nft available",async () => {
                const { lifeOutGenesisDeploy, owner, user1 } = await deploy()
                
                const mintCost : BigNumber = await lifeOutGenesisDeploy.getMintCost()

                const numbreNftAvailable : number = 10
                                   
                await lifeOutGenesisDeploy.connect(owner).setNftThird(numbreNftAvailable)
                
                await lifeOutGenesisDeploy.connect(owner)
                    .setStartThirdStage()

                const balanceContractBefore : BigNumber = await ethers.provider.getBalance(lifeOutGenesisDeploy.address)
                
                for (let i = 0; i < numbreNftAvailable; i++) {                        
                  
                    await expect(lifeOutGenesisDeploy
                        .connect(user1)
                        .thirdtStagePublicSale(
                            {value : mintCost}
                        )).to.emit(lifeOutGenesisDeploy, 'MintPublicSaleThirdSatge')
                        .withArgs(user1.address, i+1)
                }      
                
                await expect(lifeOutGenesisDeploy.connect(user1)
                    .thirdtStagePublicSale({value: mintCost}))
                    .to.be.revertedWith('NftCountExceededStage')   

                const balanceContractAfter : BigNumber = await ethers.provider.getBalance(lifeOutGenesisDeploy.address)
                
                expect(balanceContractAfter).to.equals(balanceContractBefore.add(mintCost).mul(numbreNftAvailable))
            })

        })

    })

    describe("data disclosure process", ()=>{
        
        it("revert is user call is no owner",async () => {

            const { lifeOutGenesisDeploy, user1 } = await deploy()

            const baseURI :string = "https://gateway.pinata.cloud/ipfs/QmaF13LkMtLJkEMdzqB2DzRN88swjkpapAa939GX8n2doW/1.json"

            await expect(lifeOutGenesisDeploy.connect(user1).setBaseURI(baseURI)).
            to.be.revertedWith("Ownable: caller is not the owner")
        })

        it("set baseURI by owner",async () => {

            const { lifeOutGenesisDeploy, owner } = await deploy()

            const baseURI :string = "https://gateway.pinata.cloud/ipfs/QmaF13LkMtLJkEMdzqB2DzRN88swjkpapAa939GX8n2doW/1.json"

            await lifeOutGenesisDeploy.connect(owner).setBaseURI(baseURI)

            const baseURIAfter : string = await lifeOutGenesisDeploy.getBaseURI()

            expect(baseURIAfter).to.equals(baseURI)

        })

        describe("tokenURI", ()=>{
            it("return base URI is not revelad", async () => {

                const baseURI :string = "https://gateway.pinata.cloud/ipfs/QmaF13LkMtLJkEMdzqB2DzRN88swjkpapAa939GX8n2doW/1.json"

                const { lifeOutGenesisDeploy, owner, user1 } = await deploy()

                const mintCost: BigNumber = await lifeOutGenesisDeploy.getMintCost()

                await lifeOutGenesisDeploy.connect(owner).setStartFirstStage()

                await lifeOutGenesisDeploy.connect(owner).addListWhiteListFirstStage([user1.address])

                await lifeOutGenesisDeploy.connect(user1).whiteListMintFirstStage({
                    value: mintCost
                })

                await lifeOutGenesisDeploy.connect(owner).setBaseURI(baseURI)

                const tokenURI : string = await lifeOutGenesisDeploy.tokenURI(1)

                expect(baseURI).to.equals(tokenURI)
             
            })

            it("return token URI if is revelate",async () => {
                const baseURI :string = "https://gateway.pinata.cloud/ipfs/QmaF13LkMtLJkEMdzqB2DzRN88swjkpapAa939GX8n2doW/"

                const { lifeOutGenesisDeploy, owner, user1 } = await deploy()

                const mintCost: BigNumber = await lifeOutGenesisDeploy.getMintCost()

                await lifeOutGenesisDeploy.connect(owner).setStartFirstStage()

                await lifeOutGenesisDeploy.connect(owner).addListWhiteListFirstStage([user1.address])

                await lifeOutGenesisDeploy.connect(user1).whiteListMintFirstStage({
                    value: mintCost
                })

                await lifeOutGenesisDeploy.connect(owner).setBaseURI(baseURI)

                await lifeOutGenesisDeploy.connect(owner).setRevelate(true)

                const tokenURI : string = await lifeOutGenesisDeploy.tokenURI(1)

                expect(baseURI+"1.json").to.equals(tokenURI)
            })
        })
    })
})