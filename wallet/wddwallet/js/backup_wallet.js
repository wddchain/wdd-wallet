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
  var chooser = document.querySelector(name);
  chooser.addEventListener("change", function(evt) {
  	var okcancel = confirm("Back up to " + this.value);
  	console.log(okcancel);
    console.log(this.value);
    if (okcancel === true) {

    	if (isWin) {
    		$('#backup_status').html('Stopping VM.');
    		alert('Stopping VM.');
	    	StopWalletVM();
    		$('#backup_status').html('Stopped VM.');
    		alert('Stopped VM.');

    		alert('Starting copy of ' + this.value + '\\' + filename);
	    	BackupVBoxDrive(uuid_of_virtualbox_home, this.value + '\\' + filename);
	    	alert('Stopping copy');

	    	//Restart VM
	    	window.location = 'start_multichain.html';  
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

function BackupVBoxDrive(uuid, fullpath) {
  if (wallet_settings.vmname != '')   //If using vm, then stop it
  {
  	//Uses VBoxManage to clone the hd to the selected folder
    var backupVM = '\"' + wallet_settings.vmctrl + '\"' + ' clonemedium '+ uuid + ' \"' + fullpath + '\"';
    var exec = require('child_process').exec;
    var child;
    child = exec(backupVM, function (error, stdout, stderr) {
      alert('stdout: ' + stdout);
      alert('stderr: ' + stderr);
      alert('error: ' + error);
    });
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