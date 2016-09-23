var satoshisInABitcoin = 100000000;

if (localStorage.fiatCurrency==undefined) localStorage.setItem('fiatCurrency', '');
$('#fiat_currency_setting').val(localStorage.fiatCurrency);

var minFee = 0.0001;
var availableBalance;
var estimatedBalance;
var incomingBitcoins;
var fiatValue = 0.00;
var mainAddress;
var qrcode = new QRCode('main_address_qrcode');
var sendingStatus;
var transactionTable;
var statusInfo;

var fs = require('fs');
wallet_settings = JSON.parse(fs.readFileSync('./wallet_settings.json').toString());
console.log(global.wallet_settings);
multichain = require("multichain-node")(wallet_settings.multichain);

//var wallet_settings = global.wallet_settings;
//var multichain = global.multichain;

var gui = require('nw.gui');
var win = gui.Window.get();
var clipboard = gui.Clipboard.get();
var moment = require('moment');


console.log ('locales: ' + process.env.PWD + '/locales');
console.log('After multichain init');

if (typeof String.prototype.startsWith != 'function') {
  String.prototype.startsWith = function (str){
    return this.slice(0, str.length) == str;
  };
}

sendCommand('get_main_address');
loopUpdateStatus();
loopUpdateBalance();
loopUpdateFiatValue();
loopUpdateTransactions();
//loadAndShowApps();
loadAssets();
setTimeout(function(){ loadOwnedAssets(); }, 1000*1); //One second to get main address

$('#fiat_currency_setting').change(function() 
{
	localStorage.setItem('fiatCurrency', $('#fiat_currency_setting').val());
	if (localStorage.fiatCurrency!='')
	{
		sendCommand('get_bitcoin_value '+localStorage.fiatCurrency);
	}
	else
	{
		guiUpdate();
	}
});

$('#language_setting').change(function()
{
	var lang = $('#language_setting').val();
  localStorage.setItem('language_setting', lang);
  i18n.setLocale(lang);
  console.log('Language set to ' + lang);
  window.location='index.html';
});

$('#status_update_button').click(function() 
{
	loopUpdateStatus();
});

$('#paste_address_button').click(function() 
{
	$('#send_to_address').val(clipboard.get('text'));
});

$('#paste_asset_address_button').click(function() 
{
	$('#send_asset_to_address').val(clipboard.get('text'));
});


$('#qr_code_reader_button').click(function() 
{
	window.location = 'qr_code_reader.html';
});

$('#backup_wallet_button').click(function() 
{
	window.location = 'backup_wallet.html';
});

$('#backup_words_button').click(function() 
{
	window.location = 'backup_wordlist.html';
});

$('#qr_code_reader_asset_button').click(function() 
{
	window.location = 'qr_code_reader.html?asset';
});

$.urlParam = function(name){
    var results = new RegExp('[\\?&]' + name + '=([^&#]*)').exec(window.location.href);
    if (results==null){
       return null;
    }
    else{
       return results[1] || 0;
    }
}

if ($.urlParam('send_to_address')!=null && $.urlParam('send_to_address')!='')
{
	$('#main_tabs a[href="#send_currency_tab"]').tab('show');
	$('#send_to_address').val($.urlParam('send_to_address'));
}

if ($.urlParam('send_asset_to_address')!=null && $.urlParam('send_asset_to_address')!='')
{
	$('#main_tabs a[href="#send_asset_tab"]').tab('show');
	$('#send_asset_to_address').val($.urlParam('send_asset_to_address'));
}

$('#send_bitcoins_button').click(function() 
{
	var satoshiAmount = ($('#amount_to_send').val().toString()*satoshisInABitcoin).toFixed(0);
	
	console.log('Amount of send (BTC): '+$('#amount_to_send').val().toString());
	console.log('Amount to send (Satoshis): '+satoshiAmount);
	
	// var command = 'send_bitcoins ';
	// command += $('#send_to_address').val();
	// command += ' ';
	// command += (satoshiAmount);
	// command += ' ';
	// command += window.btoa($('#password').val());
	
	setSendingEnabledState(false);
	
	sendingStatus = 'Sending...';
	guiUpdate();

	sendCurrency($('#send_to_address').val(),$('#amount_to_send').val().toString());
});


