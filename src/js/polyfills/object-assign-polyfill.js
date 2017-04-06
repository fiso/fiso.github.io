if (typeof Object.assign !== "function") {
  Object.assign = function (target, varArgs) { // .length of function is 2
    "use strict";
    if (target == null) { // eslint-disable-line
      throw new TypeError("Cannot convert undefined or null to object");
    }

    let to = Object(target);

    for (let index = 1; index < arguments.length; index++) {
      let nextSource = arguments[index];

      if (nextSource != null) { // eslint-disable-line
        for (let nextKey in nextSource) {
          // Avoid bugs when hasOwnProperty is shadowed
          if (Object.prototype.hasOwnProperty.call(nextSource, nextKey)) {
            to[nextKey] = nextSource[nextKey];
          }
        }
      }
    }
    return to;
  };
}
