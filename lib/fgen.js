var hogan = require("hogan.js"),
    util = require("util"),
    events = require("events"),
    fs = require("fs.extra"),
    path = require("path"),
    async = require("async"),
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
          self.templates[key] = hogan.compile(data);
          next();
        }
      });
      break;
    case "directory":
      self.templates[key] = "directory";
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

Generator.prototype._mapKey = function(key) {
  var keyTemplate = key.replace(/__([^_]+)__/g, "{{$1}}");
  if (keyTemplate == key) {
    return key;
  } else {
    return hogan.compile(keyTemplate).render(this.context);
  }
};

Generator.prototype.generate = function(key, to, callback) {
  var template = this.templates[key],
      content, filePath;

  if (to.charAt(to.length - 1) === path.sep) {
    // Treat like a container.
    filePath = path.join(to, this._mapKey(key));
  } else {
    // Treat like a rename.
    filePath = to;
  }

  if (template === "directory") {
    fs.mkdirRecursiveSync(filePath);
    callback();
  } else {
    fs.mkdirRecursiveSync(path.dirname(filePath));
    content = template.render(this.context);
    fs.writeFile(filePath, content, "utf8", callback);
  }
};

Generator.prototype.generateAll = function(to, callback) {
  var self = this,
      tasks = Object.keys(this.templates).map(function(key) {
        var template = self.templates[key];
        return function(callback) {
          var filePath = path.join(to, self._mapKey(key)),
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
