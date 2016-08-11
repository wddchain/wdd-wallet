
var wallet_settings = global.wallet_settings;
var multichain = global.multichain;

checkIfReady();

function checkIfReady()
{
	multichain.getInfo([], function(err, data){
		if (!err && data.chainname == wallet_settings.chainname){
			window.location = 'index.html';
		}
		else
		{
			setTimeout(function(){ checkIfReady(); },1000);			
		}
	});	
}
