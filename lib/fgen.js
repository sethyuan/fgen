var hogan = require("hogan.js"),
    util = require("util"),
    events = require("events"),
    fs = require("fs.extra"),
    path = require("path"),
    Generator,
    createGenerator;

Generator = function(dirpath) {
  var walker, self = this;

  events.EventEmitter.call(this);

  if (typeof(dirpath) !== "string" || !fs.existsSync(dirpath)) {
    this.emit("ready", new Error("dirpath argument is not existent or it's wrong."));
    return;
  }

  this.dirpath = dirpath;
  this.templates = {};

  walker = fs.walk(dirpath);
  walker.on("file", function(root, stats, next) {
    var filePath = path.join(root, stats.name),
        key = path.relative(dirpath, filePath);

    fs.readFile(filePath, "utf8", function(err, data) {
      if (err) {
        walker.removeAllListeners("file");
        self.emit("ready", err, self);
      } else {
        self.templates[key] = hogan.compile(data);
        next();
      }
    });
  });
  walker.once("end", function() {
    walker.removeAllListeners("file");
    self.emit("ready", null, self);
  });
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
    generator.once("ready", readyCallback);
  }
  return generator;
};

exports.Generator = Generator;
exports.createGenerator = createGenerator;
