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

  scrollTop: -1,
  scrollHandler: function (e) {
    this.scrollTop = this.getScrollElement().scrollTop;
    this.updateAppear();
    this.updateParallax();
    this.updateTimeline();
    lazyImages.updateImages();
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

  updateTimeline: function () {
    const timelineScroller = this.querySelectorCached(".timeline ul");
    const timeline = this.querySelectorCached(".timeline");
    const maxOffset = timelineScroller.offsetHeight -
      timeline.offsetHeight;
    const startScrollTop = timeline.offsetParent.offsetTop -
      window.innerHeight * 0.3;
    const endScrollTop = timeline.offsetParent.offsetTop +
      timeline.offsetHeight - window.innerHeight;
    const fraction = Math.max(Math.min((this.scrollTop - startScrollTop) /
      (endScrollTop - startScrollTop), 1), 0);
    const offset = maxOffset * fraction;
    timelineScroller.style.willChange = "transform";
    timelineScroller.style.transform = `translateY(${-offset}px)`;

    if (this.timelineTimeout) {
      clearTimeout(this.timelineTimeout);
    }
    this.timelineTimeout = setTimeout(() => {
      this.timelineTimeout = null;
      timelineScroller.style.willChange = "";
    }, 200);
  },

  setVendorStyle: function (element, property, value) {
    element.style["webkit" + property] = value;
    element.style["moz" + property] = value;
    element.style["ms" + property] = value;
    element.style["o" + property] = value;
  },

  updateParallax: function () {
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
        el.classList.remove("appearing");
        el.classList.add("appeared");
      });
      el.classList.add("appearing");
      if (el.classList.contains("appear-notify")) {
        el.dispatchEvent(new Event("appeared"));
      }
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

  showModal: function (title, image, body) {
    const modal = this.querySelectorCached(".modal");
    const h2 = this.querySelectorCached(".modal h2");
    const img = this.querySelectorCached(".modal img");
    const p = this.querySelectorCached(".modal p");
    h2.innerHTML = title || "";
    if (image) {
      img.src = image;
      img.style.display = "block";
    } else {
      img.style.display = "none";
    }
    p.innerHTML = body || "";
    modal.classList.add("visible");

    const clickHandler = (event) => {
      if (!modal.contains(event.target)) {
        this.hideModal();
        document.removeEventListener("click", clickHandler);
      }
    };

    document.addEventListener("click", clickHandler);
  },

  hideModal: function () {
    const modal = this.querySelectorCached(".modal");
    modal.classList.remove("visible");
  },

  showInfobox: function (name) {
    /* eslint-disable */
    const info = {
      birth: {title: "I was born in 1980", image: "", body: "This was a big deal for me."},
      cbm: {title: "In 1987, I got a C64 for Christmas", image: "", body: "I didn't know it at the time, but it would be a formative moment for me."},
      amiga: {title: "", image: "", body: ""},
      c: {title: "", image: "", body: ""},
      threed: {title: "", image: "", body: ""},
      amuze: {title: "", image: "", body: ""},
      uds: {title: "", image: "", body: ""},
      esn: {title: "", image: "", body: ""},
      ea: {title: "", image: "", body: ""},
      ludvig: {title: "", image: "", body: ""},
      happypie: {title: "", image: "", body: ""},
    };
    /* eslint-enable */

    if (!info[name]) {
      return;
    }

    this.showModal(info[name].title, info[name].image, info[name].body);
  },

  setupListeners: function () {
    window.addEventListener("scroll", this.scrollThrottler.bind(this));
    window.addEventListener("resize", this.resizeThrottler.bind(this));

    this.querySelectorAllCached(".timeline a").forEach((element) => {
      element.addEventListener("click", (event) => {
        event.stopPropagation();
        this.showInfobox(element.dataset.infobox);
      });
    });
  },

  init: function () {
    this.setupListeners();
    this.querySelectorAllCached(".progressbar").forEach((el) => {
      const value = Number(el.dataset.progress);
      const blocker = document.createElement("span");
      el.appendChild(blocker);
      el.addEventListener("appeared", (e) => {
        blocker.style.width = `${100 - value}%`;
      });
    });

    setTimeout(this.scrollHandler.bind(this), 100);
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
