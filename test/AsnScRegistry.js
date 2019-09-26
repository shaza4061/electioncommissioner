const AsnScRegistry = artifacts.require('./AsnScRegistry.sol')
const assert = require('assert')

const TEST_IPS_1 = [3524503734,3232235776];
const TEST_IPS_MASK_1 = [255,255];
const TEST_CONTRACT_ADDRESS_1 = '0x1234567890123456789012345678901234567891';
const TEST_WALLET_ADDRESS_1 = '0x1234567890123456789012345678901234567891';
const TEST_ASN_1 = 123;

const TEST_IPS_2 = [3524503735];
const TEST_IPS_MASK_2 = [255];
const TEST_CONTRACT_ADDRESS_2 = '0x1234567890123456789012345678901234567890';
const TEST_WALLET_ADDRESS_2 = '0x1234567890123456789012345678901234567890';
const TEST_ASN_2 = 456;

const TEST_ASN_LIST = [TEST_ASN_1, TEST_ASN_2];

let registryInstance;

contract("AsnScRegistry", accounts => {
  it("Should add a new member", () =>
    AsnScRegistry.deployed()
    .then(instance => {
      registryInstance = instance;
      instance.addMember(TEST_ASN_1, TEST_IPS_1, TEST_IPS_MASK_1, TEST_CONTRACT_ADDRESS_1, TEST_WALLET_ADDRESS_1);
      instance.addMember(TEST_ASN_2, TEST_IPS_2, TEST_IPS_MASK_2, TEST_CONTRACT_ADDRESS_2, TEST_WALLET_ADDRESS_2);
      return;
    })
    .then(() => registryInstance.getTotalMembers())
    .then(total => assert.equal(total.toNumber(), TEST_ASN_LIST.length, "Expected: "+ TEST_ASN_LIST + ", Actual: " +  total.toNumber()))
  );

  it("Should get managed IPAddress", () =>
    AsnScRegistry.deployed()
    .then(instance => {
      registryInstance = instance;
      return instance.getManagedIpByAsn(TEST_ASN_1);
    })
    .then(ip => {
      var managedIP = ip[0];
      var managedIPmask = ip[1];

      assert.equal(managedIP.length, TEST_IPS_1.length, "Expected: " + TEST_IPS_1.length + ", Actual: " + managedIP.length);
      assert.equal(managedIPmask.length, TEST_IPS_MASK_1.length,"Expected: "+ TEST_IPS_MASK_1.length +", Actual: " + managedIP.length);
      for(let i = 0 ; i < TEST_IPS_1.length; i++ ) {
        assert.equal(managedIP[i], TEST_IPS_1[i]);
        assert.equal(managedIPmask[i], TEST_IPS_MASK_1[i]);
      }
    })
  );

  it("Should get wallet and sc addresses", () =>
    AsnScRegistry.deployed()
    .then(instance => {
      registryInstance = instance;
      return instance.getMemberAddressesByAsn(TEST_ASN_1);
    })
    .then(addresses => {
      assert.equal(addresses[0], TEST_CONTRACT_ADDRESS_1, "Expected: "+TEST_CONTRACT_ADDRESS_1 +", Actual: " +  addresses[0]);
      assert.equal(addresses[1], TEST_WALLET_ADDRESS_1, "Expected: "+TEST_WALLET_ADDRESS_1 +", Actual: " +  addresses[1]);
    })
  );

  it("Should get all registered ASN", () =>
    AsnScRegistry.deployed()
    .then(instance => {
      registryInstance = instance;
      return instance.getRegisteredAsn();
    })
    .then(asn => {
      assert.equal(asn.length, TEST_ASN_LIST.length, "Expected: "+TEST_ASN_LIST.length +", Actual: " +  asn.length);
      for (let i = 0; i < asn.length; i++) {
        assert.equal(asn[i], TEST_ASN_LIST[i]);
      }
    })
  );

  it("Should remove an existing member", () =>
    AsnScRegistry.deployed()
    .then(instance => {
      registryInstance = instance;
      return instance.removeMember(TEST_ASN_1);
    })
    .then(() => registryInstance.getTotalMembers())
    .then(total => assert.equal(total.toNumber(), 1, "Expected: 1, Actual: " +  total.toNumber()))
    .then(() => registryInstance.getRegisteredAsn())
    .then(asn => {
      assert.equal(asn.length, 1, "Expected: 1, Actual: " +  asn.length);
      assert.equal(asn[0], TEST_ASN_2, "Expected: "+ TEST_ASN_2 +", Actual: " +  asn[0]);
    })
  );

});
