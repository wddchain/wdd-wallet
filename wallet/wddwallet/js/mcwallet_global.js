
var gui = require('nw.gui');
var win = gui.Window.get();

var fs = require('fs');
global.wallet_settings = JSON.parse(fs.readFileSync('./wallet_settings.json').toString());
global.multichain = require("multichain-node")(global.wallet_settings.multichain);
var i18n = require('i18n');
i18n.configure({
  locales: ['en', 'zh-cn', 'zh-hk'],
  directory: 'locales'
});


i18n.init();

function translate() {
  var items = document.getElementsByTagName("*");
  var cnt = items.length;
  for (var i = 0; i < cnt; i++) {
    var att_cnt = items[i].attributes.length;
    for(var j=0;j<att_cnt;j++) {
      if (items[i].attributes[j].name == 'translate') {
        if (items[i].attributes[j].value)
          items[i].innerHTML = i18n.__(items[i].attributes[j].value);
        else
          items[i].innerHTML = i18n.__(items[i].innerHTML);
      }

      if (items[i].attributes[j].name == 'placeholder') {
        if (items[i].attributes[j].value)
          items[i].attributes[j].value = i18n.__(items[i].attributes[j].value);
      }
    }
  }  
}

var lang_setting = localStorage.getItem('language_setting');
if (lang_setting) {
  //console.log('Language-setting is ' + lang_setting)
  i18n.setLocale(lang_setting);
}

translate();

if (global.wallet_settings.debug) {
	win.showDevTools();
}

win.on('close', function() 
{
  var isWin = /^win/.test(process.platform);
  var isMac = /^darwin/.test(process.platform);

	win.hide();

  if (global.multichain) {
    global.multichain.stop([], function(err, data) {
      if (isWin || isMac) {
          StopWalletVM(function (error, stdout, stderr) {
            console.log('stdout: ' + stdout); console.log('stderr: ' + stderr); console.log('error: ' + error);
            win.close(true);
         });
      }
      else
      {
        win.close(true);
      }
    });   
  }
  else
  {
    console.log('Multichain was not connected. Unable to stop multichain');
    win.close(true);
  }

  //setTimeout(function(){ StopWalletVM(function (error, stdout, stderr) { console.log('stdout: ' + stdout); console.log('stderr: ' + stderr); console.log('error: ' + error); }); }, 1000 * 5);   
});

function StopWalletVM(cb) 
{
  if (global.wallet_settings.vmname != '')   //If using vm, then stop it
  {
    var stopVM = '\"' + global.wallet_settings.vmctrl + '\"' + ' controlvm '+ global.wallet_settings.vmname + ' savestate';
    var exec = require('child_process').exec;
    var child;
    child = exec(stopVM, cb);  //Callback (error, stdout, stderr)
  } else {
    cb();
  }
}
