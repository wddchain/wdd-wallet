
var gui = require('nw.gui');
var win = gui.Window.get();

var fs = require('fs');
global.wallet_settings = JSON.parse(fs.readFileSync('./wallet_settings.json').toString());
global.multichain = require("multichain-node")(global.wallet_settings.multichain);
var i18n = require('i18n');
i18n.configure({
  locales: ['en', 'zh-cn', 'zh-hk'],
  directory: process.env.PWD + '/locales'
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