$('#send_asset_button').click(function() 
{
	console.log('Amount of send ('+$('#asset').val().toString() + ': '+$('#asset_amount_to_send').val().toString());
		
	setSendingEnabledState(false);
	
	sendingAssetStatus = 'Sending asset...';
	guiUpdate();
	
	sendAsset($('#asset').val().toString(), $('#send_asset_to_address').val(),$('#asset_amount_to_send').val().toString());
});


function guiUpdate()
{
	if (typeof availableBalance!='undefined')
	{
		$('#balance').html(availableBalance);
		// $('#balance').attr('title', availableBalance);
	}

	$('#status').html(statusInfo);
	
	incomingBitcoins = ((estimatedBalance*satoshisInABitcoin)-(availableBalance*satoshisInABitcoin))/satoshisInABitcoin;
	if (incomingBitcoins>0)
	{
		$('#incoming').html('(+ ' + incomingBitcoins + ' incoming)');
	}
	else
	{
		$('#incoming').html('');
	}
	
	if (typeof fiatValue!='undefined')
	{
		if (fiatValue>0 && localStorage && localStorage.fiatCurrency!='')
		{
			$('#fiat_value').html((availableBalance*fiatValue).toFixed(2));
			$('#fiat_currency').html(localStorage.fiatCurrency);
		}
		else
		{
			$('#fiat_value').html('');
			$('#fiat_currency').html('');
		}
	}

	if (localStorage.getItem('language_setting')) {
		$('#language_setting').val(localStorage.getItem('language_setting'));
	}
	
	if (typeof mainAddress!='undefined')
	{
		$('#main_address').html(mainAddress);
		qrcode.makeCode(mainAddress);
		$('#main_address_qrcode').attr('title', '');
	}
	
	if (typeof minFee!='undefined')
	{
		$('#min_fee').html(minFee);
	}

	if (typeof assetList != 'undefined') {
		var owned_qty;
		$('select#asset').empty();

		for(var ali = 0;ali < assetList.length;ali++) {
			var asset_name = assetList[ali].name;
			assetList[ali].owned_qty = 0;
			if (typeof ownedAssetList != 'undefined') {
				for(var oli = 0; oli < ownedAssetList.length;oli++) {
					if (ownedAssetList[oli].name == assetList[ali].name && ownedAssetList[oli].assetref == assetList[ali].assetref)
						assetList[ali].owned_qty = ownedAssetList[oli].qty;
				}
			}
			var asset_description = asset_name + ' (' + assetList[ali].owned_qty + ' of ' + assetList[ali].issueqty + ')'
			$('select#asset').append( $("<option>").val(asset_name).html(asset_description));
		}
	}
	
	if (typeof transactionTable!='undefined')
	{
		$('#transaction_table').html(transactionTable);
	}
	
	if(typeof sendingStatus!='undefined' && sendingStatus!='')
	{
		if (sendingStatus.startsWith('SUCCESS:::'))
		{
			var sendingStatusParts = sendingStatus.split(':::');
			$('#sending_status').html(sendingStatusParts[1]);
			$('#sending_status').css('display', 'block');
			$('#sending_status').attr('class', 'alert alert-success');
			
			setSendingEnabledState(true);
			blankSendingFields();			
		}
		else if (sendingStatus.startsWith('ERROR:::'))
		{
			var sendingStatusParts = sendingStatus.split(':::');
			$('#sending_status').html(sendingStatusParts[1]);
			$('#sending_status').css('display', 'block');
			$('#sending_status').attr('class', 'alert alert-danger');
			
			setSendingEnabledState(true);
		}
		else
		{
			$('#sending_status').html(sendingStatus.split(':::'));
			$('#sending_status').css('display', 'block');
			$('#sending_status').attr('class', 'alert alert-info');
		}
		
		sendingStatus = '';
	}

	if(typeof sendingAssetStatus!='undefined' && sendingAssetStatus!='')
	{
		if (sendingAssetStatus.startsWith('SUCCESS:::'))
		{
			var sendingAssetStatusParts = sendingAssetStatus.split(':::');
			$('#sending_asset_status').html(sendingAssetStatusParts[1]);
			$('#sending_asset_status').css('display', 'block');
			$('#sending_asset_status').attr('class', 'alert alert-success');
			
			setSendingEnabledState(true);
			blankAssetSendingFields();			
		}
		else if (sendingAssetStatus.startsWith('ERROR:::'))
		{
			var sendingAssetStatusParts = sendingAssetStatus.split(':::');
			$('#sending_asset_status').html(sendingAssetStatusParts[1]);
			$('#sending_asset_status').css('display', 'block');
			$('#sending_asset_status').attr('class', 'alert alert-danger');
			
			setSendingEnabledState(true);
		}
		else
		{
			$('#sending_asset_status').html(sendingAssetStatus.split(':::'));
			$('#sending_asset_status').css('display', 'block');
			$('#sending_asset_status').attr('class', 'alert alert-info');
		}
		
		sendingAssetStatus = '';
	}

}

