const AsnScRegistry = artifacts.require('./AsnScRegistry.sol');
const assert = require('assert');

const TEST_IPS_1 = [web3.utils.asciiToHex("10.0.0.1/32"),web3.utils.asciiToHex("10.0.0.2/32")];
const TEST_CONTRACT_ADDRESS_1 = '0x1234567890123456789012345678901234567891';
const TEST_WALLET_ADDRESS_1 = '0x1234567890123456789012345678901234567891';
const TEST_ASN_1 = 321;

const TEST_IPS_2 = [web3.utils.asciiToHex("172.16.0.1/32"),web3.utils.asciiToHex("172.16.0.2/32")];
const TEST_CONTRACT_ADDRESS_2 = '0x1234567890123456789012345678901234567890';
const TEST_WALLET_ADDRESS_2 = '0x1234567890123456789012345678901234567890';
const TEST_ASN_2 = 456;

//This is coming from contract deployment parameter
const TEST_ASN_INITIAL_MEMBER_1 = 999;
const TEST_ASN_INITIAL_MEMBER_2 = 123;
const TEST_ASN_INITIAL_MEMBER_3 = 666;

const TEST_VOTING_ADDRESSES_INITIAL_MEMBER_1 = "0x74A021dE8bd500b26333a05e96761fe323ec57ba";
const TEST_VOTING_ADDRESSES_INITIAL_MEMBER_2 = "0x53075fbf8bd109021283d87daf643f6E8E39c0Ed";
const TEST_VOTING_ADDRESSES_INITIAL_MEMBER_3 = "0x0289af55758F2F5bA64f8E1cd29663E78f63F295";

const TEST_INITIAL_MEMBER_IPS_1 = ["192.168.1.1/32","127.0.0.1/32"];

const TEST_ASN_LIST = [TEST_ASN_INITIAL_MEMBER_1, TEST_ASN_INITIAL_MEMBER_2, TEST_ASN_INITIAL_MEMBER_3, TEST_ASN_1, TEST_ASN_2];
const TEST_VOTING_ADDRESSES_LIST = [TEST_VOTING_ADDRESSES_INITIAL_MEMBER_1, TEST_VOTING_ADDRESSES_INITIAL_MEMBER_2, TEST_VOTING_ADDRESSES_INITIAL_MEMBER_3, TEST_WALLET_ADDRESS_1, TEST_WALLET_ADDRESS_2];

const TEST_INITIAL_MEMBER_COUNT = 3;

let registryInstance;

contract("AsnScRegistry", accounts => {
  it("Should have initial member", () =>
    AsnScRegistry.deployed()
    .then(instance => {
      return instance.getTotalMembers();
    })
    .then(total => assert.equal(total.toNumber(), TEST_INITIAL_MEMBER_COUNT, "Expected: "+ TEST_INITIAL_MEMBER_COUNT + ", Actual: " +  total.toNumber()))
  );

  it("Initial member should have managed IPAddress", () =>
    AsnScRegistry.deployed()
    .then(instance => {
      registryInstance = instance;
      return instance.getManagedIpByAsn(TEST_ASN_INITIAL_MEMBER_1);
    })
    .then(ip => {
      var managedIP = ip;
      assert.equal(managedIP.length, 2, "Expected: " + 2 + ", Actual: " + managedIP.length);
      assert.equal(web3.utils.hexToUtf8(managedIP[0]), TEST_INITIAL_MEMBER_IPS_1[0], "Expected: " + TEST_INITIAL_MEMBER_IPS_1[0] + ", Actual: " + web3.utils.hexToUtf8(managedIP[0]));
      assert.equal(web3.utils.hexToUtf8(managedIP[1]), TEST_INITIAL_MEMBER_IPS_1[1], "Expected: " + TEST_INITIAL_MEMBER_IPS_1[1] + ", Actual: " + web3.utils.hexToUtf8(managedIP[1]));
    })
  );

  it("Should add a new member", () =>
    AsnScRegistry.deployed()
    .then(instance => {
      registryInstance = instance;
      instance.addMember(TEST_ASN_1, TEST_IPS_1, TEST_CONTRACT_ADDRESS_1, TEST_WALLET_ADDRESS_1);
      instance.addMember(TEST_ASN_2, TEST_IPS_2, TEST_CONTRACT_ADDRESS_2, TEST_WALLET_ADDRESS_2);
      return;
    })
    .then(() => registryInstance.getTotalMembers())
    .then(total => assert.equal(total.toNumber(), TEST_ASN_LIST.length, "Expected: "+ TEST_ASN_LIST.length + ", Actual: " +  total.toNumber()))
  );

  it("Should get managed IPAddress", () =>
    AsnScRegistry.deployed()
    .then(instance => {
      registryInstance = instance;
      return instance.getManagedIpByAsn(321);
    })
    .then(ip => {
      var managedIP = ip;

      assert.equal(managedIP.length, TEST_IPS_1.length, "Expected: " + TEST_IPS_1.length + ", Actual: " + managedIP.length);
      for(let i = 0 ; i < TEST_IPS_1.length; i++ ) {
        assert.equal(web3.utils.hexToUtf8(managedIP[i]), web3.utils.hexToUtf8(TEST_IPS_1[i]), "Expected: " + web3.utils.hexToUtf8(TEST_IPS_1[i]) + ", Actual: " + web3.utils.hexToUtf8(managedIP[i]));
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
      assert.equal(asn.length, TEST_ASN_LIST.length, "Expected: "+(TEST_ASN_LIST.length) +", Actual: " +  asn.length);
      for (let i = 0; i < asn.length; i++) {
        assert.equal(asn[i], TEST_ASN_LIST[i], "Expected: " + TEST_ASN_LIST[i] + ", Actual: " + asn[i]);
      }
    })
  );

  it("Should get all voting addresses", () =>
    AsnScRegistry.deployed()
    .then(instance => {
      registryInstance = instance;
      return instance.getAllMembersVotingAddresses();
    })
    .then(address => {
      assert.equal(address.length, TEST_VOTING_ADDRESSES_LIST.length, "Expected: "+TEST_VOTING_ADDRESSES_LIST+", Actual: " +  address.length);
      for (let i = 0; i < address.length; i++) {
        assert.equal(address[i], TEST_VOTING_ADDRESSES_LIST[i]);
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
    .then(total => assert.equal(total.toNumber(), 4, "Expected: 4, Actual: " +  total.toNumber()))
    .then(() => registryInstance.getRegisteredAsn())
    .then(asn => {
      assert.equal(asn.length, 4, "Expected: 4, Actual: " +  asn.length);
      assert.equal(asn[3], TEST_ASN_2, "Expected: "+ TEST_ASN_2 +", Actual: " +  asn[0]);
    })
  );

});
