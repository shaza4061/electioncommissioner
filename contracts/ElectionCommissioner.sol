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
    ProposalType type;
    uint asn;
    bytes32[] ip;
    address scAddress;
    address votingAddress;
    string proposalHash;
    string proposer;
    uint deposit;
    uint submissionTime;
  }

  AsnScRegistry registry; //Registry address
  uint finishSignupPhaseDuration;
  uint endSignupPhaseDuration;
  uint endCommitmentPhaseDuration;
  uint endVotingPhaseDuration;
  uint endRefundPhaseDuration;
  uint depositRequired;
  Proposal private currentProposal;

  enum ProposalType { ADD_MEMBER, REMOVE_MEMBER }

  constructor(
      address _registryAddress,
      uint _finishSignupPhaseDuration,
      uint _endSignupPhaseDuration,
      uint _endCommitmentPhaseDuration,
      uint _endVotingPhaseDuration,
      uint _endRefundPhase,
      uint _depositRequired
      ) {
    registry = AsnScRegistry(_registryAddress);
    finishSignupPhaseDuration = _finishSignupPhaseDuration;
    endSignupPhaseDuration = _endSignupPhaseDuration;
    endCommitmentPhaseDuration = _endCommitmentPhaseDuration;
    endVotingPhaseDuration = _endVotingPhaseDuration;
    endRefundPhase = _endRefundPhase;
    depositRequired = _depositRequired;
  }

  modifier isMember() {
    require(registry.isMember(msg.sender), "Only member can perform action");
    _;
  }

  modifier isProposer() {
  require(msg.sender = currentProposal.proposer, "Only proposer can perform action");
  _;
  }

  function submitProposal(ProposalType _proposalType, uint _asn, bytes32[] _ip, address _scAddress, address _votingAddress, string _proposalHash, uint _submissionTime) public isMember payable {
    // Require Proposer to deposit ether
    require(msg.value == depositRequired,  "Deposit sent is not equal to deposit required");

    //set eligible Voters
    address[] memory voters = registry.getAllMembersVotingAddresses();
    setEligible(voters);

    //save the Proposal
    currentProposal = Proposal({
                        type: _proposalType,
                        asn:_asn,
                        ip:_ip,
                        scAddress:_scAddress,
                        votingAddress:_votingAddress,
                        proposalHash:_proposalHash,
                        submissionTime:_submissionTime,
                        proposer: msg.sender,
                        deposit: msg.value
                        });

    uint ecFinishSignupPhase = _submissionTime + finishSignupPhaseDuration;
    uint ecEndSignupPhase = ecFinishSignupPhase + endSignupPhaseDuration;
    uint ecEndCommitmentPhase = ecEndSignupPhase + endCommitmentPhaseDuration;
    uint ecEndVotingPhase = ecEndCommitmentPhase + endVotingPhaseDuration;
    uint ecEndRefundPhase = ecEndVotingPhase + endRefundPhase;

    beginSignUp("Add member", true, ecFinishSignupPhase, ecEndSignupPhase, ecEndCommitmentPhase, ecEndVotingPhase, ecEndRefundPhase, depositRequired);
  }

  function getProposal() view public returns(ProposalType _proposalType, uint _asn, bytes32[] _ip, address _scAddress, address _votingAddress, string _proposalHash, uint _submissionTime, string _proposer) {
    return(currentProposal.type, currentProposal.asn, currentProposal.ip, currentProposal.scAddress, currentProposal.votingAddress, currentProposal.proposalHash, currentProposal.submissionTime, currentProposal.proposer);
  }

  function getDeposit() public isProposer inState(State.FINISHED) {
    if (msg.sender.send(refund)) {
      //refunds successful
       delete currentProposal;
    } else {
      revert("Refund not successful");
    }
  }

}