function blankSendingFields()
{
	$('#send_to_address').val("");
	$('#amount_to_send').val("");
	//$('#password').val("");
}

function blankAssetSendingFields()
{
	$('#send_asset_to_address').val("");
	$('#asset_amount_to_send').val("");
	//$('#password').val("");
}

$('#amount_to_send').keyup(function()
{
	var totalAmountToSend = parseFloat($('#amount_to_send').val())+minFee;
		
	if ($('#amount_to_send').val()==="")
	{
		$('#amount_to_send').css('border-color', '');
		$('#amount_alert').html('');
	}
	else if ($('#amount_to_send').val()===0)
	{
		$('#amount_to_send').css('border-color', '#ff0000');
		$('#amount_alert').html(i18n.__('You can\'t send zero.'));
	}
	else if ($('#amount_to_send').val()<0)
	{
		$('#amount_to_send').css('border-color', '#ff0000');
		$('#amount_alert').html(i18n.__('You can\'t send negative amounts.'));
	}
	else if (totalAmountToSend>availableBalance)
	{
		$('#amount_to_send').css('border-color', '#ff0000');
		$('#amount_alert').html(i18n.__('You don\'t have enough.'));
	}
	else
	{
		$('#amount_to_send').css('border-color', '');
		$('#amount_alert').html('');
	}
});

function setSendingEnabledState(setSendingEnabled)
{
	if (setSendingEnabled==true)
	{
		$('#send_to_address').removeAttr("disabled");
		$('#amount_to_send').removeAttr("disabled");
		$('#password').removeAttr("disabled");
		$('#qr_code_reader_button').removeAttr("disabled");
		$('#send_bitcoins_button').removeAttr("disabled");
		$('#send_asset_button').removeAttr("disabled");
		$('#asset').removeAttr("disabled");
	}
	else
	{
		$('#send_to_address').attr("disabled", "disabled");
		$('#amount_to_send').attr("disabled", "disabled");
		$('#password').attr("disabled", "disabled");
		$('#qr_code_reader_button').attr("disabled", "disabled");
		$('#send_bitcoins_button').attr("disabled", "disabled");
		$('#send_asset_button').attr("disabled", "disabled");
		$('#asset').attr("disabled", "disabled");
	}
}

function loopUpdateBalance()
{
	sendCommand('get_available_balance');
	sendCommand('get_estimated_balance');
	setTimeout(function(){ loopUpdateBalance(); }, 2500);
}

