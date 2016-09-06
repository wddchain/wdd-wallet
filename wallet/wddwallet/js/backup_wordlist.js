var bitcore = require('bitcore-lib');
var Mnemonic = require('bitcore-mnemonic');
var assert = require('assert');
//var b58 = require('bs58');
var Base58 = bitcore.encoding.Base58;
var Hash = bitcore.crypto.Hash;

var fs = require('fs');
wallet_settings = JSON.parse(fs.readFileSync('./wallet_settings.json').toString());
multichain = require("multichain-node")(wallet_settings.multichain);

$('#wordlist_cancel_button').click(function() 
{
	window.location = 'index.html#send_currency_tab';
});


$('#show_wordlist_button').click(function() 
{
  getPrivateKey(function(err, data) {
    if (err) 
    {
      return alert(JSON.stringify(err));
    }
    else 
    {
      if (data.address_count > 1)
        alert(i18n.___('Warning: Backup will only work with one address.  More than one address found.'));

      if (data.address_count == 0)
        alert(i18n.___('Warning: No address found.'));

      var wordlist = privateKeyConvertToMnemonic(data.key, data.chainparams['private-key-version'], data.chainparams['address-checksum-value'])
      $('#backup_words').html(wordlist);
      // alert("getPrivateKey return: " + JSON.stringify(data));
      // pKeyBuffer = Base58.decode(data.key);
      // alert('Buffer length:' + pKeyBuffer.length);
      // prompt('Buffer: ',  pKeyBuffer.toString('hex'));
      //alert(JSON.stringify(data));
      mnemonicToPrivateKey(wordlist, data.chainparams['private-key-version'], data.chainparams['address-checksum-value']);
    }
  });

  //var code = new Mnemonic(256, getWordList());
  //var thewords = code.toString();

});

$('#restore_wordlist_button').click(function() 
{
  getPrivateKey(function(err, data) {
    if (data.address_count >= 1) {
      var rslt = confirm(i18n.__('Warning: You already have an address.  Continue?'));
      //alert(rslt);
      if (rslt == false) {
        return;
      }
    }

    var words = prompt(i18n.__('Enter your 24 words.'));

    if (words) {
      try {
        if (Mnemonic.isValid(words))
        {
          var importableKey = mnemonicToPrivateKey(words, data.chainparams['private-key-version'], data.chainparams['address-checksum-value']);
          setPrivateKey(importableKey, function (err, info) {
            if (!err)
              alert(i18n.__('Wallet restored.'));
          });
        }
        else
        {
          alert(i18n.__('Words are not valid.  Please check the words and try again.'));
        }
      } catch (e) {
        alert(i18n.__("Not enough words."));
      }
    }
  });
});

function getWordList() {
  if (lang_setting === 'zh-cn' || lang_setting === 'zh_hk')
    return(Mnemonic.Words.CHINESE);
  return(Mnemonic.Words.ENGLISH);
}

function getPrivateKey(cb) {
  var retval = {};
  multichain.getAddresses([],function(err, data) {
  if (!err && data && data[0]) {
      retval.address = data[0];
      retval.address_count = data.length;
      multichain.dumpPrivKey([data[0]],function(err, data) {
        if (err)
          return(cb(err));
        retval.key = data;
        multichain.getBlockchainParams([], function (err, data) {
          retval.chainparams = data;
          cb(err, retval);
        });
      });
    }
    else
    {
      alert('Address not found.');
    }
  });
}


function setPrivateKey(importableKey, cb) {
  var retval = {};
  multichain.importPrivKey([importableKey], cb);
}



function privateKeyConvertToMnemonic(base58Key, pk_version, address_checksum) {
  assert(pk_version && (pk_version.length === 2 || pk_version.length === 8), 'Expects hex string (1 byte or 4 byte) for private-key-version');
  assert(address_checksum && (address_checksum.length === 2 || address_checksum.length === 8), 'Expects hex string (1 byte or 4 byte) for address_checksum');
  var pKeyBuffer = Base58.decode(base58Key);
  assert(pKeyBuffer.length >= 38, 'pKeyBuffer not long enough');
  var pkVersion = new Buffer(pk_version, 'hex');
  var addressChecksum = new Buffer(address_checksum, 'hex');

  //Remove the version bytes
  if (pkVersion.length === 4)
  {
    var pKeyRaw = Buffer.concat([pKeyBuffer.slice(1, 9), pKeyBuffer.slice(10, 18), pKeyBuffer.slice(19, 27), pKeyBuffer.slice(28, 36)])
  }

  if (pkVersion.length === 1) 
  {
    var pKeyRaw = pKeyBuffer.slice(1, 33);    
  }

  assert(pKeyRaw.length === 32, 'Raw key should be 32 bytes.  It is ' + pKeyRaw.length);

  var mnemonic = new Mnemonic(pKeyRaw, getWordList());

  return(mnemonic.toString());
}

function mnemonicToPrivateKey(wordlist, pk_version, address_checksum) {
  assert(pk_version && (pk_version.length === 2 || pk_version.length === 8), 'Expects hex string (1 byte or 4 byte) for private-key-version');
  assert(address_checksum && (address_checksum.length === 2 || address_checksum.length === 8), 'Expects hex string (1 byte or 4 byte) for address_checksum');
  var pkVersion = new Buffer(pk_version, 'hex');
  var addressChecksum = new Buffer(address_checksum, 'hex');

  if (!Mnemonic.isValid(wordlist)) {
    alert(i18n.__('Word list is not valid.'));
    return;
  }

  var rawKeyBuffer = Mnemonic.toBuffer(wordlist);
  var compressedFlag = new Buffer('01', 'hex');

  //Merge in the version bytes
  if (pkVersion.length === 4)
  {
    var pKey = Buffer.concat([pkVersion.slice(0,1), rawKeyBuffer.slice(0,8), pkVersion.slice(1,2), rawKeyBuffer.slice(8,16), pkVersion.slice(2,3), rawKeyBuffer.slice(16, 24), pkVersion.slice(3,4), rawKeyBuffer.slice(24, 32), compressedFlag]);
  }

  if (pkVersion.length === 1)
  {
    var pKey = Buffer.concat([pkVersion.slice(0,1), rawKeyBuffer, compressedFlag]);
  }

  var checksum = xorBuffer(Hash.sha256sha256(pKey).slice(0,4), addressChecksum);

  var pKeyWithChecksum = Buffer.concat([pKey, checksum]);

  var importableKey = Base58.encode(pKeyWithChecksum);

  return(importableKey);
}

function xorBuffer(a, b) {
  if (!Buffer.isBuffer(a)) a = new Buffer(a)
  if (!Buffer.isBuffer(b)) b = new Buffer(b)
  var res = []
  if (a.length > b.length) {
    for (var i = 0; i < b.length; i++) {
      res.push(a[i] ^ b[i])
    }
  } else {
    for (var i = 0; i < a.length; i++) {
      res.push(a[i] ^ b[i])
    }
  }
  return new Buffer(res);
}