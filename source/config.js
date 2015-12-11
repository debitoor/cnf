var fs = require('fs');
var path = require('path');
var resolve = require('resolve');
var env = process.env.APP_ENV || process.env.NODE_ENV || 'development';
var deepExtend = require('deep-extend');
var globalConfig;

try {
	var envPath = resolve.sync(env + '.app.config.js', {
		basedir: process.cwd(),
		moduleDirectory: 'config'
	});
	var envFile = require(envPath);
} catch (ex) {
	var envPath = resolve.sync(env + '.js', {
		basedir: process.cwd(),
		moduleDirectory: 'config'
	});
	var envFile = require(envPath);
}

try {
	var globalConfigPath = resolve.sync('global.app.config.js', {
		basedir: process.cwd(),
		moduleDirectory: 'config'
	});
	globalConfig = require(globalConfigPath);
	envFile = deepExtend(globalConfig, envFile);
} catch (e) {
}
if (!globalConfig) {
	try {
		var globalConfigPath = resolve.sync('global.js', {
			basedir: process.cwd(),
			moduleDirectory: 'config'
		});
		var globalConfig = require(globalConfigPath);
		envFile = deepExtend(globalConfig, envFile);
	} catch (e) {
	}

}

var replaceConfigs = function (visit) {
	var next = function (prevKeys, obj) {
		Object.keys(obj).forEach(function (key) {
			var keys = prevKeys.concat(key);

			if (typeof obj[key] === 'object' && obj[key]) {
				return next(keys, obj[key]);
			}

			obj[key] = visit(keys, obj[key]);
		});
	};

	next([], envFile);
};
var lookupConfig = function (key) {
	if (!key.length) {
		return envFile;
	}
	if (!Array.isArray(key)) {
		return lookupConfig(key.split('.'));
	}
	return key.reduce(function (result, key) {
		return result && result[key];
	}, envFile);
};

process.argv.filter(function (arg) {
	return arg.indexOf('--app.') === 0;
}).map(function (arg) {
	var value = process.argv[process.argv.indexOf(arg) + 1];
	var key = arg.split('.').slice(1);
	var result = {};

	result.key = key.pop();
	result.parent = key;
	result.value = !value || value.indexOf('-') === 0 || value;
	return result;
}).forEach(function (item) {
	var parent = lookupConfig(item.parent);

	if (!parent) {
		return;
	}
	parent[item.key] = item.value;
});

var isRegExp = /^\$regexp\((\/.+\/(g|m|i){0,3})\)$/;

replaceConfigs(function (keys, value) {
	if (typeof value !== 'string') {
		return value;
	}
	value = value.replace(/\$\(([^\)]+)\)/g, function (_, key) {
		return lookupConfig(key);
	});
	if (/^\d+$/.test(value)) {
		return parseInt(value, 10);
	}
	if (value === 'false') {
		return false;
	}
	if (value === 'true') {
		return true;
	}
	if (isRegExp.test(value)) {
		return parseRegExp(value);
	}
	return value;
});

function parseRegExp(value) {
	var returnRegExp = new Function("return " + isRegExp.exec(value)[1] + ";");
	return returnRegExp();
}

module.exports = envFile;
module.exports.env = env;
