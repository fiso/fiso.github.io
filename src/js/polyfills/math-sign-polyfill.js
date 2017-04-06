if (!Math.sign) {
  Math.sign = function sign (n) {
    return n > 0 ? 1 : n < 0 ? -1 : 0;
  };
}
