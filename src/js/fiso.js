const fiso = {
  scrollSpeed: 300,

  scrollThrottler: function (e) {
    if (this.scrollTimeout) {
      return;
    }

    this.scrollTimeout = setTimeout(() => {
      this.scrollTimeout = null;
      this.scrollHandler(e);
    }, 25);
  },

  scrollHandler: function (e) {
    this.updateAppear();
  },

  resizeThrottler: function (e) {
    if (this.resizeTimeout) {
      return;
    }

    this.resizeTimeout = setTimeout(() => {
      this.resizeTimeout = null;
      this.resizeHandler(e);
    }, 33);
  },

  resizeHandler: function (e) {
    this.scrollHandler();
  },

  querySelectorCache: {},
  querySelectorAllCache: {},

  querySelectorCached: function (query) {
    if (!this.querySelectorCache[query]) {
      this.querySelectorCache[query] = document.querySelector(query);
    }

    return this.querySelectorCache[query];
  },

  querySelectorAllCached: function (query) {
    if (!this.querySelectorAllCache[query]) {
      this.querySelectorAllCache[query] =
        Array.prototype.slice.call(document.querySelectorAll(query));
    }

    return this.querySelectorAllCache[query];
  },

  elementInView: function (el, bufferZone) {
    bufferZone = bufferZone || 0;
    const rect = el.getBoundingClientRect();

    return (
      rect.bottom + bufferZone >= 0 &&
      rect.top - bufferZone <=
        (window.innerHeight || document.documentElement.clientHeight)
    );
  },

  appearCache: {},
  updateAppear: function () {
    const appearElements = this.querySelectorAllCached(".appear");
    for (let i = 0; i < appearElements.length; i++) {
      if (this.appearCache[i]) {
        continue;
      }
      const el = appearElements[i];
      if (!this.elementInView(el)) {
        continue;
      }
      this.appearCache[i] = true;
      el.addEventListener("transitionend", (e) => {
        el.classList.add("appeared");
      });
      el.classList.add("appearing");
    }
  },

  easeInOut: function (currentTime, start, change, duration) {
    currentTime /= duration / 2;
    if (currentTime < 1) {
        return change / 2 * currentTime * currentTime + start;
    }

    currentTime -= 1;
    return -change / 2 * (currentTime * (currentTime - 2) - 1) + start;
  },

  getScrollElement: function () {
    return document.documentElement && document.documentElement.scrollTop ?
      document.documentElement : document.body;
  },

  scrollTo: function (to, speed) {
    const element = this.getScrollElement();
    const start = element.scrollTop;
    const change = to - start;
    const increment = 20;
    const duration = Math.abs(change / speed * 300);

    const animateScroll = function (elapsedTime, cb) {
      elapsedTime += increment;
      const position = this.easeInOut(elapsedTime, start, change,
        duration);
      element.scrollTop = position;
      if (elapsedTime < duration) {
        setTimeout(function () {
          animateScroll(elapsedTime, cb);
        }, increment);
      } else {
        cb();
      }
    }.bind(this);

    return new Promise((resolve, reject) => {
      animateScroll(0, resolve);
    });
  },

  getCurrentHeaderHeight: function () {
    const header = this.querySelectorCached("body > header");
    return header.offsetHeight;
  },

  setupListeners: function () {
    window.addEventListener("scroll", this.scrollThrottler.bind(this));
    window.addEventListener("resize", this.resizeThrottler.bind(this));
    setTimeout(this.scrollHandler.bind(this), 10);
  },

  init: function () {
    this.setupListeners();
  },
};

function documentReady (cb) {
  if (document.readyState !== "loading") {
    cb();
  } else {
    document.addEventListener("DOMContentLoaded", cb);
  }
}

documentReady(function () {
  fiso.init();
});
