var fgen = require("../"),
    fs = require("fs.extra");

describe("fgen", function() {
  it("create generator should be ok", function() {
    fgen.createGenerator("./nodejs_project_templates/").should.be.ok;
  });

  it("ready event is fired (within 1s)", function(done) {
    this.timeout(1000);
    fgen.createGenerator("./nodejs_project_templates/", done);
  });

  describe("generator", function() {
    var gen;

    before(function(done) {
      gen = fgen.createGenerator("./nodejs_project_templates/", function() {
        gen.context = {
          name: "testlib",
          version: "0.0.0",
          desc: "A test library."
        };
        done();
      });
    });

    afterEach(function() {
      fs.rmrf("./nodejs_project_templates/tmp", function(err) {
        err && console.log(err);
        done();
      });
    });

    it("all files generation to folder should be ok", function(done) {
      gen.generateAll("./nodejs_project_templates/tmp", function(err) {
        should.not.exist(err);
        fs.existsSync("./nodejs_project_templates/tmp/LICENSE").should.be.true;
        fs.existsSync("./nodejs_project_templates/tmp/README.md").should.be.true;
        fs.existsSync("./nodejs_project_templates/tmp/package.json").should.be.true;
        fs.existsSync("./nodejs_project_templates/tmp/lib").should.be.true;
        fs.existsSync("./nodejs_project_templates/tmp/test").should.be.true;
        fs.existsSync("./nodejs_project_templates/tmp/.gitignore").should.be.true;
        fs.existsSync("./nodejs_project_templates/tmp/.npmignore").should.be.true;
        fs.existsSync("./nodejs_project_templates/tmp/lib/testlib.js").should.be.true;
        done();
      });
    });

    it("all files generation to folder with '/' should be ok", function(done) {
      gen.generateAll("./nodejs_project_templates/tmp/", function() {
        should.not.exist(err);
        fs.existsSync("./nodejs_project_templates/tmp/LICENSE").should.be.true;
        fs.existsSync("./nodejs_project_templates/tmp/README.md").should.be.true;
        fs.existsSync("./nodejs_project_templates/tmp/package.json").should.be.true;
        fs.existsSync("./nodejs_project_templates/tmp/lib").should.be.true;
        fs.existsSync("./nodejs_project_templates/tmp/test").should.be.true;
        fs.existsSync("./nodejs_project_templates/tmp/.gitignore").should.be.true;
        fs.existsSync("./nodejs_project_templates/tmp/.npmignore").should.be.true;
        fs.existsSync("./nodejs_project_templates/tmp/lib/testlib.js").should.be.true;
        done();
      });
    });

    it("single file to folder should be generated", function(done) {
      gen.generate("LICENSE", "./nodejs_project_templates/tmp/", function() {
        fs.existsSync("./nodejs_project_templates/tmp/LICENSE").should.be.true;
        done();
      });
    });

    it("single file to file should be generated", function(done) {
      gen.generate("LICENSE", "./nodejs_project_templates/tmp/LIC", function() {
        fs.existsSync("./nodejs_project_templates/tmp/LIC").should.be.true;
        done();
      });
    });
  });
});