function loopUpdateStatus()
{
	sendCommand('get_status');
	setTimeout(function(){ loopUpdateStatus(); }, 60000);
}

function loopUpdateTransactions()
{
	sendCommand('get_transactions');
	setTimeout(function(){ loopUpdateTransactions(); }, 2500);
}

function loopUpdateFiatValue()
{
	sendCommand('get_bitcoin_value '+localStorage.fiatCurrency);
	setTimeout(function(){ loopUpdateFiatValue(); }, 1000*60*1);
}

function loadAssets()
{
	sendCommand('load_assets');
	setTimeout(function(){ loadAssets(); }, 1000*60*60); //Hourly
}

function loadOwnedAssets()
{
	sendCommand('load_owned_assets');
	setTimeout(function(){ loadOwnedAssets(); }, 1000*5); //Five second update on assets
}

function sendCommand(command) 
{
	console.log("Command is: " + command);

	if (command=='get_available_balance' || command == 'get_estimated_balance')
	{
	  multichain.getBalance([],function(err, data) {
	  	availableBalance = data;
			guiUpdate();
	  });	
	}

	if (command=='get_status')
	{
		multichain.getInfo([],function(err, data) {
	  	statusInfo = formatStatusInfo(data);
			guiUpdate();
	  });	
	}

	if (command=='get_main_address')
	{
	  multichain.getAddresses([],function(err, data) {
	  	if (err) {
	  		mainAddress = '(Unable to get address.  Ensure you have connect permission.)';
	  	}
	  	else if (data[0]) {
	  		mainAddress = data[0];
	  	}
	  	else
	  	{
	  		mainAddress = '(Unable to get address.)';
	  	}
	  	console.log('mainAddress is ' + mainAddress);
			guiUpdate();

	  });	
	}

	if (command=='get_transactions')
	{
	  multichain.listAddressTransactions([mainAddress],function(err, data) {
	  	if (data) {
		  	//console.log('listAddressTransactions Data: ' + JSON.stringify(data));
		  	transactionTable = createTransactionTable(data);
				guiUpdate();
			}
	  });	
	}	

	if (command == 'load_assets' )
	{
	  multichain.listAssets([mainAddress],function(err, data) {
	  	if (!err && data) {
	  		assetList = data;
				guiUpdate();
			}
	  });			
	}

	if (command == 'load_owned_assets' )
	{
	  multichain.getAddressBalances([mainAddress],function(err, data) {
	  	if (err)
	  		console.log(err);

	  	if (!err && data) {
	  		ownedAssetList = data;
	  		console.log('ownedAssetList: '+JSON.stringify(ownedAssetList));
				guiUpdate();
			}
	  });			
	}

	

	if (command=='ping')
	{
	  multichain.getInfo([],function(err, data) {
	  	if (data) {
	  		return('pong');
			} else {
				return('');
			}

	  });	
	}	


  if (command.startsWith('get_bitcoin_value')) {
  	//TODO - Switch to querying an API
  	fiatValue = '0.4';
		guiUpdate();
  }


/*
  multichain.getInfo([],function(err, info) {
    console.log(info);
  });
*/	
}

function sendCurrency(address, amount) {
	  multichain.sendToAddress([address, parseFloat(amount)],function(err, data) {
	  	if (err) {
	  		sendingStatus = 'ERROR:::'+JSON.stringify(err);
	  	} else if (data) {
	  		sendingStatus = 'SUCCESS:::' + data;
	  	}
	  	else {
	  		sendingStatus = 'ERROR:::No response from multichain';
	  	}
	  	guiUpdate();
	  });

}

