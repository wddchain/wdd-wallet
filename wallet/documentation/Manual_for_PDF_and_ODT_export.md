<a name="WinInstall">
###Windows Installation of WDD Wallet
Download the installer from [http://64.19.211.41/wdd/WddWalletSetup.exe](http://64.19.211.41/wdd/WddWalletSetup.exe) to your download folder.
Launch WddWalletSetup.exe, and follow the prompts. 

Note: As part of the wallet installation it will install VirtualBox.  Accept all the defaults, but when you are offered the option to run VirtualBox at the end of the installation, uncheck the box. 

The last page of the installer will offer to run Wallet.exe.  Keep the box checked and it will start the wallet automatically.

The first time it runs, it will take some time to initialize.  Please be patient.  

When it prompts to seed the chain, accept the default location.  The wallet will automatically assign you a unique address.  This is like your account number.  You receive and send using your address.

When you see your address and your QR code, you are ready to accept WDD and Vouchers.

###Verifying integrity of your Windows install download
Because of the value of crypto, some attempts have been seen to trick people into installing compromised software.  We are not aware of any attempts to do so with this wallet, howevver, we provide an MD5 and SHA256 checksum that lets you verify the installer.  Obtain the checksums from http://<domain>/wdd/checksums.txt

Use these commands in a command prompt (on Windows) to verify the checksum.  Verifying one is enough.
Replace <file> with the filename of your download.  
```certutil -hashfile <file> md5```  
```certutil -hashfile <file> sha256```

<a name="LinuxInstall">
###Linux Installation of WDD Wallet
Download the installer from  
[http://64.19.211.41/wdd/wdd-wallet-linux-x64.tar.gz](http://64.19.211.41/wdd/wdd-wallet-linux-x64.tar.gz) for 64-bit   

Extract with:
```tar -xzvf wdd-wallet-linux-x64.tar.gz```  

From the newly created wddwallet folder, run:  
```sudo sh install.sh```  
You may be prompted for your password.

To run the wallet:   
```wdd-wallet```

The first time the wallet runs, it will take some time to initialize.  Please be patient.  

When it prompts to seed the chain, accept the default location.  The wallet will automatically assign you a unique address.  This is like your account number.  You receive and send using your address.

When you see your address and your QR code, you are ready to accept WDD and Vouchers.

###Verifying integrity of your linux download
Because of the value of crypto, some attempts have been seen to trick people into installing compromised software.  We are not aware of any attempts to do so with this wallet, howevver, we provide an MD5 and SHA256 checksum that lets you verify the installer.  Obtain the checksums from 
http://64.19.211.41/wdd/checksums_linux.txt

Use these commands in a command prompt (on Windows) to verify the checksum.  Verifying one is enough.
Replace ```<file>``` with the filename of your download.  
```md5sum <file>```  
```sha256sum <file>```
<a name="Receiving">
###Receiving Vouchers or WDD
For others to send WDD or Assets to you, they will need your address.  

<a href="" target="_blank"><img src="Receiving.png"/></a>


You can give them the address text string which looks like this:   
`wUCS7Qy9YzoQt1Np4XEqHVDhMGnpCSECEcWKtd`  
Or let the recipient scan the QR Code with their phone.  

You can copy/paste the address or qr code from the application to an e-mail.  

<a name="SendWDD">
###Sending WDD
To send WDD to others.  

<a href="" target="_blank"><img src="SendWDD.png"/></a>

Paste their address into __Send to__:   This is like their account number.  If you have their QR code, and your computer has a camera, then hit [Scan QR Code] to allow the camera to see the QR code image.  If it is a valid address, it will be recognized automatically and entered for you.

Enter the amount you wish to send, and hit [Send].

If you are connected to the internet, the WDD will be sent.  It will usually show up very quickly, but may take several minutes before it can be spent by the recipient.
<a name="SendVoucher">
###Sending a Voucher
To send a voucher.  

<a href="" target="_blank"><img src="SendVoucher.png"/></a>

Select the voucher you wish to send.  If the Voucher list is empty, you do not have any vouchers.

Paste the recipient's address into __Send to__:  

If you have their QR code, and your computer has a camera, then hit [Scan QR Code] to allow the camera to see the QR code image.  If it is a valid address, it will be recognized automatically and entered for you.

Enter the amount you wish to send, and hit [Send].

If you are connected to the internet, the Voucher will be sent.
<a name="History">
###Transaction History

View the transaction history of your account.

<a href="" target="_blank"><img src="History.png"/></a>
<a name="Settings">
###Settings

Select your preferred language.

<a href="" target="_blank"><img src="Settings.png"/></a>

**Backup and Restore** to back up your private keys.
<a name="Status">
###Status
Show general status of the program and the blockchain.  

<a href="" target="_blank"><img src="Status.png"/></a>

**Version** lets you know the version of the client.  

**Blockchain Version** gives you the version of the blockchain software which secures and records transactions.  

**Blocks** provides the number of blocks that your client has downloaded.  This must catch up to the current block height for new transactions to be displayed.  

**Connections** shows the number of connections your client has made to update the blockchain.  

**Refresh** lets you refresh the status information.
<a name="Backup">
###Backup your wallet
Go to the 'Settings' tab.  
Hit the 'Backup and Restore' button.  
Hit the 'Show Words' button to show the 24 words.  
Write the words down, and save the paper.*  

<a href="" target="_blank"><img src="Backup.png"/></a>

<small>*It is important to keep your backup in a secure location.</small>

