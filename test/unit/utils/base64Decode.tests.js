const AssertionError = require("assert");
const chai = require("chai");
chai.should();

const base64Decode = require("../../../src/utils/base64Decode");


describe("base64Decode", () => {
  it("should throw on undefined", () => {
    function base64DecodeFunctionPassedUndefined() {
      return base64Decode(undefined);
    }
    base64DecodeFunctionPassedUndefined.should.throw(AssertionError("Value to be decoded must be a string, empty or otherwise"));
  });

  it("should throw when passed a non string argument", () => {
    function base64DecodeFunctionPassedObject() {
      return base64Decode({"foo": "bar"});
    }
    base64DecodeFunctionPassedObject.should.throw(AssertionError("Value to be decoded must be a string not a \"object\""));
  });

  it("should return original string when string does not parse JSON", () => {
    const actual = base64Decode("fasdfsdai78iujkdf=");
    actual.should.equal("fasdfsdai78iujkdf=");
  });

  it("should decode strings into objects", () => {
    const actual = base64Decode("eyJkYXRhIjoiZml6ekJ1enoifQ==");
    actual.should.deep.equal({"data": "fizzBuzz"});
  });
});
