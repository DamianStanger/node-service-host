const chai = require("chai");
chai.should();

const getSnsDestination = require("../../../src/destination/sns");


describe("destination/sns", () => {
  it("should return a resolved promise when execute is called", () => {
    const sns = getSnsDestination();

    return sns.execute().then(() => {
      // assertions go here
    });
  });
});
