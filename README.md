config
======

Configuration loader.

To use it simply require it:

	var config = require('config');

	console.log('port: '+config.http.port);

It will look for a configuration file called `$APP_ENV.app.config.js` in the current working directory.

To override configs use a command line argument prefixed with `app.`

	node example.js --app.http.port 8080

The above line override `http.port` with `8080`