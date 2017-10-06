cnf [![npm version](https://badge.fury.io/js/cnf.svg)](http://badge.fury.io/js/cnf) [![Build Status](https://travis-ci.org/debitoor/cnf.svg?branch=master)](https://travis-ci.org/debitoor/cnf) [![Dependency Status](https://david-dm.org/debitoor/cnf.svg)](https://david-dm.org/debitoor/cnf) [![devDependency Status](https://david-dm.org/debitoor/cnf/dev-status.svg)](https://david-dm.org/debitoor/cnf#info=devDependencies) [![Coverage Status](https://coveralls.io/repos/debitoor/cnf/badge.svg?branch=master&service=github)](https://coveralls.io/github/debitoor/cnf?branch=master)
===

Configuration loader.

	npm install -SE cnf 

To use it simply require it:

```js
var config = require('cnf');

console.log('port: ' + config.http.port);
```

It will look for a configuration file called `/config/$APP_ENV.js` in the current working directory and will be extended with config from `global.js`.

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

