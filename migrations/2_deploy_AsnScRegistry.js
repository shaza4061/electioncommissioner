// Fetch the Storage contract data from the Storage.json file
const AsnScRegistry = artifacts.require("AsnScRegistry.sol");

const _asn = [999];
const _ip = [web3.utils.asciiToHex("192.168.1.1,127.0.0.1")];
const _mask = [web3.utils.asciiToHex("255.0.0.0,255.0.0.0")];
const _smartContractAddr = ["0xFF2C4D4890d6Be87cA259a1763B08cA16Cc1f2b1"];
const _votingAddr = ["0x74A021dE8bd500b26333a05e96761fe323ec57ba"];
const _size = 1;


// JavaScript export
module.exports = function(deployer, network) {
    // Deployer is the Truffle wrapper for deploying
    // contracts to the network

    // Deploy the contract to the network
    deployer.deploy(AsnScRegistry, _asn, _ip, _mask, _smartContractAddr, _votingAddr, _size);
}
