(function() {
  var extensionRoot = new Extension("test_bump_script", "1.0.0");

  var test_command = new Command(
    "test_command",
    [],
    "insert",
    "Test command",
    [],
    extensionRoot
  );

  test_command.execute = function(payload) {
    return new ReturnObject("success", "Test successful", "Test content");
  };
})();
