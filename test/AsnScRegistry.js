const AsnScRegistry = artifacts.require('./AsnScRegistry.sol')
const assert = require('assert')

const ip = [3524503734,3232235776];
const mask = [255,255];
const contractAddress = '0x1234567890123456789012345678901234567891';
const walletAddress = '0x1234567890123456789012345678901234567891';
const asn = 123;

let registryInstance;

contract("AsnScRegistry", accounts => {
  it("Should add a new member", () =>
    AsnScRegistry.deployed()
    .then(instance => {
      registryInstance = instance;
      return instance.addMember(asn, ip, mask, contractAddress, walletAddress);
    })
    //.then(() => registryInstance.getTotalMembers())
    //.then(total => assert.equal(total.toNumber(), 1, "xxxxx"))
  );
});
