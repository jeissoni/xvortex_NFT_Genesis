import { ethers } from "hardhat"
import { expect } from "chai"
import { BigNumber, Contract, Signer, Wallet } from "ethers"
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


describe("Life Out Genesis", () => {

    describe("Deploy smart contract", () => {

        it("initial parameters", async () => {

            const availableSupply: number = 999
            const nftFirst: number = 333
            const nftSecond: number = 333
            const nftThird: number = 333

            const nameNft: string = "Life Out Genesis"
            const symbol: string = "LOG"
            const { lifeOutGenesisDeploy, owner } = await deploy()

            const mintCost: BigNumber = await lifeOutGenesisDeploy.getMintCost()
            const currentTokenId: BigNumber = await lifeOutGenesisDeploy.getCurrentTokenId()

            expect(await lifeOutGenesisDeploy.name()).to.equals(nameNft)
            expect(await lifeOutGenesisDeploy.symbol()).to.equals(symbol)
            expect(await lifeOutGenesisDeploy.owner()).to.equals(owner.address)
            expect(await lifeOutGenesisDeploy.getAvailabeSupply()).to.equals(availableSupply)
            expect(await lifeOutGenesisDeploy.isStartFirstStage()).to.equals(false)
            expect(await lifeOutGenesisDeploy.isStartSecondStage()).to.equals(false)
            expect(await lifeOutGenesisDeploy.isStartThirdStage()).to.equals(false)
            //expect(await lifeOutGenesisDeploy.isStartPublicSale()).to.equals(false)

            expect(await lifeOutGenesisDeploy.getStartPublicSale()).to.equals(ethers.constants.Zero)
            expect(await lifeOutGenesisDeploy.getEndPublicSale()).to.equals(ethers.constants.Zero)
            expect(ethers.utils.formatEther(mintCost)).to.equals("0.1")
            expect(currentTokenId.toString()).to.equals("1")
            expect(await lifeOutGenesisDeploy.getNftCount()).to.equals(ethers.constants.Zero)
            expect(await lifeOutGenesisDeploy.getNftFirts()).to.equals(nftFirst)
            expect(await lifeOutGenesisDeploy.getNftSecond()).to.equals(nftSecond)
            expect(await lifeOutGenesisDeploy.getnftThird()).to.equals(nftThird)

        })
    })

    describe("change states and variables", () => {

        it("change mint costo", async () => {

            const newMintCost: BigNumber = ethers.utils.parseEther("0.2")

            const { lifeOutGenesisDeploy, owner, user1 } = await deploy()

            //revert if caller is not owner 
            await expect(lifeOutGenesisDeploy.connect(user1).setMintCost(newMintCost)).
                to.be.revertedWith("Ownable: caller is not the owner");

            await lifeOutGenesisDeploy.connect(owner).setMintCost(newMintCost)

            const retunrNewMintCost: BigNumber = await lifeOutGenesisDeploy.getMintCost()

            expect(retunrNewMintCost).to.equals(newMintCost)

            await expect(lifeOutGenesisDeploy.connect(owner).setMintCost(newMintCost))
                .to.emit(lifeOutGenesisDeploy, 'SetMintCost')
                .withArgs(owner.address, newMintCost)
        })

        it("change count NFT firts stage", async () => {
            const newNumberFirstStage: number = 300

            const { lifeOutGenesisDeploy, owner, user1 } = await deploy()

            //revert if caller is not owner 
            await expect(lifeOutGenesisDeploy.connect(user1).setNftFirts(newNumberFirstStage)).
                to.be.revertedWith("Ownable: caller is not the owner");

            //reverse if number is greater than total supply - nft sold
            await expect(lifeOutGenesisDeploy.connect(owner).setNftFirts(1000)).
                to.be.revertedWith("The new value is not valid");

            await lifeOutGenesisDeploy.connect(owner).setNftFirts(newNumberFirstStage)

            const retunrNftFirts: BigNumber = await lifeOutGenesisDeploy.getNftFirts()

            expect(retunrNftFirts).to.equals(newNumberFirstStage)

            await expect(lifeOutGenesisDeploy.connect(owner).setNftFirts(newNumberFirstStage))
                .to.emit(lifeOutGenesisDeploy, 'SetNftFirts')
                .withArgs(owner.address, newNumberFirstStage)

        })

        it("change count NFT Second stage", async () => {
            const newNumberStage: number = 400

            const { lifeOutGenesisDeploy, owner, user1 } = await deploy()

            //revert if caller is not owner 
            await expect(lifeOutGenesisDeploy.connect(user1).setNftSecond(newNumberStage)).
                to.be.revertedWith("Ownable: caller is not the owner");

            //reverse if number is greater than total supply - nft sold
            await expect(lifeOutGenesisDeploy.connect(owner).setNftSecond(1000)).
                to.be.revertedWith("The new value is not valid");

            await lifeOutGenesisDeploy.connect(owner).setNftSecond(newNumberStage)

            const retunrNft: BigNumber = await lifeOutGenesisDeploy.getNftSecond()

            expect(retunrNft).to.equals(newNumberStage)

            await expect(lifeOutGenesisDeploy.connect(owner).setNftSecond(newNumberStage))
                .to.emit(lifeOutGenesisDeploy, 'SetNftSecond')
                .withArgs(owner.address, newNumberStage)

        })

        it("change count NFT Third stage", async () => {
            const newNumberStage: number = 400

            const { lifeOutGenesisDeploy, owner, user1 } = await deploy()

            //revert if caller is not owner 
            await expect(lifeOutGenesisDeploy.connect(user1).setNftThird(newNumberStage)).
                to.be.revertedWith("Ownable: caller is not the owner");

            //reverse if number is greater than total supply - nft sold
            await expect(lifeOutGenesisDeploy.connect(owner).setNftThird(1000)).
                to.be.revertedWith("The new value is not valid");

            await lifeOutGenesisDeploy.connect(owner).setNftThird(newNumberStage)

            const retunrNft: BigNumber = await lifeOutGenesisDeploy.getnftThird()

            expect(retunrNft).to.equals(newNumberStage)

            await expect(lifeOutGenesisDeploy.connect(owner).setNftThird(newNumberStage))
                .to.emit(lifeOutGenesisDeploy, 'SetNftThird')
                .withArgs(owner.address, newNumberStage)

        })


        describe("change state", () => {


            it("set first state", async () => {

                const { lifeOutGenesisDeploy, owner, user1 } = await deploy()

                //revert if caller is not owner 
                await expect(lifeOutGenesisDeploy.connect(user1).setStartFirstStage()).
                    to.be.revertedWith("Ownable: caller is not the owner")

                await lifeOutGenesisDeploy.connect(owner).setStartFirstStage()

                const isStartFirstStage: boolean = await lifeOutGenesisDeploy.isStartFirstStage()
                const isStartSecondStage: boolean = await lifeOutGenesisDeploy.isStartSecondStage()
                const isStartThirdStage: boolean = await lifeOutGenesisDeploy.isStartThirdStage()
                expect(isStartFirstStage).to.equals(true)
                expect(isStartSecondStage).to.equals(false)
                expect(isStartThirdStage).to.equals(false)

                await expect(lifeOutGenesisDeploy.connect(owner).setStartFirstStage())
                    .to.emit(lifeOutGenesisDeploy, 'SetStartFirstStage')
                    .withArgs(owner.address)
            })

            it("set second state", async () => {

                const { lifeOutGenesisDeploy, owner, user1 } = await deploy()

                //revert if caller is not owner 
                await expect(lifeOutGenesisDeploy.connect(user1).setStartSecondStage()).
                    to.be.revertedWith("Ownable: caller is not the owner")

                await lifeOutGenesisDeploy.connect(owner).setStartSecondStage()

                const isStartFirstStage: boolean = await lifeOutGenesisDeploy.isStartFirstStage()
                const isStartSecondStage: boolean = await lifeOutGenesisDeploy.isStartSecondStage()
                const isStartThirdStage: boolean = await lifeOutGenesisDeploy.isStartThirdStage()
                expect(isStartFirstStage).to.equals(false)
                expect(isStartSecondStage).to.equals(true)
                expect(isStartThirdStage).to.equals(false)

                await expect(lifeOutGenesisDeploy.connect(owner).setStartSecondStage())
                    .to.emit(lifeOutGenesisDeploy, 'SetStartSecondStage')
                    .withArgs(owner.address)
            })

            it("set third state", async () => {

                const { lifeOutGenesisDeploy, owner, user1 } = await deploy()

                //revert if caller is not owner 
                await expect(lifeOutGenesisDeploy.connect(user1).setStartThirdStage()).
                    to.be.revertedWith("Ownable: caller is not the owner")

                await lifeOutGenesisDeploy.connect(owner).setStartThirdStage()

                const isStartFirstStage: boolean = await lifeOutGenesisDeploy.isStartFirstStage()
                const isStartSecondStage: boolean = await lifeOutGenesisDeploy.isStartSecondStage()
                const isStartThirdStage: boolean = await lifeOutGenesisDeploy.isStartThirdStage()
                expect(isStartFirstStage).to.equals(false)
                expect(isStartSecondStage).to.equals(false)
                expect(isStartThirdStage).to.equals(true)

                await expect(lifeOutGenesisDeploy.connect(owner).setStartThirdStage())
                    .to.emit(lifeOutGenesisDeploy, 'SetStartThirdStage')
                    .withArgs(owner.address)
            })

            it("set dete public sale", async () => {

                const lastBlockDate: BigNumber = await latest()

                const startDate: BigNumber = lastBlockDate.add(duration.hours(BigNumber.from(1)))

                const endData: BigNumber = lastBlockDate.add(duration.days(BigNumber.from(1)))

                const { lifeOutGenesisDeploy, owner, user1 } = await deploy()

                //revert if caller is not owner 
                await expect(lifeOutGenesisDeploy.connect(user1).setPublicSale(startDate, endData)).
                    to.be.revertedWith("Ownable: caller is not the owner")

                await expect(lifeOutGenesisDeploy.connect(owner).setPublicSale(0, endData)).
                    to.be.revertedWith("start time must be greater than current time")

                await expect(lifeOutGenesisDeploy.connect(owner).setPublicSale(startDate, 0)).
                    to.be.revertedWith("end time must be greater than start time")

                await lifeOutGenesisDeploy.connect(owner).setPublicSale(startDate, endData)


                expect(await lifeOutGenesisDeploy.getStartPublicSale()).to.equals(startDate)
                expect(await lifeOutGenesisDeploy.getEndPublicSale()).to.equals(endData)

                await expect(lifeOutGenesisDeploy.connect(owner).setPublicSale(startDate, endData))
                    .to.emit(lifeOutGenesisDeploy, 'SetStartPublicSale')
                    .withArgs(owner.address, startDate, endData)
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

                    const isWhiteListBefore: boolean = await lifeOutGenesisDeploy.isWhiteListFirstStage(user1.address)

                    await lifeOutGenesisDeploy.connect(owner).deleteListWhiteListFirstStage([user1.address])

                    const isWhiteListAfter: boolean = await lifeOutGenesisDeploy.isWhiteListFirstStage(user1.address)

                    expect(isWhiteListBefore).to.equals(true)
                    expect(isWhiteListAfter).to.equals(false)

                })

                it("delete list address by owner", async () => {

                    const numberAddress: number = 333

                    const { lifeOutGenesisDeploy, owner } = await deploy()

                    const { arraySigner } = await manySigner(numberAddress)

                    const arrayAddress: string[] = arraySigner.map((x) => {
                        return x.address
                    })

                    await lifeOutGenesisDeploy.connect(owner).addListWhiteListFirstStage(arrayAddress)

                    for (let i = 0; i < arrayAddress.length; i++) {

                        expect(await lifeOutGenesisDeploy.isWhiteListFirstStage(arrayAddress[i])).
                            to.equals(true)

                    }

                    await lifeOutGenesisDeploy.connect(owner).deleteListWhiteListFirstStage(arrayAddress)

                    for (let i = 0; i < arrayAddress.length; i++) {

                        expect(await lifeOutGenesisDeploy.isWhiteListFirstStage(arrayAddress[i])).
                            to.equals(false)

                    }


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
    
                        await lifeOutGenesisDeploy.connect(user1).whiteListMintSecondtStage({
                            value : mintCost
                        })
    
                        await expect(lifeOutGenesisDeploy.connect(owner).
                        deleteListWhiteListSecondStage([user1.address])).
                        to.be.revertedWith('AddressAlreadyClaimed')
                    })

                    it("delete one address by owner", async () => {

                        const { lifeOutGenesisDeploy, owner, user1 } = await deploy()

                        await lifeOutGenesisDeploy.connect(owner).addListWhiteListSecondStage([user1.address])

                        const isWhiteListBefore: boolean = await lifeOutGenesisDeploy.isWhiteListSecondStage(user1.address)

                        await lifeOutGenesisDeploy.connect(owner).deleteListWhiteListSecondStage([user1.address])

                        const isWhiteListAfter: boolean = await lifeOutGenesisDeploy.isWhiteListSecondStage(user1.address)

                        expect(isWhiteListBefore).to.equals(true)
                        expect(isWhiteListAfter).to.equals(false)

                    })

                    it("delete list address by owner", async () => {

                        const numberAddress: number = 333

                        const { lifeOutGenesisDeploy, owner } = await deploy()

                        const { arraySigner } = await manySigner(numberAddress)

                        const arrayAddress: string[] = arraySigner.map((x) => {
                            return x.address
                        })

                        await lifeOutGenesisDeploy.connect(owner).addListWhiteListSecondStage(arrayAddress)

                        for (let i = 0; i < arrayAddress.length; i++) {

                            expect(await lifeOutGenesisDeploy.isWhiteListSecondStage(arrayAddress[i])).
                                to.equals(true)

                        }

                        await lifeOutGenesisDeploy.connect(owner).deleteListWhiteListSecondStage(arrayAddress)

                        for (let i = 0; i < arrayAddress.length; i++) {

                            expect(await lifeOutGenesisDeploy.isWhiteListSecondStage(arrayAddress[i])).
                                to.equals(false)

                        }

                    })

                })
            })
        })
    })

    describe("mint Nft", function () {

        this.timeout(0)

        
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
                })).to.emit(lifeOutGenesisDeploy, 'MintNftFirtsStage')
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
                    .to.emit(lifeOutGenesisDeploy, 'MintNftFirtsStage')
                    .withArgs(arraySigner[i].address, i+1)
                    
                }

                const balanceContractAfter : BigNumber = await ethers.provider.getBalance(lifeOutGenesisDeploy.address)

                expect(balanceContractAfter).to.equals(balanceContractBefore.add(mintCost).mul(numNFtFirstStage))

            })
        })

        describe.only("First stage public sale", () => {
            it("revert set Public Sale First Stage if caller if not owner",async () => {
                
                const { lifeOutGenesisDeploy, user1 } = await deploy()

                await expect(lifeOutGenesisDeploy.connect(user1).setPublicSaleFirstStage(true, 1652218191)).
                to.be.revertedWith("Ownable: caller is not the owner");

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
                })).to.emit(lifeOutGenesisDeploy, 'MintNftFirtsStage')
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
                    .to.emit(lifeOutGenesisDeploy, 'MintNftFirtsStage')
                    .withArgs(arraySigner[i].address, i+1)
                    
                }

                const balanceContractAfter : BigNumber = await ethers.provider.getBalance(lifeOutGenesisDeploy.address)

                expect(balanceContractAfter).to.equals(balanceContractBefore.add(mintCost).mul(numNFtSecondtStage))

            })
        })

        describe("Second stage public sale", () => {

        })



    })

})