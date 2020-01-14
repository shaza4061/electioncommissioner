// Fetch the Storage contract data from the Storage.json file
const AsnScRegistry = artifacts.require("AsnScRegistry.sol");
const ElectionCommissioner = artifacts.require("ElectionCommissioner.sol");
const LocalCrypto = artifacts.require("LocalCrypto");

const _finishSignupPhaseDuration = 600;
const _quorumInPercentage = 50;
const _endSignupPhaseDuration  = 600;
const _endCommitmentPhaseDuration = 600;
const _endVotingPhaseDuration = 600;
const _endRefundPhase = 600;
const _deposit = "1000000000000000000"; //in ether

// JavaScript export
module.exports = function(deployer) {
    // Deployer is the Truffle wrapper for deploying
    // contracts to the network

    // Deploy the contract to the network
    deployer.deploy(LocalCrypto);
    deployer.deploy(
      ElectionCommissioner,
      AsnScRegistry.address,
      _finishSignupPhaseDuration,
      _endSignupPhaseDuration,
      _endCommitmentPhaseDuration,
      _endVotingPhaseDuration,
      _endRefundPhase,
      _deposit,
      _quorumInPercentage
    );
}
