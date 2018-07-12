const chai = require("chai");
chai.should();

describe("Array", function () {
  describe("#indexOf()", function () {
    it("should return -1 when the value is not present", function () {
      [1, 2, 3].indexOf(4).should.equal(-1);
    });

    it("should return the correct value for the index", function () {
      [1, 2, 3].indexOf(2).should.equal(1);
    });
  });

  describe("length", function () {
    it("should return the length of the array", function () {
      [1, 2, 3].length.should.equal(3);
    });
  });
});
