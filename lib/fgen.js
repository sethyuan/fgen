"use strict";

var path = require("path");
var fs = require("fs.extra");
var util = require("util");
var os = require("os");
var hogan = require("hogan.js");
var async = require("async");
var EventEmitter = require("events").EventEmitter;

function Generator(dirpath) {
  EventEmitter.call(this);

  var self = this;

  async.waterfall([
    function(cb) {
      fs.exists(dirpath, function(exists) { cb(null, exists) });
    }
  ], function(err, exists) {
    if (!exists) {
      self.emit("error", new Error("'" + dirpath + "' cannot be found."));
      return;
    }

    self.dirpath = dirpath;
    self.templates_ = {};
    self.context = {};

    var walker = fs.walk(dirpath);
    walker.on("node", function(root, stats, next) {
      var filePath = path.join(root, stats.name),
          key = path.relative(dirpath, filePath);

      switch (stats.type) {
      case "file":
        // Exclude vim's swap files.
        // Consider this a sort of a special hack.
        if (path.extname(stats.name) === ".swp") {
          next();
          return;
        }

        fs.readFile(filePath, "utf8", function(err, data) {
          if (err) {
            walker.removeAllListeners("file");
            self.emit("error", err);
          } else {
            self.templates_[key] = hogan.compile(data);
            next();
          }
        });
        break;
      case "directory":
        self.templates_[key + path.sep] = "directory";
        next();
        break;
      default:
        next();
        break;
      }
    });
    walker.once("end", function() {
      self.emit("ready", self);
    });
  });
}
util.inherits(Generator, EventEmitter);

Generator.prototype.generate = function(key, to, callback) {
  if (typeof(key) !== "string") {
    if (callback) callback(new Error("'key' is not a string."));
    return;
  }
  key = path.normalize(key);

  if (typeof(to) === "string") {
    to = path.normalize(to);
    generateToFile(this, key, to, callback);
  } else if (typeof(to) === "object" && to.write != null) {
    generateToStream(this, key, to, callback);
  } else {
    if (callback) callback(new Error("'to' has to be either a string or a writable stream."));
  }
};

Generator.prototype.generateAll = function(to /*, filter, callback*/) {
  var filter, callback;

  if (typeof(arguments[2]) === "function") {
    callback = arguments[2];
    filter = arguments[1];
  } else {
    callback = arguments[1];
  }

  if (typeof(to) !== "string") {
    if (callback) callback(new Error("'to' is not a string indicating a path."));
    return;
  }

  var keys = Object.keys(this.templates_);
  if (filter) keys = keys.filter(filter);

  var self = this;
  var tasks = keys.map(function(key) {
    var template = self.templates_[key];
    return function(callback) {
      var filePath = path.join(to, mapKey(self, key));

      if (template === "directory") {
        fs.mkdirRecursiveSync(filePath);
        callback();
      } else {
        fs.mkdirRecursiveSync(path.dirname(filePath));
        var content = template.render(self.context);
        fs.writeFile(filePath, content, "utf8", callback);
      }
    };
  });

  async.parallel(tasks, callback);
};

function mapKey(generator, key) {
  var keyTemplate = key.replace(/__((?:[^_]|_(?!_))+)__/g, "{{$1}}");
  if (keyTemplate === key) {
    return key;
  } else {
    return hogan.compile(keyTemplate).render(generator.context);
  }
}

function generateToFile(generator, key, to, callback) {
  var filePath = (to.charAt(to.length - 1) === path.sep) ?
    // Treat like a container.
    path.join(to, mapKey(generator, key)) : 
    // Treat like a rename.
    to;

  var template = generator.templates_[key];
  if (template == null) {
    if (callback) callback(new Error(util.format("key '%s' not found.", key)));
  } else if (template === "directory") {
    fs.mkdirRecursiveSync(filePath);
    if (callback) callback();
  } else {
    fs.mkdirRecursiveSync(path.dirname(filePath));
    var content = template.render(generator.context);
    fs.writeFile(filePath, content, "utf8", callback);
  }
}

function generateToStream(generator, key, to, callback) {
  var template = generator.templates_[key];
  if (template == null) {
    if (callback) callback(new Error(util.format("key '%s' not found.", key)));
    return;
  } else if (template === "directory") {
    to.write(mapKey(generator, key));
    to.write(os.EOL);
  } else {
    to.write(template.render(generator.context));
    to.write(os.EOL);
  }
  if (callback) callback();
}

function createGenerator(dirpath, readyCallback) {
  var generator = new Generator(dirpath);
  if (readyCallback) generator.once("ready", readyCallback);
  return generator;
}

exports.Generator = Generator;
exports.createGenerator = createGenerator;
