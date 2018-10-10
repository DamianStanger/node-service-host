function getTestDestination(config) {
  const testDestination = {
    "execute"(message, subject) {
      console.log(message, subject, config);
      return Promise.resolve({message, subject, config});
    }
  };
  return testDestination;
}


module.exports = getTestDestination;
