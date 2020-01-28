#!/bin/bash
echo "Enter member's voting address:"
read _votingAddress

echo "REMOVE|"$_votingAddress > $_votingAddress.txt
