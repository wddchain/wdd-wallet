[Setup]
AppName=WDD Wallet
AppVersion=1.0.6
VersionInfoVersion=1.0.6.0
DefaultDirName={pf}\WDDWallet
DefaultGroupName=WDDWallet
UninstallDisplayIcon={app}\WDDWallet.exe
Compression=lzma2
SolidCompression=yes
OutputDir=output
OutputBaseFilename=WddWalletSetup
ArchitecturesInstallIn64BitMode=ia64 x64

[Types]
Name: "full"; Description: "Full installation"
Name: "upgrade"; Description: "Upgrade installation"

[Files]
Source: "output\Wallet-win-ia32\*"; DestDir: "{app}"; Flags: ignoreversion
Source: "output\Wallet-win-ia32\locales\*"; DestDir: "{app}\locales"; Flags: ignoreversion
Source: "wddwallet\plink.exe"; DestDir: "{app}"
Source: "multichain_appliance\wddwallet.ova"; DestDir: "{app}"; Flags: ignoreversion
Source: "vbox_setup\VirtualBoxSetup.exe"; DestDir: "{app}"

[Icons]
Name: "{group}\WDDWallet"; Filename: "{app}\Wallet.exe"

[Run]
Filename: "{app}\VirtualBoxSetup.exe";  Description: "Installing VM to handle core wallet functions"
Filename: "{pf}\Oracle\VirtualBox\VBoxManage.exe"; Parameters: "import ""{app}/wddwallet.ova"""; StatusMsg: "Importing VM"; Description: "Installing wallet VM"; Flags: runminimized
Filename: "{app}\Wallet.exe"; Flags: postinstall

[UninstallRun]
Filename: "{pf}\Oracle\VirtualBox\VBoxManage.exe"; Parameters: "unregistervm wddwallet -delete"; StatusMsg: "Removing VM"; Flags: runminimized
