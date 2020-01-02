const ElectionCommissioner = artifacts.require('./ElectionCommissioner.sol');
const AsnScRegistry = artifacts.require('./AsnScRegistry.sol');

const assert = require('assert');

const PROPOSAL_IP_LIST = [web3.utils.asciiToHex("10.0.0.5/32"), web3.utils.asciiToHex("10.0.0.6/32")];
const PROPOSAL = {
  asn : 987,
  ip: [web3.utils.asciiToHex("10.0.0.5/32"), web3.utils.asciiToHex("10.0.0.6/32")],
  scAddress: "0x1234567890123456789012345678901234567890",
  votingAddress: "0x1234567890123456789012345678901234567890",
  hash: "573D38347920E6EF36D35FACDF341FD189A966EA5F52756F6EAC5AE1D9AC55EA",
};
const TEST_IPS_1 = [web3.utils.asciiToHex("10.0.0.1"),web3.utils.asciiToHex("10.0.0.2")];
const TEST_CONTRACT_ADDRESS_1 = '0x1234567890123456789012345678901234567891';
const TEST_WALLET_ADDRESS_1 = '0x1234567890123456789012345678901234567891';
const TEST_ASN_1 = 321;

const TEST_IPS_2 = [web3.utils.asciiToHex("172.16.0.1"),web3.utils.asciiToHex("172.16.0.2")];
const TEST_CONTRACT_ADDRESS_2 = '0x1234567890123456789012345678901234567890';
const TEST_WALLET_ADDRESS_2 = '0x1234567890123456789012345678901234567890';
const TEST_ASN_2 = 456;
const submissionTime = Math.round((new Date).getTime() / 1000);
const deposit_in_wei = web3.utils.toWei("1","ether");
let registryInstance;

function sleep(milliseconds) {
  const date = Date.now();
  let currentDate = null;
  do {
    currentDate = Date.now();
  } while (currentDate - date < milliseconds);
}

contract("ElectionCommissioner", accounts => {
  it("Setup", () =>
    AsnScRegistry.deployed()
    .then(instance => {
      instance.addMember(TEST_ASN_1, TEST_IPS_1, TEST_CONTRACT_ADDRESS_1, TEST_WALLET_ADDRESS_1);
      instance.addMember(TEST_ASN_2, TEST_IPS_2, TEST_CONTRACT_ADDRESS_2, TEST_WALLET_ADDRESS_2);
      return instance.getTotalMembers();
    })
    .then(total => assert.equal(total.toNumber(), 5, "Expected: 5, Actual: " +  total.toNumber()))
  );

  it("Should submit proposal", () =>
    ElectionCommissioner.deployed()
    .then(instance => {
      registryInstance = instance;
      instance.submitProposal(PROPOSAL.asn, PROPOSAL.ip, PROPOSAL.scAddress, PROPOSAL.votingAddress, PROPOSAL.hash, submissionTime, {from: '0x0289af55758F2F5bA64f8E1cd29663E78f63F295',value: 1000000000000000000 });
      return instance.state();
    })
    .then(state => assert.equal(state, 1, "Expected: "+ 1 + ", Actual: " +  state))
  );

  it("Should set all the datelines", () =>
    ElectionCommissioner.deployed()
    .then(instance => {
      registryInstance = instance;
      return instance.finishSignupPhase();
    })
    .then(finishSignupPhase => {
      assert.equal(finishSignupPhase, submissionTime+600, "Expected: "+ finishSignupPhase + ", Actual: " +  (submissionTime+600));
    })
  );

  it("Should assigned eligible voters", () =>
    ElectionCommissioner.deployed()
    .then(instance => {
      registryInstance = instance;
      return instance.totaleligible();
    })
    .then(totaleligible => assert.equal(totaleligible, 5, "Expected: "+ 5+ ", Actual: " +  totaleligible))
    .then(() => registryInstance.eligible("0xA1693EC271CA1F7e28b96F0BD4552CB4b64827d0").then(a => assert.equal(a, true)))
    .then(() => {
      let a = registryInstance.addresses(0);
      return a;
    } )
  );

  it("Should let the signup phase passed", () =>
    ElectionCommissioner.deployed()
    .then(instance => {
      registryInstance = instance;
      return instance.finishSignupPhase();
    })
    .then(async finishSignupPhase => {
      function getCurrentBlockTimestamp() {
        return new Promise(function(resolve) {
          web3.eth.getBlock("latest").then(
            function(block) {
              resolve(block.timestamp)
            });
          });
        }
        sleep(600 * 1000);
        let blockTimestamp = await getCurrentBlockTimestamp();
        console.log("blockTimestamp = " + blockTimestamp + ", finishSignupPhase =" + finishSignupPhase);
        assert.ok(blockTimestamp > finishSignupPhase);
    })
  );

  });
