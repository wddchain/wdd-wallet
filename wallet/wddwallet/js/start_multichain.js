var fs = require('fs');
var wallet_settings = JSON.parse(fs.readFileSync('./wallet_settings.json').toString());

var multichainCommand = 'multichaind ' + wallet_settings.chainname + ' -daemon';

// var isWin = /^win/.test(process.platform);
// if (isWin) multichainCommand = 'multichaind wdd -daemon';


function startMultchain(multichainCommand, seed) {
  console.log(multichainCommand);
  $('#status').html('Starting multichaind');
  var exec = require('child_process').exec, child;
  child = exec(multichainCommand,
    function (error, stdout, stderr)
    {
      console.log('stdout: ' + stdout);
      console.log('stderr: ' + stderr);
      console.log('error: ' + error);
      if(error == null)
      {
        if (stderr.toString().indexOf("MultiChain Core is probably already running") > -1)
        {
          // multichain already running
          window.location = 'index.html';
        }
        else if (stdout.toString().indexOf("Please ask blockchain admin or user having activate permission to let you connect") > -1) 
        {
          fs.writeFileSync('permission_request.txt', stdout, 'utf8');
          //$('#status').html(stdout);
          displayError('Connection permission required.\n\npermission_request.txt contains info for admin.\n\nDetails: '+stdout);
        }
        else if (stdout.toString().indexOf("Error: Couldn't connect to the seed node") > -1) 
        {
          displayError('Connection permission required or unable to connect.\n\nDetails: '+stdout);
        }
        else if (stdout.toString().indexOf("Multichain server starting") > -1) 
        {
          //window.location = 'index.html';        
        }
        else if (stderr.toString().indexOf("ERROR: Parameter set for blockchain wdd is not complete.") > -1)  //Chain not initialized/found/seeded
        {
          $('#status').html('Seeding multichaind ' + wallet_settings.chainname + '@' + wallet_settings.multichain.seed);
          //Wait a bit and then seed the chain
          setTimeout(function(){ seedMultichain(); }, 1000 * 5);  
        }
        else
        {
          displayError(stderr);   
        }
      }
      else
      {
        displayError(error);   
      }
  });

  child.stdout.on('data', function (data) {
    console.log('some data:' + data);

    if (seed && data.toString().indexOf("Retrieving blockchain parameters from the seed node") > -1) {
      $('#status').html('Obtaining chain settings and configuring wallet.');
      setTimeout(function(){ delayedSetPass(wallet_settings.chainname); }, 1000 * 3);
    }

    if (data.toString().indexOf("Node started") > -1) {
      window.location = 'index.html';        
    }
  })

}

function seedMultichain() {
  console.log('Seeding chain');
  multichainCommand = 'multichaind ' + wallet_settings.chainname + '@' + wallet_settings.multichain.seed + ' -daemon';
  console.log("Command: " + multichainCommand);
  startMultchain(multichainCommand, true);  //Start again, with seed set to true
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

startMultchain(multichainCommand);
