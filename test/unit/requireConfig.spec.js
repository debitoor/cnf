describe('config', function() {
	var origArgv = process.argv;
	var origEnv = process.env;

	beforeEach(function() {
		process.argv = origArgv;
		process.env = JSON.parse(JSON.stringify(origEnv));
		process.chdir(__dirname);
		Object.keys(require.cache).forEach(function(key) {
			delete require.cache[key]; // clear loaded modules
		});
	});

	it('should load development', function() {
		var config = require('../../source/config');
		expect(config.me).to.eql('development');
		expect(config.nested.val).to.eql(42);
	});
	it('should load development explicit', function() {
		process.env.APP_ENV = 'development';
		var config = require('../../source/config');
		expect(config.me).to.eql('development');
		expect(config.nested.val).to.eql(42);
	});
	it('shoud load production', function() {
		process.env.APP_ENV = 'production';
		var config = require('../../source/config');
		expect(config.me).to.eql('production');
		expect(config.nested.val).to.eql(84);
	});
	it('should fail to load', function() {
		process.env.APP_ENV = 'meh';
		var config;
		try {
			config = require('../../source/config');
		} catch (err) {
		}
		expect(config).to.not.be.ok;
	});
	it('should override with cli args', function() {
		process.argv = ['node', 'file.js', '--app.me','hello'];
		var config = require('../../source/config');
		expect(config.me).to.eql('hello');
		expect(config.nested.val).to.eql(42);
	});
	it('should not override non prefixed cli args', function() {
		process.argv = ['node', 'file.js', '--me','hello'];
		var config = require('../../source/config');
		expect(config.me).to.eql('development');
		expect(config.nested.val).to.eql(42);
	});
	it('should guess config arg type', function() {
		process.argv = ['node', 'file.js', '--app.me','424'];
		var config = require('../../source/config');
		expect(config.me).to.eql(424);
	});
});