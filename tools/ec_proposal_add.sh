#!/bin/bash
#_cidr_conversion_table = ("" "128.0.0.0")
echo "Enter your ASN:"
read _asn
echo "Enter your IP address(es) and its range separated by comma: i.e \"192.168.0.0/32,192.143.0.0/32\""
read _ipRange
echo "Enter your smart contract address for DDOS reporting:"
read _scAddress
echo "Enter your voting address:"
read _votingAddress

echo "ADD|"$_asn"|"$_ipRange"|"$_scAddress"|"$_votingAddress > $_asn.txt
gpg --detach-sig --armour $_asn.txt
