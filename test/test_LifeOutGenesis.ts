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


describe("Life Out Genesis", () => {

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

        describe("mint cost", () => {

            it("revert if caller is not owner", async () => {
                const newMintCost: BigNumber = ethers.utils.parseEther("0.2")

                const { lifeOutGenesisDeploy, owner, user1 } = await deploy()

                await expect(lifeOutGenesisDeploy.connect(user1).setMintCost(newMintCost)).
                    to.be.revertedWith("Ownable: caller is not the owner");
            })

            it("change mint cost by owner", async () => {

                const newMintCost: BigNumber = ethers.utils.parseEther("0.2")

                const { lifeOutGenesisDeploy, owner, user1 } = await deploy()

                await lifeOutGenesisDeploy.connect(owner).setMintCost(newMintCost)

                const retunrNewMintCost: BigNumber = await lifeOutGenesisDeploy.getMintCost()

                expect(retunrNewMintCost).to.equals(newMintCost)

            })

        })

        describe("start Sale", () => {

            it("revert if caller is not owner", async () => {
                const { lifeOutGenesisDeploy, owner, user1 } = await deploy()

                const value: boolean = true

                await expect(lifeOutGenesisDeploy.connect(user1).setStartSale(value)).
                    to.be.revertedWith("Ownable: caller is not the owner");

            })

            it("start sale by owner", async () => {
                const value: boolean = true

                const { lifeOutGenesisDeploy, owner, user1 } = await deploy()

                await lifeOutGenesisDeploy.connect(owner).setStartSale(value)

                const valueBefore: boolean =
                    await lifeOutGenesisDeploy.isStartSale()

                expect(valueBefore).to.equal(value)
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

    describe("mint Nft", function () {

        describe("reverts", () => {
            it("revert if sale is not start", async () => {
                const { lifeOutGenesisDeploy, user1 } = await deploy()

                const mintCost: BigNumber = await lifeOutGenesisDeploy.getMintCost()
                const getLimitNftByAddress: BigNumber = await lifeOutGenesisDeploy
                    .getLimitNftByAddress()

                await expect(lifeOutGenesisDeploy.connect(user1).mintLifeOutGenesis(
                    getLimitNftByAddress,
                    {
                        value: mintCost
                    }
                )).
                    to.be.revertedWith("NotStarSale")
            })

            it("revert if amount is max value",async () => {
                const { lifeOutGenesisDeploy, owner, user1 } = await deploy()

                const maxUint : BigNumber = ethers.constants.MaxUint256 
                const mintCost: BigNumber = await lifeOutGenesisDeploy.getMintCost()

                await lifeOutGenesisDeploy.connect(owner).setStartSale(true)

                await expect (lifeOutGenesisDeploy.connect(user1).mintLifeOutGenesis(maxUint,
                    {
                        value: mintCost.sub(1)                
                    }
                )).to.be.revertedWith("")
            })

            it("revert if value send is incorrect", async () => {
                const { lifeOutGenesisDeploy, owner, user1 } = await deploy()

                await lifeOutGenesisDeploy.connect(owner).setStartSale(true)
                const mintCost: BigNumber = await lifeOutGenesisDeploy.getMintCost()
                const getLimitNftByAddress: BigNumber = await lifeOutGenesisDeploy
                    .getLimitNftByAddress()

                await expect(lifeOutGenesisDeploy.connect(user1).mintLifeOutGenesis(
                    getLimitNftByAddress,
                    {
                        value: mintCost.sub(1)
                    }
                )).to.be.reverted

            })

            it("revert if amount is invalided ", async () => {
                const { lifeOutGenesisDeploy, owner, user1 } = await deploy()

                await lifeOutGenesisDeploy.connect(owner).setStartSale(true)

                const mintCost: BigNumber = await lifeOutGenesisDeploy.getMintCost()

                const getLimitNftByAddress: BigNumber = await lifeOutGenesisDeploy
                    .getLimitNftByAddress()

                await expect(lifeOutGenesisDeploy.connect(user1).mintLifeOutGenesis(
                    getLimitNftByAddress.add(5),
                    {
                        value: mintCost.sub(1)
                    }
                )).to.be.revertedWith("IncorrectPayment")
            })

            it("revert if amount nft is invalided" ,async () => {
                const { lifeOutGenesisDeploy, owner, user1, user2 } = await deploy()

                await lifeOutGenesisDeploy.connect(owner).setStartSale(true)

                const mintCost: BigNumber = await lifeOutGenesisDeploy.getMintCost()

                const getLimitNftByAddress: BigNumber = await lifeOutGenesisDeploy
                    .getLimitNftByAddress()

                    await expect(lifeOutGenesisDeploy.connect(user1).mintLifeOutGenesis(
                        getLimitNftByAddress.add(1),
                        {
                            value: getLimitNftByAddress.add(1).mul(mintCost)
                        }
                    )).to.be.revertedWith("NftLimitAddress")

                    await lifeOutGenesisDeploy.connect(user1)
                        .mintLifeOutGenesis(
                            getLimitNftByAddress.sub(1),
                            {value : getLimitNftByAddress.sub(1).mul(mintCost)}
                        )
                    await expect(lifeOutGenesisDeploy.connect(user1)
                        .mintLifeOutGenesis(
                        getLimitNftByAddress,
                            {
                                value: getLimitNftByAddress.mul(mintCost)
                            }
                        )).to.be.revertedWith("NftLimitAddress")
            })

            it("revert if nft is all sold", async () => {
                const { lifeOutGenesisDeploy,owner, user1 } = await deploy()

                await lifeOutGenesisDeploy.connect(owner).setStartSale(true)
                const mintCost: BigNumber = await lifeOutGenesisDeploy.getMintCost()
                const availableSupply : BigNumber = await lifeOutGenesisDeploy.getAvailabeSupply()
                const numberUser : string = ethers.utils.formatEther(availableSupply)
                
                const { arraySigner } = await manySigner(10)

                for(let i = 0 ; i < arraySigner.length ; i++){                   
                    await owner.sendTransaction({to: arraySigner[i].address, value: mintCost.mul(2)});
                }
               
                for(let i = 0 ; i < arraySigner.length ; i++){
                    await lifeOutGenesisDeploy.connect(arraySigner[i]).mintLifeOutGenesis(
                        1,
                        {
                            value : mintCost
                        })
                }
                
                await expect(lifeOutGenesisDeploy.connect(user1).mintLifeOutGenesis(
                    1,
                    {
                        value: mintCost
                    }
                )).to.be.revertedWith("NftSoldOut")
            })

            
        })

        it("buy limit amount", async () => {
            const { lifeOutGenesisDeploy,owner, user1 } = await deploy()

            await lifeOutGenesisDeploy.connect(owner).setStartSale(true)
            const mintCost: BigNumber = await lifeOutGenesisDeploy.getMintCost()
            const getLimitNftByAddress: BigNumber = await lifeOutGenesisDeploy
                .getLimitNftByAddress()

            await lifeOutGenesisDeploy.connect(user1).mintLifeOutGenesis(
                getLimitNftByAddress,
                {
                    value : mintCost.mul(getLimitNftByAddress)
                }
            )

            const balanceContract: BigNumber = await ethers.provider.getBalance(lifeOutGenesisDeploy.address)

            const balanceOfNft : BigNumber = await lifeOutGenesisDeploy.balanceOf(user1.address)

            const currentIdToken : BigNumber = await lifeOutGenesisDeploy.getCurrentTokenId()

            expect(balanceOfNft).to.equals(getLimitNftByAddress)

            expect(balanceContract).to.equals(mintCost.mul(getLimitNftByAddress))
            
            expect(currentIdToken.sub(1)).to.equals(5)

        })

    })

    describe("data disclosure process", () => {

        it("revert is user call is no owner", async () => {

            const { lifeOutGenesisDeploy, user1 } = await deploy()

            const baseURI: string = "https://gateway.pinata.cloud/ipfs/QmaF13LkMtLJkEMdzqB2DzRN88swjkpapAa939GX8n2doW/1.json"

            await expect(lifeOutGenesisDeploy.connect(user1).setBaseURI(baseURI)).
                to.be.revertedWith("Ownable: caller is not the owner")
        })

        it("set baseURI by owner", async () => {

            const { lifeOutGenesisDeploy, owner } = await deploy()

            const baseURI: string = "https://gateway.pinata.cloud/ipfs/QmaF13LkMtLJkEMdzqB2DzRN88swjkpapAa939GX8n2doW/1.json"

            await lifeOutGenesisDeploy.connect(owner).setBaseURI(baseURI)

            const baseURIAfter: string = await lifeOutGenesisDeploy.getBaseURI()

            expect(baseURIAfter).to.equals(baseURI)

        })

        describe("tokenURI", () => {
            it("return base URI is not revelad", async () => {

                const baseURI: string = "https://gateway.pinata.cloud/ipfs/QmaF13LkMtLJkEMdzqB2DzRN88swjkpapAa939GX8n2doW/1.json"

                const { lifeOutGenesisDeploy, owner, user1 } = await deploy()

                const mintCost: BigNumber = await lifeOutGenesisDeploy.getMintCost()

                await lifeOutGenesisDeploy.connect(owner).setStartSale(true)

                await lifeOutGenesisDeploy.connect(user1).mintLifeOutGenesis(
                    1,
                    {
                        value: mintCost
                    }
                )

                await lifeOutGenesisDeploy.connect(owner).setBaseURI(baseURI)

                const tokenURI: string = await lifeOutGenesisDeploy.tokenURI(1)

                expect(baseURI).to.equals(tokenURI)

            })

            it("return token URI if is revelate", async () => {
                const baseURI: string = "https://gateway.pinata.cloud/ipfs/QmaF13LkMtLJkEMdzqB2DzRN88swjkpapAa939GX8n2doW/"

                const { lifeOutGenesisDeploy, owner, user1 } = await deploy()

                const mintCost: BigNumber = await lifeOutGenesisDeploy.getMintCost()

                await lifeOutGenesisDeploy.connect(owner).setStartSale(true)

                await lifeOutGenesisDeploy.connect(user1).mintLifeOutGenesis(
                    1,
                    {
                        value: mintCost
                    }
                )

                await lifeOutGenesisDeploy.connect(owner).setBaseURI(baseURI)

                await lifeOutGenesisDeploy.connect(owner).setRevelate(true)

                const tokenURI: string = await lifeOutGenesisDeploy.tokenURI(1)

                expect(baseURI + "1.json").to.equals(tokenURI)
            })
        })
    })
})