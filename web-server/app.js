// Compatibility shim for very old express/send on modern Node (res._headers no longer exists)
var http = require('http');
if (!Object.getOwnPropertyDescriptor(http.OutgoingMessage.prototype, '_headers')) {
  Object.defineProperty(http.OutgoingMessage.prototype, '_headers', {
    configurable: true,
    enumerable: false,
    get: function(){ return this.getHeaders(); },
    set: function(){} // ignore writes
  });
}
if (!Object.getOwnPropertyDescriptor(http.OutgoingMessage.prototype, '_headerNames')) {
  Object.defineProperty(http.OutgoingMessage.prototype, '_headerNames', {
    configurable: true,
    enumerable: false,
    get: function(){
      var headers = this.getHeaders();
      var names = {};
      Object.keys(headers).forEach(function(k){ names[k.toLowerCase()] = k; });
      return names;
    },
    set: function(){}
  });
}

var express = require('express');
var app = express();

app.configure(function(){
	app.use(express.methodOverride());
	app.use(express.bodyParser());
	app.use(app.router);
	app.set('view engine', 'jade');
	app.set('views', __dirname + '/public');
	app.set('view options', {layout: false});
	app.set('basepath',__dirname + '/public');
});

app.configure('development', function(){
	app.use(express.static(__dirname + '/public'));
	app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function(){
	var oneYear = 31557600000;
	app.use(express.static(__dirname + '/public', { maxAge: oneYear }));
	app.use(express.errorHandler());
});

console.log("Web server has started.\nPlease log on http://127.0.0.1:3002/index.html");
app.listen(3002);
