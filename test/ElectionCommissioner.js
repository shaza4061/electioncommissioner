const ElectionCommissioner = artifacts.require('./ElectionCommissioner.sol');
const AsnScRegistry = artifacts.require('./AsnScRegistry.sol');

const assert = require('assert');

const PROPOSAL_IP_LIST = [web3.utils.asciiToHex("10.0.0.5"), web3.utils.asciiToHex("10.0.0.6")];
const PROPOSAL_MASK_LIST = [web3.utils.asciiToHex("255.0.0.0"), web3.utils.asciiToHex("255.0.0.0")];
const PROPOSAL = {
  asn : 987,
  ip: [web3.utils.asciiToHex("10.0.0.5"), web3.utils.asciiToHex("10.0.0.6")],
  mask: [web3.utils.asciiToHex("255.0.0.0"), web3.utils.asciiToHex("255.0.0.0")],
  scAddress: "0x1234567890123456789012345678901234567890",
  votingAddress: "0x1234567890123456789012345678901234567890",
  hash: "573D38347920E6EF36D35FACDF341FD189A966EA5F52756F6EAC5AE1D9AC55EA",
};
const TEST_IPS_1 = [web3.utils.asciiToHex("10.0.0.1"),web3.utils.asciiToHex("10.0.0.2")];
const TEST_IPS_MASK_1 = [web3.utils.asciiToHex("255.0.0.0"),web3.utils.asciiToHex("255.0.0.0")];
const TEST_CONTRACT_ADDRESS_1 = '0x1234567890123456789012345678901234567891';
const TEST_WALLET_ADDRESS_1 = '0x1234567890123456789012345678901234567891';
const TEST_ASN_1 = 123;

const TEST_IPS_2 = [web3.utils.asciiToHex("172.16.0.1"),web3.utils.asciiToHex("172.16.0.2")];
const TEST_IPS_MASK_2 = [web3.utils.asciiToHex("255.0.0.0"),web3.utils.asciiToHex("255.0.0.0")];
const TEST_CONTRACT_ADDRESS_2 = '0x1234567890123456789012345678901234567890';
const TEST_WALLET_ADDRESS_2 = '0x1234567890123456789012345678901234567890';
const TEST_ASN_2 = 456;
const submissionTime = (new Date).getTime();
const deposit_in_wei = web3.utils.toWei("1","ether");
let registryInstance;

// contract("AsnScRegistry", accounts => {
//   it("Setup", () =>
//     AsnScRegistry.deployed()
//     .then(instance => {
//       instance.addMember(TEST_ASN_1, TEST_IPS_1, TEST_IPS_MASK_1, TEST_CONTRACT_ADDRESS_1, TEST_WALLET_ADDRESS_1);
//       instance.addMember(TEST_ASN_2, TEST_IPS_2, TEST_IPS_MASK_2, TEST_CONTRACT_ADDRESS_2, TEST_WALLET_ADDRESS_2);
//       return instance.getTotalMembers();
//     })
//     .then(total => assert.equal(total.toNumber(), 3, "Expected: 3, Actual: " +  total.toNumber()))
//   );
// });

contract("ElectionCommissioner", accounts => {
  it("Setup", () =>
    AsnScRegistry.deployed()
    .then(instance => {
      instance.addMember(TEST_ASN_1, TEST_IPS_1, TEST_IPS_MASK_1, TEST_CONTRACT_ADDRESS_1, TEST_WALLET_ADDRESS_1);
      instance.addMember(TEST_ASN_2, TEST_IPS_2, TEST_IPS_MASK_2, TEST_CONTRACT_ADDRESS_2, TEST_WALLET_ADDRESS_2);
      return instance.getTotalMembers();
    })
    .then(total => assert.equal(total.toNumber(), 3, "Expected: 3, Actual: " +  total.toNumber()))
  );

  it("Should submit proposal", () =>
    ElectionCommissioner.deployed()
    .then(instance => {
      registryInstance = instance;
      instance.submitProposal(PROPOSAL.asn, PROPOSAL.ip, PROPOSAL.mask, PROPOSAL.scAddress, PROPOSAL.votingAddress, PROPOSAL.hash, submissionTime, {value: 1000000000000000000 });
      return instance.state();
    })
    .then(state => assert.equal(state, 1, "Expected: "+ 1 + ", Actual: " +  state))
  );

  });
