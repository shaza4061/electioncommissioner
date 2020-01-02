pragma solidity ^0.4.3;

import "./owned.sol";
//library from https://github.com/Arachnid/solidity-stringutils
import "./strings.sol";

/*
 * @title AsnScRegistry
 *  Open Vote Network
 *  A self-talling protocol that supports voter privacy.
 *
 *  Author: Shahrul Sharudin
 */
contract AsnScRegistry is owned{
  using strings for *;

  struct MemberAddresses {
    address contractAddress;
    address votingAddress;
    uint index;
  }
  event EventMemberAdded(uint _asn);
  event EventMemberRemoved(uint _asn);
  event EventDebug(uint _i);

  mapping (uint => bytes32[]) managedIps;
  mapping (uint => MemberAddresses) ethAddresses;

  uint[] private registeredAsn;

  //need constructor to accept initial member
  constructor(uint[] _asn, bytes32[] _ip, address[] _contractAddress, address[] _votingAddress, uint _size) {
    for(uint i = 0; i < _size; i++) {
      bytes32[] memory ips = extractString(_ip[i]);
      addMember(_asn[i], ips, _contractAddress[i], _votingAddress[i]);
    }

  }

  function getManagedIpByAsn(uint _asn) view public returns (bytes32[] _ip){
    bytes32[] memory addresses = managedIps[_asn];
    bytes32[] memory ips = new bytes32[](addresses.length);
    emit EventDebug(addresses.length);
    for (uint i = 0; i < addresses.length; i++) {
            ips[i] = addresses[i];
        }
        emit EventDebug(ips.length);
    return (ips);
  }

  function getMemberAddressesByAsn(uint _asn) view public returns (address _contractAddress, address _votingAddress){
    MemberAddresses memory memberAddresses = ethAddresses[_asn];
    return (memberAddresses.contractAddress, memberAddresses.votingAddress);
  }

  function addMember(uint _asn, bytes32[] _ip, address _contractAddress, address _votingAddress) public {
    MemberAddresses memory member = ethAddresses[_asn];
    //throw error if member already exist
    require(member.contractAddress == 0);
    emit EventDebug(_ip.length);
    for(uint i=0; i<_ip.length; i++){
      managedIps[_asn].push(_ip[i]);
    }
    uint idx = registeredAsn.push(_asn)-1;
    ethAddresses[_asn] = MemberAddresses({contractAddress:_contractAddress, votingAddress:_votingAddress, index:idx});
    emit EventMemberAdded(_asn);
  }

  function removeMember(uint _asn) public returns (uint[] _registeredAsn){

    if (ethAddresses[_asn].index >= registeredAsn.length) return;

    for (uint i = ethAddresses[_asn].index; i<registeredAsn.length - 1; i++){
      registeredAsn[i] = registeredAsn[i+1];
    }
        registeredAsn.length--;
        delete managedIps[_asn];
        delete ethAddresses[_asn];
        emit EventMemberRemoved(_asn);
        return registeredAsn;
  }

  function getTotalMembers() view public returns (uint _totalMembers) {
    return (registeredAsn.length);
  }

  function getRegisteredAsn() view public returns (uint[] _asn){
    return (registeredAsn);
  }

  function getAllMembersVotingAddresses() view public returns (address[] _votingAddresses) {
    address[] memory votingAddresses = new address[](registeredAsn.length);
    EventDebug(registeredAsn.length);
    for(uint i = 0; i< registeredAsn.length; i++) {
      votingAddresses[i] = ethAddresses[registeredAsn[i]].votingAddress;
    }
    EventDebug(votingAddresses.length);
    return (votingAddresses);
  }

  function isMember(address _memberAddress) view public returns (bool _isExist) {
    bool isExist = false;
    for(uint i = 0; i< registeredAsn.length; i++) {
      if (_memberAddress == ethAddresses[registeredAsn[i]].votingAddress) {
        isExist = true;
        break;
      }
    }
    return isExist;
  }

  function extractString(bytes32 _rawString) view private returns(bytes32[] _parts) {
    //string memory converted = string(_rawString);
    strings.slice memory s = _rawString.toSliceB32();
    strings.slice memory delim = ",".toSlice();
       bytes32[] memory parts = new bytes32[](s.count(delim)+1);//offset by 1
       for (uint i = 0; i < parts.length; i++) {
          parts[i] = stringToBytes32(s.split(delim).toString());
       }
   return parts;
  }

  function stringToBytes32(string memory source) view private returns (bytes32 result) {
    bytes memory tempEmptyStringTest = bytes(source);
    if (tempEmptyStringTest.length == 0) {
      return 0x0;
      }

    assembly {
      result := mload(add(source, 32))
      }
    }

}
