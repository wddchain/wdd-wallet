
$('#cancel_button').click(function() 
{
	window.location = 'index.html#send_currency_tab';
});

$('#reader').html5_qrcode(
	function(data)
	{
		var bitcoin_prefix = 'bitcoin:';
		
		if (data.startsWith(bitcoin_prefix)) data = data.substring(bitcoin_prefix.length);
		
		var qMarkPos = data.indexOf('?');
		
		if (qMarkPos!=-1)
		{
			data = data.substring(0, qMarkPos);
		}
		
		//console.log(data);

		if (window.location.href.indexOf('?asset') > 0) 
		{
			window.location = 'index.html#send_asset_tab?send_asset_to_address='+data;
		} 
		else 
		{
			window.location = 'index.html#send_currency_tab?send_to_address='+data;
		}

	},
	function(error)
	{
		
	}, 
	function(videoError)
	{
		alert('Sorry, we could not start the QR Code reader.');
		window.location = 'index.html';
	}
);

if (typeof String.prototype.startsWith != 'function') {
  String.prototype.startsWith = function (str){
	return this.slice(0, str.length) == str;
  };
}
