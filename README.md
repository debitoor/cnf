cnf [![npm version](https://badge.fury.io/js/cnf.svg)](http://badge.fury.io/js/cnf) [![Build Status](https://travis-ci.org/debitoor/config.svg?branch=master)](https://travis-ci.org/debitoor/config) [![Dependency Status](https://david-dm.org/debitoor/config.svg)](https://david-dm.org/debitoor/config) [![devDependency Status](https://david-dm.org/debitoor/config/dev-status.svg)](https://david-dm.org/debitoor/config#info=devDependencies) [![Coverage Status](https://coveralls.io/repos/debitoor/config/badge.svg?branch=master&service=github)](https://coveralls.io/github/debitoor/config?branch=master)
===

Configuration loader.

	npm install cnf

To use it simply require it:

```js
var config = require('cnf');

console.log('port: ' + config.http.port);
```

It will look for a configuration file called `$APP_ENV.app.config.js` in the current working directory and will be extended with config from `global.app.config.js`.

To override configs use a command line argument prefixed with `app.`

	node example.js --app.http.port 8080

The above line override `http.port` with `8080`

To refer to another part of the config use
```js
{
	port: 8080,
	siteUrl: "http://localhost:$(port)" //this will be "http://localhost:8080"
}
```

Add a regexp using
```
--app.mySetting "$regexp(/myRegExp/gmi)"
```

