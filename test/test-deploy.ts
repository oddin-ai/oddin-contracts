import { ethers } from 'hardhat';
import { ODDINOracleV1__factory, ODDINOracleV1 } from '../typechain-types';
import { expect } from 'chai';

describe('ODDINOracleV1', () => {
    let OddinOracleFactory: ODDINOracleV1__factory;
    let OddinOracle: ODDINOracleV1;

    beforeEach(async () => {
        OddinOracleFactory = await ethers.getContractFactory('ODDINOracleV1');
        OddinOracle = await OddinOracleFactory.deploy();
    });

    it('Should return an address for the deployed contract', () => {
        expect(OddinOracle.address).to.not.be.null;
        expect(OddinOracle.address).to.not.be.undefined;
    });

    it('Should return valid (false on not valid) for a new unseen address', async () => {
        const addr = ethers.Wallet.createRandom();
        const validity = await OddinOracle.isNotValid(addr.address);
        expect(validity[0]).to.be.false;
    });

    it('Should set value to true for address', async () => {
        const addr = ethers.Wallet.createRandom();
        const currentBlockNum = await ethers.provider.getBlockNumber();
        const currentBlock = await ethers.provider.getBlock(currentBlockNum);
        const ts = currentBlock.timestamp;
        const txResponse = await OddinOracle.setValue(addr.address, true, ts);
        await txResponse.wait(1);

        const validity = await OddinOracle.isNotValid(addr.address);
        expect(validity[0]).to.be.true;
        expect(validity[1]).to.equal(ts);
    });

    it('Should set value to false for address, stay false', async () => {
        const addr = ethers.Wallet.createRandom();
        const currentBlockNum = await ethers.provider.getBlockNumber();
        const currentBlock = await ethers.provider.getBlock(currentBlockNum);
        const ts = currentBlock.timestamp;
        const txResponse = await OddinOracle.setValue(addr.address, false, ts);
        await txResponse.wait(1);

        const validity = await OddinOracle.isNotValid(addr.address);
        expect(validity[0]).to.be.false;
        expect(validity[1]).to.equal(ts);
    });

    it('Should emit OracleUpdate with updated values', async () => {
        const addr = ethers.Wallet.createRandom();
        const currentBlockNum = await ethers.provider.getBlockNumber();
        const currentBlock = await ethers.provider.getBlock(currentBlockNum);
        const ts = currentBlock.timestamp;

        await expect(OddinOracle.setValue(addr.address, false, ts))
            .to.emit(OddinOracle, 'OracleUpdate')
            .withArgs(addr.address, false, ts);
    });

    it('Should set value and keep different address as false', async () => {
        const addr = ethers.Wallet.createRandom();
        const addr2 = ethers.Wallet.createRandom();
        const currentBlockNum = await ethers.provider.getBlockNumber();
        const currentBlock = await ethers.provider.getBlock(currentBlockNum);
        const ts = currentBlock.timestamp;
        const txResponse = await OddinOracle.setValue(addr.address, true, ts);
        await txResponse.wait(1);

        const validity = await OddinOracle.isNotValid(addr2.address);
        expect(validity[0]).to.be.false;
    });

    it('Should update oracleUpdater using only current owner', async () => {
        const addr = ethers.Wallet.createRandom();
        const txResponse = await OddinOracle.updateOracleUpdaterAddress(
            addr.address
        );
        await txResponse.wait(1);

        // try updating using the current address
        const addr2 = ethers.Wallet.createRandom();
        const currentBlockNum = await ethers.provider.getBlockNumber();
        const currentBlock = await ethers.provider.getBlock(currentBlockNum);
        const ts = currentBlock.timestamp;
        await expect(
            OddinOracle.setValue(addr2.address, true, ts)
        ).to.be.revertedWithoutReason();
    });

    it('Should emit UpdaterAddressChange with new address', async () => {
        const addr = ethers.Wallet.createRandom();
        await expect(OddinOracle.updateOracleUpdaterAddress(addr.address))
            .to.emit(OddinOracle, 'UpdaterAddressChange')
            .withArgs(addr.address);
    });

    it('Should not update oracleUpdater using random address', async () => {
        const [_owner, addr1] = await ethers.getSigners();
        await expect(
            OddinOracle.connect(addr1).updateOracleUpdaterAddress(addr1.address)
        ).to.be.revertedWithoutReason();
    });
});
