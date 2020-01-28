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

  enum ProposalType { ADD_MEMBER, REMOVE_MEMBER }
  struct Proposal {
    ProposalType proposalType;
    uint asn;
    bytes32[] ip;
    address scAddress;
    address votingAddress;
    string proposalHash;
    address proposer;
    uint deposit;
    uint submissionTime;
  }

  AsnScRegistry registry; //Registry address
  uint private finishSignupPhaseDuration;
  uint private endSignupPhaseDuration;
  uint private endCommitmentPhaseDuration;
  uint private endVotingPhaseDuration;
  uint private endRefundPhaseDuration;
  uint private depositRequired;
  uint private quorumInPercentage;
  Proposal private currentProposal;
  string private rawProposal;

  constructor(
      address _registryAddress,
      uint _finishSignupPhaseDuration,
      uint _endSignupPhaseDuration,
      uint _endCommitmentPhaseDuration,
      uint _endVotingPhaseDuration,
      uint _endRefundPhase,
      uint _depositRequired,
      uint _quorumInPercentage
      ) {
    registry = AsnScRegistry(_registryAddress);
    finishSignupPhaseDuration = _finishSignupPhaseDuration;
    endSignupPhaseDuration = _endSignupPhaseDuration;
    endCommitmentPhaseDuration = _endCommitmentPhaseDuration;
    endVotingPhaseDuration = _endVotingPhaseDuration;
    endRefundPhase = _endRefundPhase;
    depositRequired = _depositRequired;
    quorumInPercentage = _quorumInPercentage;
  }

  modifier isMember() {
    require(registry.isMember(msg.sender), "Only member can perform action");
    _;
  }

  modifier isProposer() {
    require(msg.sender == currentProposal.proposer, "Only proposer can perform action");
    _;
  }

  function registerEligibleVoters() private {
    address[] memory voters = registry.getAllMembersVotingAddresses();
    setEligible(voters);
  }

  function submitProposal(ProposalType _proposalType, uint _asn, bytes32[] _ip, address _scAddress, address _votingAddress, string _proposalHash, uint _submissionTime, string _rawProposal) public isMember payable returns (bool){
    // Require Proposer to deposit ether
    require(msg.value == depositRequired,  "Deposit sent is not equal to deposit required");

    //set eligible Voters
    registerEligibleVoters();

    //save the Proposal
    currentProposal = Proposal({
                        proposalType:_proposalType,
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
    //uint ecEndRefundPhase = ecEndVotingPhase + endRefundPhase; //stack too deep. max number of variable reached
    rawProposal = _rawProposal;
    string memory proposalTypeStr;

    require(ecFinishSignupPhase > 0 + gap, "ecFinishSignupPhase must be more than 0 + gap");
    require(addresses.length >= 3, "addresses must be more than 3");
    require(depositRequired >= 0, "depositrequired must not be 0");

    if(_proposalType == ProposalType.ADD_MEMBER) {
      proposalTypeStr = "Add member";
    } else if (_proposalType == ProposalType.REMOVE_MEMBER) {
      proposalTypeStr = "Remove member";
    } else {
      revert("Unrecognized proposal type");
    }
    return beginSignUp(proposalTypeStr, true, ecFinishSignupPhase, ecEndSignupPhase, ecEndCommitmentPhase, ecEndVotingPhase, ecEndVotingPhase + endRefundPhase, depositRequired);
  }

  function getProposal() view public returns(ProposalType _proposalType, uint _asn, bytes32[] _ip, address _scAddress, address _votingAddress, string _proposalHash, uint _submissionTime, address _proposer, string _rawProposal) {
    return(currentProposal.proposalType, currentProposal.asn, currentProposal.ip, currentProposal.scAddress, currentProposal.votingAddress, currentProposal.proposalHash, currentProposal.submissionTime, currentProposal.proposer, rawProposal);
  }

  function startElection() public returns(bool){
    uint totalInterestInPercentage = totalregistered/totaleligible*100;
    bool success = false;
    if (totalInterestInPercentage > quorumInPercentage) {
      success = finishRegistrationPhase();
    }
    return success;
  }

  function submitVote(uint[4] params, uint[2] y, uint[2] a1, uint[2] b1, uint[2] a2, uint[2] b2) inState(State.VOTE) returns (bool) {
    bool successful = submitVoteInternal(params, y, a1, b1, a2, b2);
    if (successful && totalvoted == totalregistered) {
      //tallyVote
      computeTally();
      uint yes = finaltally[0];
      uint no = finaltally[1]-finaltally[0];

      if(yes > no) {
        successful = executeProposal();
      }
    }
    return successful;
  }

  function getQuorumInPercentage() view public returns(uint _quorumInPercentage) {
    return quorumInPercentage;
  }

  function cancelProposal() public returns(bool) {
    bool success = deadlinePassed();
    if(success) {
      delete currentProposal;
      delete rawProposal;
      state = State.SETUP;
      return true;
    }
    return false;
  }

  function getDeposit() public isProposer inState(State.FINISHED) {
    if (msg.sender.send(currentProposal.deposit)) {
      //refunds successful
       delete currentProposal;
    } else {
      revert("Refund not successful");
    }
  }

  function executeProposal() internal returns(bool) {
    if(currentProposal.proposalType == ProposalType.ADD_MEMBER) {
      registry.addMember(currentProposal.asn, currentProposal.ip, currentProposal.scAddress, currentProposal.votingAddress);
    } else if (currentProposal.proposalType == ProposalType.REMOVE_MEMBER) {
      registry.removeMember(currentProposal.asn);
    } else {
      revert("Unrecognized proposal type");
    }

    return true;
  }



}
