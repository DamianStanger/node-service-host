/* eslint-disable no-sync */
/* eslint-disable no-console */

const fs = require("fs");
const path = require("path");


function isDirectory(fileName) {
  const stats = fs.lstatSync(fileName);
  return stats.isDirectory();
}

function requireAndSwallowErrors(fileName) {
  try {
    // console.log(`require(${fileName})`);
    require(fileName);
  } catch (err) {
    console.log("[WARN]", `caught error running require(${fileName})`);
  }
}

function requireAllTheThings(dirName, exclude) {
  fs.readdir(dirName, (err, files) => {
    if (err) {
      throw new Error(err);
    }

    files.map(fileName => path.join(dirName, fileName))
      .filter(isDirectory)
      .forEach(requireAllTheThings);

    files.filter(fileName => fileName.endsWith(".js"))
      .map(fileName => path.join("../", dirName, fileName))
      .filter(fileName => fileName !== exclude)
      .forEach(requireAndSwallowErrors);
  });
}


describe("Load all source files for code coverage reports", () => {
  it("require", done => {
    const exclude = "../src/source/test/source.js";
    requireAllTheThings("./src", exclude);
    done();
  });
});
