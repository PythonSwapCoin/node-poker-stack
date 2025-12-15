var crypto = require('crypto');

function getKeyAndIv(pwd) {
  // Derive a 32-byte key and deterministic 16-byte IV from the password.
  // This replaces deprecated createCipher/createDecipher APIs removed in modern Node.
  var key = crypto.createHash('sha256').update(String(pwd)).digest();
  var iv = key.subarray(0, 16);
  return { key: key, iv: iv };
}

/**
 * Create token by uid. Encrypt uid and timestamp to get a token.
 * 
 * @param  {String} uid user id
 * @param  {String|Number} timestamp
 * @param  {String} pwd encrypt password
 * @return {String}     token string
 */
module.exports.create = function(uid, timestamp, pwd){
	var msg = uid + '|' + timestamp;
	var keyIv = getKeyAndIv(pwd);
	var cipher = crypto.createCipheriv('aes-256-cbc', keyIv.key, keyIv.iv);
	var enc = cipher.update(msg, 'utf8', 'hex');
	enc += cipher.final('hex');
	return enc;
};

/**
 * Parse token to validate it and get the uid and timestamp.
 * 
 * @param  {String} token token string
 * @param  {String} pwd   decrypt password
 * @return {Object}  uid and timestamp that exported from token. null for illegal token.     
 */
module.exports.parse = function(token, pwd){
	var keyIv = getKeyAndIv(pwd);
	var decipher = crypto.createDecipheriv('aes-256-cbc', keyIv.key, keyIv.iv);
	var dec;
	try{
		dec = decipher.update(token, 'hex', 'utf8');
		dec += decipher.final('utf8');
	} catch(err){
		console.error('[token] fail to decrypt token. %j', token);
		return null;
	}
	var ts = dec.split('|');
	if(ts.length !== 2){
		// illegal token
		return null;
	}
	return {uid: ts[0], timestamp: Number(ts[1])};
};
