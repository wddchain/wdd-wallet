<a name="LinuxInstall">
###Linux Installation of WDD Wallet
Download the installer from  
[http://64.19.211.41/wdd/wdd-wallet-linux-x64.tar.gz](http://64.19.211.41/wdd-wallet-linux-x64.tar.gz) for 64-bit  
[http://64.19.211.41/wdd/wdd-wallet-linux-ia32.tar.gz](http://64.19.211.41/wdd-wallet-linux-ia32.tar.gz) for 32-bit  

Extract with:
```tar -xzvf <file>```  

From the newly created wddwallet folder, run:  
```sudo sh install.sh```  
You may be prompted for your password, and at the end of the install you will be asked if you want to run the wallet.

The first time the wallet runs, it will take some time to initialize.  Please be patient.  

When it prompts to seed the chain, accept the default location.  The wallet will automatically assign you a unique address.  This is like your account number.  You receive and send using your address.

When you see your address and your QR code, you are ready to accept WDD and Vouchers.

To run the wallet later:  
```wdd-wallet```

###Verifying integrity of your linux download
Because of the value of crypto, some attempts have been seen to trick people into installing compromised software.  We are not aware of any attempts to do so with this wallet, howevver, we provide an MD5 and SHA256 checksum that lets you verify the installer.  Obtain the checksums from 
http://64.19.211.41/wdd/checksums_linux.txt

Use these commands in a command prompt (on Windows) to verify the checksum.  Verifying one is enough.
Replace ```<file>``` with the filename of your download.  
```md5sum <file>```  
```sha256sum <file>```
