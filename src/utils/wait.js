function wait(milliSeconds) {
  return new Promise(resolve => setTimeout(resolve, milliSeconds));
}


module.exports = wait;
