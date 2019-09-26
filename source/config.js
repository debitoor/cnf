const resolve = require('resolve');
const env = process.env.APP_ENV || process.env.NODE_ENV || 'development';
const deepExtend = require('deep-extend');
let globalConfig, globalConfigPath, envFile, envPath;

function exportDefaultSupport(envPath) {
	let envFile = require(envPath);
	const keys = Object.keys(envFile);
	if (keys.length === 1 && keys[0] === 'default') {
		envFile = envFile.default;
	}
	return envFile;
}

try {
	envPath = resolve.sync(env + '.app.config.js', {
		basedir: process.cwd(),
		moduleDirectory: 'config'
	});
	envFile = exportDefaultSupport(envPath);
} catch (ex) {
	envPath = resolve.sync(env + '.js', {
		basedir: process.cwd(),
		moduleDirectory: 'config'
	});
	envFile = exportDefaultSupport(envPath);
}

try {
	globalConfigPath = resolve.sync('global.app.config.js', {
		basedir: process.cwd(),
		moduleDirectory: 'config'
	});
	globalConfig = exportDefaultSupport(globalConfigPath);
	envFile = deepExtend(globalConfig, envFile);
} catch (e) {
	//ignore error
}
if (!globalConfig) {
	try {
		globalConfigPath = resolve.sync('global.js', {
			basedir: process.cwd(),
			moduleDirectory: 'config'
		});
		globalConfig = exportDefaultSupport(globalConfigPath);
		envFile = deepExtend(globalConfig, envFile);
	} catch (e) {
		//ignore error
	}
}

const replaceConfigs = function(visit) {
	const next = function(prevKeys, obj) {
		Object.keys(obj).forEach(function(key) {
			const keys = prevKeys.concat(key);

			if (typeof obj[key] === 'object' && obj[key]) {
				return next(keys, obj[key]);
			}

			obj[key] = visit(keys, obj[key]);
		});
	};

	next([], envFile);
};
const lookupConfig = function(key) {
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
	const value = process.argv[process.argv.indexOf(arg) + 1];
	const key = arg.split('.').slice(1);
	const result = {};

	result.key = key.pop();
	result.parent = key;
	result.value = !value || value.indexOf('-') === 0 || value;
	return result;
}).forEach(function(item) {
	const parent = lookupConfig(item.parent);

	if (!parent) {
		return;
	}
	parent[item.key] = item.value;
});

const isRegExp = /^\$regexp\((\/.+\/(g|m|i){0,3})\)$/;

replaceConfigs(function(keys, value) {
	if (typeof value !== 'string') {
		return value;
	}
	value = value.replace(/\$\(([^\)]+)\)/g, function(_, key) {
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
	const returnRegExp = new Function('return ' + isRegExp.exec(value)[1] + ';');
	return returnRegExp();
}

module.exports = envFile;
module.exports.env = env;