function sendAsset(asset, address, amount) {
	  multichain.sendAssetToAddress([address, asset, parseFloat(amount)],function(err, data) {
	  	if (err) {
	  		sendingAssetStatus = 'ERROR:::'+JSON.stringify(err);
	  	} else if (data) {
	  		sendingAssetStatus = 'SUCCESS:::' + data;
	  	}
	  	else {
	  		sendingAssetStatus = 'ERROR:::No response from multichain';
	  	}
	  	guiUpdate();
	  });
}



function sendCommandx(command)
{
	var net = require('net');

	var HOST = 'localhost';
	var PORT = 7176;

	var client = new net.Socket();
	
	client.on('error', function (err)
	{
		window.location = 'connection_error.html';
	});
	
	client.connect(PORT, HOST, function() 
	{
		console.log('Connected to: ' + HOST + ':' + PORT);
	});
	
	client.on('data', function(data) 
	{
		console.log(data);
		if (data=='jslick:')
		{
			if (console!=null)
			{
				if (command.startsWith('send_bitcoins'))
				{
					console.log('Sending command: (command hidden as it contains password)');
				}
				else
				{
					console.log('Sending command: '+command);
				}
			}
			client.write(command+'\n');
		}
		else if (data=='not_ready')
		{
			client.destroy();
			window.location = 'not_ready.html';
		}
		else if (data=='not_encrypted')
		{
			client.destroy();
			window.location = 'set_password.html';
		}
		else
		{
			if (console!=null)
			{
				console.log('Response received: ' + data);
			}
			client.destroy();
			
			if (command=='get_available_balance')
			{
				availableBalance = (data.toString()/satoshisInABitcoin);
			}
			else if (command=='get_estimated_balance')
			{
				estimatedBalance =  (data.toString()/satoshisInABitcoin);
			}
			else if (command.startsWith('get_bitcoin_value'))
			{
				fiatValue = data.toString();
			}
			else if (command=='get_main_address')
			{
				mainAddress = data.toString();
			}
			else if (command.startsWith('send_bitcoins'))
			{
				sendingStatus = data.toString();
			}
			else if (command=='get_transactions')
			{
				transactionTable = createTransactionTable(data.toString());
			}
			
			guiUpdate();
		}
	});
	
	client.on('close', function() 
	{
		if (console!=null) console.log('Connection closed');
	});
}

function createTransactionTable(txs)
{
	var transactionTable = '';
	
	transactionTable += '<tr>';
	transactionTable += '<th>' + i18n.__('Date time') + '</th>';
	transactionTable += '<th>' + i18n.__('Address') + '</th>';
	transactionTable += '<th>' + i18n.__('Qty') + '</th>';
	transactionTable += '</tr>';
	
	//console.log(txs);

	for (var i = txs.length - 1; i >=0 ; i--) 
	{
		transactionTable += '<tr>';
		
		transactionTable += '<td>';
		transactionTable += moment.unix(txs[i].time).format('LLL');
		transactionTable += '</td>';

		transactionTable += '<td>';
		if (txs[i].addresses[0]) {
		  transactionTable += '<a href="#" data-toggle="popover" onclick="prompt(\'TX ID:\', \''+ txs[i].txid + '\');" ./title="' + txs[i].txid + '">' + txs[i].addresses[0] + '</a>';
		} else if (txs[i].generated === true) {
			transactionTable += '<a href="#" data-toggle="popover" title="' + txs[i].txid + '">Mined</a>';
		} else {
			if (txs[i].balance && txs[i].balance.amount == 0) {
			  transactionTable += '<a href="#" data-toggle="popover" title="' + txs[i].txid + '">Self</a>';		
			} else {
				transactionTable += 'Unknown';
			}
		}

		transactionTable += '</td>';

		transactionTable += '<td>';
		if (txs[i].balance.amount) {
			transactionTable += txs[i].balance.amount.toLocaleString('en-IN', { minimumFractionDigits : 8}) + ' ' + wallet_settings.native_currency;
		} 


		if (txs[i].balance.assets) {
			for(var ai = 0;ai < txs[i].balance.assets.length; ai++) {
				//If we have a native currency balance and asset, put them in the same row with a newline
				if (txs[i].balance.amount && txs[i].balance.assets && txs[i].balance.assets[ai].qty)
					transactionTable += '<br />';

				if (txs[i].balance.assets && txs[i].balance.assets[ai].qty)
					transactionTable += txs[i].balance.assets[ai].qty.toLocaleString('en-IN', { minimumFractionDigits : 2});

				if (txs[i].balance.assets && txs[i].balance.assets[ai].name)
					transactionTable += ' ' + txs[i].balance.assets[ai].name;
			}
    }

		if (txs[i].permissions && txs[i].permissions[0]) {
			transactionTable += makePermissionString(txs[i].permissions[0]);
    }

		transactionTable += '</td>';
		
		transactionTable += '</tr>';
	}
	
	return transactionTable;
}

