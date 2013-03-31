# fgen

fgen is a file generator library to be used to generate project structures, file templates and/or snippets. Templates are based on the [mustache](http://mustache.github.com) template language.

In order to generate files, you need to provide a folder of templates and a context object to fgen, and fgen will generate the appropriate folder structures and files. fgen can be used as the core engine of any generator software.

## Example

Given you have a folder named `nodejs_templates`, with the following template files structure:

    .gitignore
    LICENSE
    README.md
    package.json
    lib/__name__.js
    test/

You can write a generator to generate all files or a single file as demonstrated below. You can also check `test/nodejs_project_templates/*` to have a feel of the template's content.

```js
var fgen = require("fgen");

// You provide a folder with mustache syntax template files.
fgen.createGenerator("nodejs_templates", function(err, generator) {
  if (err) {
    console.log(err);
    return;
  }

  // Underscore files like __name__.js will be substituted for the
  // corresponding values in the context object.
  generator.context = {
    name: "myProj",
    version: "0.0.0",
    desc: "My project desc.",
    keywords: [
      {keyword: "my"},
      {keyword: "project", last: true}
    ]
  };

  // Generate all files and folder structures.
  generator.generateAll("~/Desktop/myProj", function(err) {
    if (!err) console.log("Successful generation.");
  });

  // Single file generation.
  // generator.generate("LICENSE", "~/Desktop/myProj/LIC", function(err) {
  //   if (!err) { console.log("Successful generation."); }
  // });

  // Single file generation using writable streams.
  // generator.generate("package.json", process.stdout, function(err) {
  //   if (!err) { console.log("Successful generation."); }
  // });
});
```

## Installation

```bash
$ npm install fgen
```

## Documentation

### fgen.createGenerator(templatesFolder, [readyListener])

Returns a [`fgen.Generator`](#class-fgengenerator) object, this represents the `templatesFolder` and its generation logics. The `readyListener` is a function which is automatically added to the [`'ready'`](#eventready) event.

## Class: fgen.Generator

This is an EventEmitter with the following events:

### Event:'ready'

Emitted when the generator has loaded the templates and it's ready to render. You should always call other generation methods after/in this event.

### generator.dirpath

The `templatesFolder` you passed in when you created the generator.

### generator.context

The context object to pass to templates. It contains all the generation logics. Please refer to [mustache's documentation](http://mustache.github.com/mustache.5.html) about this context. We use [Hogan.js](http://twitter.github.com/hogan.js) as the mustache engine, so you can also refer to Hogan.js' documentation.

### generator.generate(key, to, [callback])

Generates a single file. `key` corresponds to templates' path, e.g. *lib/__name__.js*, `to` is where you want to generate the file to. Currently, string and writable stream types of `to` are supported. Once file generation is complete, `callback` is called with the first argument being `err` if any.

File names with double underscores like `__name__.js` will be substituted for the corresponding values in the context object.

### generator.generateAll(to, [filter], [callback])

Like [`generator.generate`](#generatorgeneratekey-to-callback) but generates all the files and folder structures except those you filter out using the `filter` argument, which is a predicate function accepting a file path and returning a boolean indicating which files should be included and which are not. Unlike [`generator.generate`](#generatorgeneratekey-to-callback), `to` can only be a string representing a folder to where file generation ocurrs.

## License

(The MIT License)

Copyright (c) 2013 Seth Yuan

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
