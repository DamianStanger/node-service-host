const chai = require("chai");
chai.should();

suite("Array", function () {
  suite("#indexOf()", function () {
    test("should return -1 when the value is not present", function () {
      [1, 2, 3].indexOf(4).should.equal(-1);
    });

    test("should return the correct value for the index", function () {
      [1, 2, 3].indexOf(2).should.equal(1);
    });
  });

  suite("length", function () {
    test("should return the length of the array", function () {
      [1, 2, 3].length.should.equal(3);
    });
  });
});
