var fgen = require("../"),
    should = require("should"),
    fs = require("fs.extra");

describe("fgen", function() {
  it("create generator should be ok", function() {
    fgen.createGenerator("test/nodejs_project_templates/").should.be.ok;
  });

  it("ready event is fired (within 1s)", function(done) {
    this.timeout(500);
    fgen.createGenerator("test/nodejs_project_templates/", done);
  });

  it("ready event fired with templates compiled", function(done) {
    this.timeout(500);
    fgen.createGenerator("test/nodejs_project_templates/", function(err, gen) {
      should.not.exist(err);
      gen.should.have.property("templates").with.keys(
        "LICENSE",
        "README.md",
        "package.json",
        ".gitignore",
        ".npmignore",
        "lib/__name__.js",
        "test/test.js");
      done();
    });
  });

  describe("generator", function() {
    var gen;

    before(function(done) {
      gen = fgen.createGenerator("test/nodejs_project_templates/", function(err) {
        should.not.exist(err);
        gen.context = {
          name: "testlib",
          version: "0.0.0",
          desc: "A test library.",
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
  });
});
