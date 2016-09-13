#!/bin/sh

ROOTUID="0"

if [ "$(id -u)" -ne $ROOTUID ] ; then
  echo "Please run as sudo or root"
  exit
fi

SCRIPT=$(readlink -f $0)
SCRIPTPATH=`dirname $SCRIPT`

#Move files to /usr/bin
cp multichain/multichaind multichain/multichain-cli multichain/multichain-util /usr/local/bin
ln -sf "${SCRIPTPATH}/Wallet" /usr/local/bin/wdd-wallet 

echo 'Run wdd-wallet'
