var hogan = require("hogan.js"),
    util = require("util"),
    events = require("events"),
    Generator,
    createGenerator;

Generator = function(dirpath) {
  events.EventEmitter.call(this);
  this.dirpath = dirpath;

  // TODO read all template files and compile them at once,
  // emit "ready" event when done.
};
util.inherits(Generator, events.EventEmitter);

Generator.prototype.generate = function(from, to, callback) {
  // TODO
};

Generator.prototype.generateAll = function(to, callback) {
  // TODO
};

var createGenerator = function(dirpath, readyCallback) {
  var generator = new Generator(dirpath);
  if (typeof(readyCallback) === "function") {
    generator.on("ready", readyCallback);
  }
  return generator;
};

exports.Generator = Generator;
exports.createGenerator = createGenerator;
