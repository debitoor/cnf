var fs = require('fs');
var path = require('path');
var nconf = require('nconf');
var env = process.env.APP_ENV || 'development';
var envPath = path.join(process.cwd(),'config',env+'.app.config.js');

if (!fs.existsSync(envPath)) {
	throw new Error(env+' configuration could not be found');
}

var envFile = require(envPath);

var replaceConfigs = function(visit) {
	var next = function(prevKeys, obj) {
		Object.keys(obj).forEach(function(key) {
			var keys = prevKeys.concat(key);

			if (typeof obj[key] === 'object' && obj[key]) {
				return next(keys, obj[key]);
			}

			obj[key] = visit(keys, obj[key]);
		});
	};

	next([], envFile);
};
var lookupConfig = function(key) {
	return key.split('.').reduce(function(result, key) {
		return result && result[key];
	}, envFile);
};

nconf.argv();

replaceConfigs(function(keys, value) {
	var overriden = nconf.get('app:' + keys.join(':'));

	return (overriden && typeof overriden !== 'object') ? overriden : value;
});
replaceConfigs(function(keys, value, parent) {
	if (typeof value !== 'string') {
		return value;
	}
	value = value.replace(/\$\(([^\)]+)\)/g, function(_, key) {
		return lookupConfig(key);
	});
	if (/^\d+$/.test(value)) {
		return parseInt(value,10);
	}
	if (value === 'false') {
		return false;
	}
	return value;
});

module.exports = envFile;
