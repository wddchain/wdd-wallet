
var gui = require('nw.gui');
var win = gui.Window.get();

var fs = require('fs');
global.wallet_settings = JSON.parse(fs.readFileSync('./wallet_settings.json').toString());
global.multichain = require("multichain-node")(global.wallet_settings.multichain);

if (global.wallet_settings.debug) {
	win.showDevTools();
}

win.on('close', function() 
{
	win.hide();

  if (global.multichain) {
  	global.multichain.stop([], function(err, data) {
  		win.close(true);
  	});	  
  }
  else
  {
    console.log('Multichain was not connected. Unable to stop multichain');
    win.close(true);
  }
});
