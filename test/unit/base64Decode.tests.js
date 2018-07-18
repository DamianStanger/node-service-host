const AssertionError = require("assert");
const chai = require("chai");
chai.should();
const base64Decode = require("../../src/base64Decode");


suite("base64Decode", () => {
  test("should throw on null", () => {
    function base64DecodeFunctionPassedNull() {
      return base64Decode(null);
    }
    base64DecodeFunctionPassedNull.should.throw(AssertionError("Value to be decoded must be a string, empty or otherwise"));
  });

  test("should throw when passed a non string argument", () => {
    function base64DecodeFunctionPassedObject() {
      return base64Decode({"foo": "bar"});
    }
    base64DecodeFunctionPassedObject.should.throw(AssertionError("Value to be decoded must be a string not a \"object\""));
  });

  test("should return original string when string does not parse JSON", () => {
    const actual = base64Decode("fasdfsdai78iujkdf=");
    actual.should.equal("fasdfsdai78iujkdf=");
  });

  test("should decode strings into objects", () => {
    const actual = base64Decode("eyJkYXRhIjoiZml6ekJ1enoifQ==");
    actual.should.deep.equal({"data": "fizzBuzz"});
  });
});
