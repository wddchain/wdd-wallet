var fs = require('fs');
var uuid_of_virtualbox_home = '9bb162cc-a3ad-41fe-8d4d-c2265feeb67a';
var wallet_path = '/.multichain/wdd/';
var wallet_file = 'wallet.dat';
var isWin = /^win/.test(process.platform);
var isMac = /^darwin/.test(process.platform);

var filename = 'wallet';
if (isWin) {
	filename = 'wddwallet-disk2.vmdk';
}

$('#backup_cancel_button').click(function() 
{
	window.location = 'index.html#send_currency_tab';
});


function chooseFile(name) {
  var path_info = {};	
  var chooser = document.querySelector(name);
  chooser.addEventListener("change", function(evt) {
  	path_info.backup_dir = this.value;
  	var okcancel = confirm("Back up to " + path_info.backup_dir);
  	console.log(okcancel);
    console.log(path_info.backup_dir);
    if (okcancel === true) {

    	if (isWin) {
    		$('#backup_status').html('Stopping VM.');
	    	StopWalletVM(function (error, stdout, stderr) {
				console.log('stdout: ' + stdout);
				console.log('stderr: ' + stderr);
				console.log('error: ' + error);
				
				$('#backup_status').html('Stopped VM.');
				$('#backup_status').html('Starting copy of ' + path_info.backup_dir + '\\' + filename);
				BackupVBoxDrive(uuid_of_virtualbox_home, path_info.backup_dir + '\\' + filename, function (error, stdout, stderr) {
					console.log('BVD stdout: ' + stdout);
					console.log('BVD stderr: ' + stderr);
					console.log('BVD error: ' + error);
					if (error) {
						alert(error);
					}
					else {
						$('#backup_status').html('Backup complete');
						//Restart VM
						window.location = 'start_multichain.html';  
					}
				});
			});
	    } 
	    else 
	    {
	    	copyFile(getUserHome() + wallet_path + wallet_file, this.value + '/' + wallet_file, function(err) {
	    		if (err)
	    			alert(err);
	    		else
	    		  alert('Backup complete.');
	    			window.location='index.html';
	    	});
	    }
    }
  }, false);

  chooser.click();  
}

function BackupVBoxDrive(uuid, fullpath, cb) {
  if (global.wallet_settings.vmname != '')   //If using vm, then stop it
  {
  	//Uses VBoxManage to clone the hd to the selected folder
    var backupVM = '\"' + global.wallet_settings.vmctrl + '\"' + ' clonemedium '+ uuid + ' \"' + fullpath + '\"';
    var exec = require('child_process').exec;
    var child;
    child = exec(backupVM, cb);  //Callback (error, stdout, stderr)
  } 
}

function copyFile(source, target, cb) {
  var cbCalled = false;

  var rd = fs.createReadStream(source);
  rd.on("error", function(err) {
    done(err);
  });
  var wr = fs.createWriteStream(target);
  wr.on("error", function(err) {
    done(err);
  });
  wr.on("close", function(ex) {
    done();
  });
  rd.pipe(wr);

  function done(err) {
    if (!cbCalled) {
      cb(err);
      cbCalled = true;
    }
  }
}

function getUserHome() {
  return process.env[(process.platform == 'win32') ? 'USERPROFILE' : 'HOME'];
}

chooseFile('#fileDialog');