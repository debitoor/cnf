var fs = require('fs');
var path = require('path');
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
	if (!key.length) {
		return envFile;
	}
	if (!Array.isArray(key)) {
		return lookupConfig(key.split('.'));
	}
	return key.reduce(function(result, key) {
		return result && result[key];
	}, envFile);
};

process.argv.filter(function(arg) {
	return arg.indexOf('--app.') === 0;
}).map(function(arg) {
	var value = process.argv[process.argv.indexOf(arg)+1];
	var key = arg.split('.').slice(1);
	var result = {};

	result.key = key.pop();
	result.parent = key;
	result.value = !value || value.indexOf('-') === 0 || value;
	return result;
}).forEach(function(item) {
	var parent = lookupConfig(item.parent);

	if (!parent) {
		return;
	}
	parent[item.key] = item.value;
});

replaceConfigs(function(keys, value) {
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
	if (value === 'true') {
		return true;
	}
	return value;
});

module.exports = envFile;
