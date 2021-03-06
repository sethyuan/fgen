"use strict";

var fgen = require("../");
var should = require("should");
var fs = require("fs.extra");
var path = require("path");

describe("fgen", function() {
  it("create generator should be ok", function() {
    fgen.createGenerator("test/nodejs_project_templates/").should.be.ok;
  });

  it("ready event is fired (within 1s)", function(done) {
    this.timeout(500);
    fgen.createGenerator("test/nodejs_project_templates/", function(gen) {
      done();
    });
  });

  it("ready event fired with templates compiled", function(done) {
    this.timeout(500);
    fgen.createGenerator("test/nodejs_project_templates/", function(gen) {
      console.log(Object.keys(gen.templates_));
      gen.should.have.property("templates_").with.keys(
        "LICENSE",
        "README.md",
        "package.json",
        ".gitignore",
        ".npmignore",
        "__v1__/",
        "__v1__/__init__.py",
        "__v1__/test/",
        "__v1__/test/__v2__.js",
        path.normalize("lib/__name__.js"),
        path.normalize("doc/"),
        path.normalize("doc/.gitignore"),
        path.normalize("lib/"),
        path.normalize("test/"),
        path.normalize("test/test.js"));
      done();
    });
  });

  describe("generator", function() {
    var gen;

    before(function(done) {
      gen = fgen.createGenerator("test/nodejs_project_templates/", function() {
        gen.context = {
          name: "testlib",
          version: "0.0.0",
          desc: "A test library.",
          v1: "v1",
          v2: "v2",
          keywords: [
            {keyword: "test"},
            {keyword: "lib", last_keyword: true},
          ]
        };
        done();
      });
    });

    afterEach(function(done) {
      fs.rmrf("test/nodejs_project_templates/tmp", function(err) {
        err && console.log(err);
        done();
      });
    });

    it("all files generation to folder should be ok", function(done) {
      gen.generateAll("test/nodejs_project_templates/tmp", function(err) {
        should.not.exist(err);
        fs.existsSync("test/nodejs_project_templates/tmp/LICENSE").should.be.true;
        fs.existsSync("test/nodejs_project_templates/tmp/README.md").should.be.true;
        fs.existsSync("test/nodejs_project_templates/tmp/package.json").should.be.true;
        fs.existsSync("test/nodejs_project_templates/tmp/lib").should.be.true;
        fs.existsSync("test/nodejs_project_templates/tmp/test").should.be.true;
        fs.existsSync("test/nodejs_project_templates/tmp/.gitignore").should.be.true;
        fs.existsSync("test/nodejs_project_templates/tmp/.npmignore").should.be.true;
        fs.existsSync("test/nodejs_project_templates/tmp/lib/testlib.js").should.be.true;
        fs.existsSync("test/nodejs_project_templates/tmp/test/test.js").should.be.true;
        fs.existsSync("test/nodejs_project_templates/tmp/doc").should.be.true;
        done();
      });
    });

    it("all files generation to folder with '/' should be ok", function(done) {
      gen.generateAll("test/nodejs_project_templates/tmp/", function(err) {
        should.not.exist(err);
        fs.existsSync("test/nodejs_project_templates/tmp/LICENSE").should.be.true;
        fs.existsSync("test/nodejs_project_templates/tmp/README.md").should.be.true;
        fs.existsSync("test/nodejs_project_templates/tmp/package.json").should.be.true;
        fs.existsSync("test/nodejs_project_templates/tmp/lib").should.be.true;
        fs.existsSync("test/nodejs_project_templates/tmp/test").should.be.true;
        fs.existsSync("test/nodejs_project_templates/tmp/.gitignore").should.be.true;
        fs.existsSync("test/nodejs_project_templates/tmp/.npmignore").should.be.true;
        fs.existsSync("test/nodejs_project_templates/tmp/lib/testlib.js").should.be.true;
        fs.existsSync("test/nodejs_project_templates/tmp/test/test.js").should.be.true;
        fs.existsSync("test/nodejs_project_templates/tmp/doc").should.be.true;
        done();
      });
    });

    it("single file to folder should be generated", function(done) {
      gen.generate("LICENSE", "test/nodejs_project_templates/tmp/", function(err) {
        should.not.exist(err);
        fs.existsSync("test/nodejs_project_templates/tmp/LICENSE").should.be.true;
        done();
      });
    });

    it("single file to file", function(done) {
      gen.generate("LICENSE", "test/nodejs_project_templates/tmp/LIC", function() {
        fs.existsSync("test/nodejs_project_templates/tmp/LIC").should.be.true;
        done();
      });
    });

    it("single file to file - 2", function(done) {
      gen.generate("package.json", "test/nodejs_project_templates/tmp/", function() {
        fs.existsSync("test/nodejs_project_templates/tmp/package.json").should.be.true;
        done();
      });
    });

    it("single file with folder prefix", function(done) {
      gen.generate("test/test.js", "test/nodejs_project_templates/tmp/", function() {
        fs.existsSync("test/nodejs_project_templates/tmp/test/test.js").should.be.true;
        done();
      });
    });

    it("file names with __key__ form should be mapped", function(done) {
      gen.generate("lib/__name__.js", "test/nodejs_project_templates/tmp/", function() {
        fs.existsSync("test/nodejs_project_templates/tmp/lib/testlib.js").should.be.true;
        done();
      });
    });

    it("single folder to folder", function(done) {
      gen.generate("doc/", "test/nodejs_project_templates/tmp/", function(err) {
        fs.existsSync("test/nodejs_project_templates/tmp/doc").should.be.true;
        done(err);
      });
    });

    it("single folder to a renamed folder", function(done) {
      gen.generate("doc/", "test/nodejs_project_templates/tmp/d", function() {
        fs.existsSync("test/nodejs_project_templates/tmp/d").should.be.true;
        done();
      });
    });

    it("single file to stdout", function(done) {
      gen.generate("package.json", process.stdout, function(err) {
        should.not.exist(err);
        done();
      });
    });

    it("single folder to stdout", function(done) {
      gen.generate("doc/", process.stdout, function(err) {
        should.not.exist(err);
        done();
      });
    });

    it("generate with empty callback", function(done) {
      this.timeout(200);
      gen.generate("LICENSE", process.stdout);
      setTimeout(done, 190);
    });

    it("generate with empty callback - 2", function(done) {
      this.timeout(200);
      gen.generate("LICENSE", "test/nodejs_project_templates/tmp/");
      setTimeout(done, 190);
    });

    it("generateAll with empty callback", function(done) {
      this.timeout(200);
      gen.generateAll("test/nodejs_project_templates/tmp/");
      setTimeout(done, 190);
    });

    it("optional filter function when generateAll", function(done) {
      var filter = function(key) {
        return !/^test(\/|\\)/.test(key);
      };
      gen.generateAll("test/nodejs_project_templates/tmp", filter, function(err) {
        fs.existsSync("test/nodejs_project_templates/tmp/test").should.be.false;
        done(err);
      });
    });

    it("non-existent key generation", function(done) {
      gen.generate("xxx", process.stdout, function(err) {
        should.exist(err);
        done();
      });
    });
  });
});
