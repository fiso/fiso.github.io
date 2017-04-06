const http = require("http");
const readline = require("readline");

function postNotification (type, message, description) {
  const body = JSON.stringify({
    type, message, description,
  });

  const request = http.request({
    url: "http://localhost/",
    port: 8090,
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Content-Length": Buffer.byteLength(body),
    },
  });
  request.end(body);
}

function isSassError (line) {
  const lowLine = line.toLocaleLowerCase();
  if (
    lowLine.indexOf("invalid css") !== -1 &&
    lowLine.indexOf("\"formatted\"") !== -1 &&
    lowLine.indexOf("\"formatted\"") < lowLine.indexOf("invalid css")
    ||
    lowLine.indexOf("error") !== -1 &&
    lowLine.indexOf("\"formatted\"") !== -1 &&
    lowLine.indexOf("\"formatted\"") < lowLine.indexOf("error")
  ) {
    return true;
  }

  return false;
}

function parseSassError (line) {
  const lowLine = line.toLocaleLowerCase();
  const lineNum = line.substring(lowLine.indexOf("on line ") +
    "on line ".length, lowLine.indexOf(" ", lowLine.indexOf("on line ") +
      "on line ".length)).trim();
  const sourceFile = line.substring(lowLine.indexOf(" of ",
    lowLine.indexOf("on line ")) + " of ".length, lowLine.indexOf("\\n",
    lowLine.indexOf("on line "))).trim();
  return `Invalid sass syntax on line ${lineNum} of ${sourceFile}`;
}

function isJSError (line) {
  const lowLine = line.toLocaleLowerCase();
  if (
    lowLine.indexOf("syntaxerror") !== -1
  ) {
    return true;
  }

  return false;
}

function parseJSError (line) {
  return line;
}

postNotification("info", "Build pipeline", "Dev runner started");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: false,
});

rl.on("line", function (line) {
  console.error(line);
  if (isSassError(line)) {
    postNotification("error", "Error compiling sass", parseSassError(line));
  } else if (isJSError(line)) {
    postNotification("error", "Error compiling JavaScript",
      parseJSError(line));
  } else if (line.toLocaleLowerCase().indexOf("error") !== -1) {
    postNotification("error", "Unknown build error", line);
  }
});
