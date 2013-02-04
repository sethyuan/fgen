var hogan = require("hogan.js"),
    util = require("util"),
    events = require("events"),
    fs = require("fs.extra"),
    path = require("path"),
    async = require("async"),
    os = require("os"),
    Generator,
    createGenerator, mapKey, generateToFile, generateToStream;

Generator = function(dirpath) {
  var walker, self = this;

  events.EventEmitter.call(this);

  if (typeof(dirpath) !== "string" || !fs.existsSync(dirpath)) {
    this.emit("ready", new Error("'dirpath' argument is not existent or it's wrong."));
    return;
  }

  this.dirpath = dirpath;
  this._templates = {};
  this.context = {};

  walker = fs.walk(dirpath);
  walker.on("node", function(root, stats, next) {
    var filePath = path.join(root, stats.name),
        key = path.relative(dirpath, filePath);

    switch (stats.type) {
    case "file":
      // Exclude vim's swap files.
      // Consider this a sort of special hack.
      if (path.extname(stats.name) === ".swp") {
        next();
        return;
      }

      fs.readFile(filePath, "utf8", function(err, data) {
        if (err) {
          walker.removeAllListeners("file");
          self.emit("ready", err, self);
        } else {
          self._templates[key] = hogan.compile(data);
          next();
        }
      });
      break;
    case "directory":
      self._templates[key + path.sep] = "directory";
      next();
      break;
    default:
      next();
      break;
    }
  });
  walker.once("end", function() {
    walker.removeAllListeners("file");
    self.emit("ready", null, self);
  });
};
util.inherits(Generator, events.EventEmitter);

mapKey = function(generator, key) {
  var keyTemplate = key.replace(/__([^_]+)__/g, "{{$1}}");
  if (keyTemplate === key) {
    return key;
  } else {
    return hogan.compile(keyTemplate).render(generator.context);
  }
};

generateToFile = function(generator, key, to, callback) {
  var template = generator._templates[key],
      content, filePath;

  if (to.charAt(to.length - 1) === path.sep) {
    // Treat like a container.
    filePath = path.join(to, mapKey(generator, key));
  } else {
    // Treat like a rename.
    filePath = to;
  }

  if (template == null) {
    if (callback) callback(new Error(util.format("key '%s' not found.", key)));
  } else if (template === "directory") {
    fs.mkdirRecursiveSync(filePath);
    if (callback) callback();
  } else {
    fs.mkdirRecursiveSync(path.dirname(filePath));
    content = template.render(generator.context);
    fs.writeFile(filePath, content, "utf8", callback);
  }
};

generateToStream = function(generator, key, to, callback) {
  var template = generator._templates[key];

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
};

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
  var self = this, keys, tasks,
      filter, callback;

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

  keys = Object.keys(this._templates);
  if (filter) keys = keys.filter(filter);
  tasks = keys.map(function(key) {
    var template = self._templates[key];
    return function(callback) {
      var filePath = path.join(to, mapKey(self, key)),
          content;

      if (template === "directory") {
        fs.mkdirRecursiveSync(filePath);
        callback();
      } else {
        fs.mkdirRecursiveSync(path.dirname(filePath));
        content = template.render(self.context),
        fs.writeFile(filePath, content, "utf8", callback);
      }
    };
  });

  async.parallel(tasks, callback);
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
