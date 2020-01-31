#!/bin/bash
echo "Enter member's ASN:"
read _asn

echo "REMOVE|"$_asn > $_asn.txt

gpg --detach-sig --armour $_asn.txt
