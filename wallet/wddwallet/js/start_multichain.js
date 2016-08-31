var fs = require('fs');
var wallet_settings = JSON.parse(fs.readFileSync('./wallet_settings.json').toString());

var multichainCommand = 'multichain-1.0-alpha-23/multichaind ' + wallet_settings.chainname;
var multichainArgs = ' -daemon -listen=0 -rpcpassword='+wallet_settings.multichain.pass+' -rpcport=' + wallet_settings.multichain.port;
var multichainCommandRunner = '';

var isWin = /^win/.test(process.platform);
var isMac = /^darwin/.test(process.platform);

// VM mode: resume the virtual machine and start multichain over ssh
var multichainStartVM = '';
if (wallet_settings.vmname != '') {
  multichainArgs = multichainArgs + ' -rpcallowip=0.0.0.0/0 -rpcbind=10.0.2.15';
  if (isWin) {
    multichainStartVM = '\"' + wallet_settings.vmctrl + '\"' + ' startvm '+wallet_settings.vmname+' -type headless >nul & ';
    multichainCommandRunner = 'plink -P 8322 -i id_rsa-wdd@vm.ppk wdd@' + wallet_settings.multichain.host + ' ';
    //multichainCommandRunner = 'bashfix "bash -c run.sh ';
  }
  else if (isMac) {
    multichainStartVM = 'VBoxManage startvm '+wallet_settings.vmname+' -type headless ; ';
    multichainCommandRunner = 'ssh -o StrictHostKeyChecking=no -p 8322 -i id_rsa-wdd@vm.ppk wdd@' + wallet_settings.multichain.host + ' ';
  }
  else //Native multichaind
  {
    multichainCommand = 'multichaind ' + wallet_settings.chainname;
    multichainArgs = ' -daemon -listen=0 -rpcpassword='+wallet_settings.multichain.pass+' -rpcport=' + wallet_settings.multichain.port;
  }
}

function startMultichain(multichainCommand, seed) {

  console.log(multichainStartVM + multichainCommandRunner + multichainCommand + multichainArgs);
  $('#status').html('Starting multichaind');
  var exec = require('child_process').exec, child;
  child = exec(multichainStartVM + multichainCommandRunner + multichainCommand + multichainArgs,
    function (error, stdout, stderr)
    {
      console.log('stdout: ' + stdout);
      console.log('stderr: ' + stderr);
      console.log('error: ' + error);
      if(error == null)
      {
        if (stderr.toString().indexOf(" already running.") > -1)
        {
          window.location = 'index.html';        
        }
        else if (stdout.toString().indexOf("Please ask blockchain admin or user having activate permission to let you connect") > -1) 
        {
          fs.writeFileSync('permission_request.txt', stdout, 'utf8');
          //$('#status').html(stdout);
          var localAddress = /grant (.+) connect/.exec(stdout)[1];
          prompt('Connection permission required.\n\npermission_request.txt contains info for admin.\n\nDetails: '+stdout, localAddress);
          window.close();
        }
        else if (stdout.toString().indexOf("Error: Couldn't connect to the seed node") > -1) 
        {
          displayError('Connection permission required or unable to connect.\n\nDetails: '+stdout);
        }
        else if (stdout.toString().indexOf("Multichain server starting") > -1) 
        {
          //window.location = 'index.html';        
        }
        else if (stderr.toString().indexOf(" is not complete.") > -1)  //Chain not initialized/found/seeded
        {
          wallet_settings.multichain.seed = prompt("Please enter the IP:port of a node on the network:", wallet_settings.multichain.seed);
          if (wallet_settings.multichain.seed)
          {
            $('#status').html('Seeding multichaind ' + wallet_settings.chainname + '@' + wallet_settings.multichain.seed);
            //Wait a bit and then seed the chain
            setTimeout(function(){ seedMultichain(); }, 1000 * 5);  
          }
          else 
          {
            window.close()
          }
        }
        else
        {
          displayError(stderr);   
        }
      }
      else
      {
        displayError(stdout+error);   
      }
  });

  // PLINK always enforces StrictHostKeyChecking, but we can't know the fingerprint
  child.stderr.on('data', function (data) {
    //console.log('some err:' + data);
    if (data.toString().indexOf("Store key in cache? (y/n)") > -1) {
      child.stdin.setEncoding('utf-8');
      child.stdin.write('y');
    }
  });

  child.stdout.on('data', function (data) {
    console.log('some data:' + data);

    if (seed && data.toString().indexOf("Retrieving blockchain parameters from the seed node") > -1) {
      $('#status').html('Obtaining chain settings and configuring wallet.');
      // No need for setting the password, since we start multichaind with the pass from the settings file
      //setTimeout(function(){ delayedSetPass(wallet_settings.chainname); }, 1000 * 3);
    }

    if (data.toString().indexOf("Node started") > -1) {
      window.location = 'index.html';        
    }
  });

}

function seedMultichain() {
  console.log('Seeding chain');
  multichainCommand = 'multichain-1.0-alpha-23/multichaind ' + wallet_settings.chainname + '@' + wallet_settings.multichain.seed;
  console.log("Command: " + multichainCommand);
  startMultichain(multichainCommand, true);  //Start again, with seed set to true
}



function delayedSetPass(chainname) {
  console.log("Setting pwd");
  var pass = getPass(chainname);
  //console.log('pass: ' + pass);
  setPass(pass);
  console.log('Finished setting pwd');
  setTimeout(function(){ window.location = 'index.html'; }, 1000 * 10);  //Give it some time to seed  
   
}

function displayError(error) {
  console.log('exec error: ' + error);
  alert('Sorry, there has been an error starting multichaind.\n\nDetails: '+error);
  window.close();   
}

function getPass(chainname) {
  return(getConfigSetting(getUserHome() + '/.multichain/' + chainname + '/multichain.conf', 'rpcpassword'));
}

function getUserHome() {
  return process.env[(process.platform == 'win32') ? 'USERPROFILE' : 'HOME'];
}

function getConfigSetting(file, key) {
  //console.log(file);
  var txt = fs.readFileSync(file, 'utf8');
  var lines = txt.split('\n');
  for (var i=0;i<lines.length;i++) 
  {
    var line = lines[i];
    var parts = line.split('=');
    if (parts[0] == key) {
      return(parts[1]);
    }  
  }

  return undefined;
}  

function setPass(pass) {
  configurationFile = 'wallet_settings.json';
  var configuration = JSON.parse(fs.readFileSync(configurationFile));
  configuration.multichain.pass = pass;
  try {
    fs.writeFileSync(configurationFile, JSON.stringify(configuration, null, ' '), 'utf8');
  } catch(e) {
    alert('Unable to save pass to ' + configurationFile);
  }
  global.wallet_settings.multichain.pass = pass;
}

startMultichain(multichainCommand);
