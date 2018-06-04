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
		expect(config.nested.val).to.equal(42);
	});

	it('should load development explicit', function() {
		process.env.APP_ENV = 'development';
		var config = require('../../source/config');
		expect(config.me).to.eql('development');
		expect(config.nested.val).to.equal(42);
		expect(config.nested.val2).to.equal(78);
	});

	it('should load production', function() {
		process.env.APP_ENV = 'production';
		var config = require('../../source/config');
		expect(config.me).to.eql('production');
		expect(config.nested.val).to.equal(84);
	});

	it('should load staging', function() {
		process.env.APP_ENV = 'staging';
		var config = require('../../source/config');
		expect(config).to.deep.eql({
			env: 'staging',
			me: 'global',
			globalField: {
				nested: 'yes'
			},
			nested: {
				val: 90,
				val2: 78
			}
		});
	});

	it('should fail to load', function() {
		process.env.APP_ENV = 'meh';
		var requireConfig = function() {
			require('config');
		};
		expect(requireConfig).to['throw'](Error);
	});

	it('should override with cli args', function() {
		process.argv = ['node', 'file.js', '--app.me', 'hello'];
		var config = require('../../source/config');
		expect(config.me).to.equal('hello');
		expect(config.nested.val).to.equal(42);
	});

	it('should not override non prefixed cli args', function() {
		process.argv = ['node', 'file.js', '--me', 'hello'];
		var config = require('../../source/config');
		expect(config.me).to.equal('development');
		expect(config.nested.val).to.equal(42);
	});

	it('should parse numbers', function() {
		process.argv = ['node', 'file.js', '--app.me', '424'];
		var config = require('../../source/config');
		expect(config.me).to.equal(424);
	});

	it('should parse false', function() {
		process.argv = ['node', 'file.js', '--app.me', '--app.nested.val', 'false'];
		var config = require('../../source/config');
		expect(config.me).to.equal(true);
		expect(config.nested.val).to.equal(false);
	});

	it('should parse true', function() {
		process.argv = ['node', 'file.js', '--app.me', '--app.nested.val', 'true'];
		var config = require('../../source/config');
		expect(config.me).to.equal(true);
		expect(config.nested.val).to.equal(true);
	});

	it('should parse regExp', function() {
		process.argv = ['node', 'file.js', '--app.nested.val', '$regexp(/.*/)'];
		var config = require('../../source/config');
		expect(config.nested.val, JSON.stringify(config, null, '\t')).to.have.property('source', '.*');
	});

	it('should set arguments passed from cli', function() {
		process.argv = ['node', 'file.js', '--app.lolz', '--app.anothernested.val', '42'];
		var config = require('../../source/config');
		expect(config.lolz).to.equal(true);
		expect(config.anothernested).to.not.exist;
	});
});