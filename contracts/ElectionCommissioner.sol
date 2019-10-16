pragma solidity ^0.4.3;
import "./AnonymousVoting.sol";
import "./AsnScRegistry.sol";

/**
 * @title Election Commissioner
 *
 * Functions for working with integers, curve-points, etc.
 *
 * @author Shahrul Sharudin (shahrul.zharif@gmail.com)
 */
contract ElectionCommissioner is AnonymousVoting(1,0xFF2C4D4890d6Be87cA259a1763B08cA16Cc1f2b1) {

  struct Proposal {
    uint asn;
    bytes32[] ip;
    bytes32[] mask;
    address scAddress;
    address votingAddress;
    string proposalHash;
    uint submissionTime;
  }

  AsnScRegistry registry; //Registry address
  uint finishSignupPhaseDuration;
  uint endSignupPhaseDuration;
  uint endCommitmentPhaseDuration;
  uint endVotingPhaseDuration;
  uint endRefundPhaseDuration;
  uint deposit;
  Proposal private currentProposal;

  enum ProposalType { ADD_MEMBER, REMOVE_MEMBER }

  event EventProposalSubmitted();

  constructor(
      address _registryAddress,
      uint _finishSignupPhaseDuration,
      uint _endSignupPhaseDuration,
      uint _endCommitmentPhaseDuration,
      uint _endVotingPhaseDuration,
      uint _endRefundPhase,
      uint _deposit
      ) {
    registry = AsnScRegistry(_registryAddress);
    finishSignupPhaseDuration = _finishSignupPhaseDuration;
    endSignupPhaseDuration = _endSignupPhaseDuration;
    endCommitmentPhaseDuration = _endCommitmentPhaseDuration;
    endVotingPhaseDuration = _endVotingPhaseDuration;
    endRefundPhase = _endRefundPhase;
    deposit = _deposit;
  }

  modifier isMember() {
    require(registry.isMember(msg.sender), "Not allowed");
    _;
  }

  function submitProposal(uint _asn, bytes32[] _ip, bytes32[] _mask, address _scAddress, address _votingAddress, string _proposalHash, uint _submissionTime) public isMember payable {
    // Require Proposer to deposit ether
    require(msg.value == deposit,  "Deposit sent is not equal to deposit required");

    // Store the election authority's deposit
    // Note: This deposit is only lost if ??
    refunds[msg.sender] = msg.value;

    //set eligible Voters
    address[] memory voters = registry.getAllMembersVotingAddresses();
    setEligible(voters);

    //save the Proposal
    currentProposal = Proposal({asn:_asn, ip:_ip, mask:_mask, scAddress:_scAddress, votingAddress:_votingAddress, proposalHash:_proposalHash, submissionTime:_submissionTime});

    uint ecFinishSignupPhase = _submissionTime + finishSignupPhaseDuration;
    uint ecEndSignupPhase = ecFinishSignupPhase + endSignupPhaseDuration;
    uint ecEndCommitmentPhase = ecEndSignupPhase + endCommitmentPhaseDuration;
    uint ecEndVotingPhase = ecEndCommitmentPhase + endVotingPhaseDuration;
    uint ecEndRefundPhase = ecEndVotingPhase + endRefundPhase;

    beginSignUp("Add member", true, ecFinishSignupPhase, ecEndSignupPhase, ecEndCommitmentPhase, ecEndVotingPhase, ecEndRefundPhase, deposit);
    emit EventProposalSubmitted();
  }

  function getProposal() view public returns(uint _asn, bytes32[] _ip, bytes32[] _mask, address _scAddress, address _votingAddress, string _proposalHash, uint _submissionTime) {
    return(currentProposal.asn, currentProposal.ip, currentProposal.mask, currentProposal.scAddress, currentProposal.votingAddress, currentProposal.proposalHash, currentProposal.submissionTime);
  }

}
