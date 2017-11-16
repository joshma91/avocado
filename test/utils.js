// Get hex representation of ASCII string
const fromAscii = function(str) {
  var hex = "";
  for (var i = 0; i < str.length; i++) {
    var code = str.charCodeAt(i);
    var n = code.toString(16);
    hex += n.length < 2 ? "0" + n : n;
  }

  return "0x" + hex;
};

const prettyLog = data => console.log(JSON.stringify(data, null, 4));

module.exports = {
  fromAscii,
  prettyLog,
};
