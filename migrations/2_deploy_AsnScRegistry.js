// Fetch the Storage contract data from the Storage.json file
const AsnScRegistry = artifacts.require("AsnScRegistry.sol");

const _asn = [999,777,666];
const _ip = [web3.utils.asciiToHex("192.168.1.1/32,127.0.0.1/32"), web3.utils.asciiToHex("192.168.1.1/32,127.0.0.1/32"), web3.utils.asciiToHex("192.168.1.1/32,127.0.0.1/32")];
const _smartContractAddr = ["0x74A021dE8bd500b26333a05e96761fe323ec57ba","0x53075fbf8bd109021283d87daf643f6E8E39c0Ed","0x0289af55758F2F5bA64f8E1cd29663E78f63F295"];
const _votingAddr = ["0x74A021dE8bd500b26333a05e96761fe323ec57ba","0x53075fbf8bd109021283d87daf643f6E8E39c0Ed","0x0289af55758F2F5bA64f8E1cd29663E78f63F295"];
const _size = 3;


// JavaScript export
module.exports = function(deployer, network) {
    // Deployer is the Truffle wrapper for deploying
    // contracts to the network

    // Deploy the contract to the network
    deployer.deploy(AsnScRegistry, _asn, _ip, _smartContractAddr, _votingAddr, _size);
}