function loadAndShowApps()
{
	var appDirRoot = "./apps"
	var appDirs = fs.readdirSync(appDirRoot);
	
	var nameFile = 'name.txt';
	var descriptionFile = 'description.txt';
	var iconFile = 'icon.png';
	var indexFile = 'index.html';
	
	var totalAppDirs = appDirs.length;
	for (var i = 0; i < totalAppDirs; i++) 
	{
		var appDir = appDirRoot+'/'+appDirs[i];
		
		if (!fs.lstatSync(appDir).isDirectory()) continue;
		
		var appName = fs.readFileSync(appDir+'/'+nameFile, 'utf8');
		var appDescription = fs.readFileSync(appDir+'/'+descriptionFile, 'utf8');
				
		var appTableItem = '';
		
		appTableItem += '<tr>';
		appTableItem += '<td>';
		appTableItem += '<div id="app_icon">';
		appTableItem += '<img src="'+appDir+'/'+iconFile+'" />';
		appTableItem += '</div>';
		appTableItem += '</td>';
		appTableItem += '<td>';
		appTableItem += '<div id="app_name">';
		appTableItem += appName;
		appTableItem += '</div>';
		appTableItem += '<div id="app_description">';
		appTableItem += appDescription;
		appTableItem += '</div>';
		appTableItem += '<button class="btn btn-default" onclick="window.open(\''+appDir+'/'+indexFile+'\', \'_blank\');">Launch</button>';
		appTableItem += '</td>';
		appTableItem += '</tr>';
						
		$('#apps_table').append(appTableItem);
	}
}

function formatStatusInfo(dta) {
	var t = '';
	if (dta) {
		t += i18n.__("Wallet Version") + ": " + wallet_settings.version;
		t += '<p />';
		t += i18n.__("Blockchain Version") + ": " + dta.version;
		t += '<p />';
		t += i18n.__("Blocks") + ": " + dta.blocks;
		t += '<p />';
		t += i18n.__("Connections") + ": " + dta.connections;
		t += '<p />';
		if (dta.errors && dta.errors.length) {
			t += i18n.__("Errors") + ": " + dta.errors;
			t += '<p />';
		}
	}
	else
	{
		t += 'Status not available';
	}
  return(t);
}

function makePermissionString(permission) {
	var t = '';
	t += permText(permission.connect, i18n.__('Connect'), permission);
	t += permText(permission.send, i18n.__('Send'), permission);
	t += permText(permission.receive, i18n.__('Receive'), permission);
	t += permText(permission.issue, i18n.__('Issue'), permission);
	t += permText(permission.mine, i18n.__('Mine'), permission);
	t += permText(permission.admin, i18n.__('Admin'), permission);
	t += permText(permission.activate, i18n.__('Activate'), permission);

	return(t);
}

function permText(perm, txt, permission)
{
	if (perm)
	{
		if (permission.endblock == 0)  //Permission revoked
			return('<del>'+txt+'</del> ');
		else
		  return('+' + txt+' ');
	}
	else
	{
		return('');
	}
}