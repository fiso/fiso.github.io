const HappyNellyUtils = {
  mobileBreak: 767,
  isMobile: function () {
    return window.innerWidth <= HappyNellyUtils.mobileBreak;
  },

  querySelectorCache: {},
  querySelectorAllCache: {},

  querySelectorCached: function (query) {
    if (!HappyNellyUtils.querySelectorCache[query]) {
      HappyNellyUtils.querySelectorCache[query] = document.querySelector(query);
    }

    return HappyNellyUtils.querySelectorCache[query];
  },

  querySelectorAllCached: function (query) {
    if (!HappyNellyUtils.querySelectorAllCache[query]) {
      HappyNellyUtils.querySelectorAllCache[query] =
        Array.prototype.slice.call(document.querySelectorAll(query));
    }

    return HappyNellyUtils.querySelectorAllCache[query];
  },

  isIE: function () {
    const navigator = window.navigator;
    return navigator.appName === "Microsoft Internet Explorer" ||
      navigator.appName === "Netscape" &&
      new RegExp("Trident/.*rv:([0-9]{1,}[\.0-9]{0,})").exec(
        navigator.userAgent) !== null;
  },

  isFirefox: function () {
    return window.navigator.userAgent.toLowerCase().indexOf("firefox") !== -1;
  },

  isSafari: function () {
    return /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
  },

  isChrome: function () {
    return /Chrome/.test(navigator.userAgent) &&
      /Google Inc/.test(navigator.vendor);
  },

  getScrollElement: function () {
    return document.documentElement && document.documentElement.scrollTop ?
      document.documentElement : document.body;
  },

  getNellyHeaderHeight: function () {
    let nellyHeader = HappyNellyUtils.querySelectorCached(".navbar-menu");

    if (!nellyHeader) {
      nellyHeader = HappyNellyUtils.querySelectorCached(".navbar-fixed-top");
    }

    if (nellyHeader) {
      return nellyHeader.getBoundingClientRect().bottom;
    }

    return 0;
  },

  countTo: function (n, reverse) {
    let ret = [];
    for (let i = 0; i < n; i++) {
      ret.push(i);
    }
    if (reverse) {
      return ret.reverse();
    }

    return ret;
  },

  getClosest: function (value, a, b) {
    if (Math.abs(value - a) < Math.abs(value - b)) {
      return a;
    }

    return b;
  },

  clamp: function (value, min, max) {
    return Math.max(Math.min(
      value, max), min);
  },

  easeInOut: function (currentTime, start, change, duration) {
    currentTime /= duration / 2;
    if (currentTime < 1) {
        return change / 2 * currentTime * currentTime + start;
    }

    currentTime -= 1;
    return -change / 2 * (currentTime * (currentTime - 2) - 1) + start;
  },

  scrollTo: function (to, duration) {
    const element = HappyNellyUtils.getScrollElement();
    const start = element.scrollTop;
    const change = to - start;
    const increment = 20;

    const animateScroll = function (elapsedTime) {
      elapsedTime += increment;
      const position = HappyNellyUtils.easeInOut(elapsedTime, start, change,
        duration);
      element.scrollTop = position;
      if (elapsedTime < duration) {
        setTimeout(function () {
            animateScroll(elapsedTime);
        }, increment);
      }
    };

    animateScroll(0);
  },

  setVendorStyle: function (element, property, value) {
    element.style["webkit" + property] = value;
    element.style["moz" + property] = value;
    element.style["ms" + property] = value;
    element.style["o" + property] = value;
  },

  handleFilterClick: function (e) {
    const rootClass = HappyNellyUtils.rootClassName;
    const buttons = document.querySelectorAll(
      `.${rootClass} .filter-button`);
    for (let i = 0; i < buttons.length; i++) {
      const btn = buttons[i];
      btn.classList.remove("active");
    }

    const element = e.target;
    element.classList.add("active");

    const genderId = element.getAttribute("data-gender");
    const campaignId = element.getAttribute("data-campaign");
    const campaignInput = document.getElementById("paramCampaign");
    const searchCodesInput = document.getElementById("search_codes");
    if (campaignInput) {
      campaignInput.value = campaignId;
    }
    if (searchCodesInput) {
      searchCodesInput.value = genderId;
    }

    if (typeof filterSearch !== "undefined") {
      filterSearch(true);
    }

    const navHeight = HappyNellyUtils.getNellyHeaderHeight();
    const campaignElement = document.querySelector(`.${rootClass}`);
    const campaignHeight = campaignElement ? campaignElement.offsetHeight : 0;
    const campaignTop = campaignElement ? campaignElement.offsetTop : 0;
    HappyNellyUtils.scrollTo(campaignTop + campaignHeight -
      navHeight, 300);
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

  init: function (rootClassName, mobileBreak) {
    HappyNellyUtils.mobileBreak = mobileBreak || 767;
    HappyNellyUtils.rootClassName = rootClassName;

    const campaignRoot = HappyNellyUtils.querySelectorCached(
      `.${rootClassName}`);

    if (HappyNellyUtils.isChrome()) {
      campaignRoot.classList.add("browser-chrome");
      campaignRoot.classList.add("browser-webkit");
    }

    if (HappyNellyUtils.isSafari()) {
      campaignRoot.classList.add("browser-safari");
      campaignRoot.classList.add("browser-webkit");
    }

    if (HappyNellyUtils.isFirefox()) {
      campaignRoot.classList.add("browser-firefox");
    }

    if (HappyNellyUtils.isIE()) {
      campaignRoot.classList.add("browser-ie");
    }

    const buttons = document.querySelectorAll(
      `.${rootClassName} .filter-button`);
    for (let i = 0; i < buttons.length; i++) {
      const btn = buttons[i];
      btn.addEventListener("click",
        HappyNellyUtils.handleFilterClick.bind(HappyNellyUtils));
    }
  },
};
