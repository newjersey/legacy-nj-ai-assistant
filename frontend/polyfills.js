const replaceAllInserter = require("string.prototype.replaceall");

replaceAllInserter.shim();

if (typeof window.URL.createObjectURL === "undefined") {
  window.URL.createObjectURL = () => {};
}
