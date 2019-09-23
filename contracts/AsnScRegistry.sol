pragma solidity ^0.4.3;

contract owned {
    address public owner;

    /* Initialise contract creator as owner */
    function owned() {
        owner = msg.sender;
    }

    /* Function to dictate that only the designated owner can call a function */
	  modifier onlyOwner {
        if(owner != msg.sender) throw;
        _;
    }

    /* Transfer ownership of this contract to someone else */
    function transferOwnership(address newOwner) onlyOwner() {
        owner = newOwner;
    }
}

/*
 * @title AsnScRegistry
 *  Open Vote Network
 *  A self-talling protocol that supports voter privacy.
 *
 *  Author: Shahrul Sharudin
 */
contract AsnScRegistry is owned{
  struct IPAddress {
    uint128 ip;
    uint8 mask;
    }

  struct Member {
    IPAddress[] managedIP;
    address contractAddress;
    address walletAddress;
  }
  mapping (uint => Member) members;

  uint[] private membersAsn;

  function getMemberByAsn(uint _asn) view public returns (uint128[] _ip, uint8[] _mask, address _contractAddress, address _walletAddress){
    Member memory member = members[_asn];
    uint128[] memory ips = new uint128[](member.managedIP.length);
    uint8[] memory mask = new uint8[](member.mask.length);

    for (uint i = 0; i < member.managedIP.length; i++) {
            ips[i] = member.managedIP[i].ip;
            mask[i] = member.managedIP[i].mask;
        }
    return (ips, mask, member.contractAddress, member.contractAddress);
  }
//////
  function addMember(uint _asn, uint128[] _ip, uint8[] _mask, address _contractAddress, address _walletAddress) public {
    Member memory member = members[_asn];
    //throw error if member already exist
    assert(member.contractAddress != 0);
    IPAddress[] memory ipAddresses;
    for(uint i=0; i<_ip.length; i++){
      IPAddress memory ipAddress = IPAddress({ip:_ip[i], mask:_mask[i]});
      ipAddresses.push(ipAddress);
    }

    members[_asn] = Member({managedIP:ipAddresses, contractAddress:_contractAddress,walletAddress:_walletAddress}));
    membersAsn.push(_asn);
  }

  function getTotalMembers() view public returns (uint _totalMembers) {
    return (membersAsn.length);
  }

  function getNthMember(uint _n) view public returns (uint128[] _ip, uint8[] _mask, address _contractAddress, address _walletAddress){
    Member memory member = members[membersAsn[_n]];
    return(member.managedIP);
  }

}
