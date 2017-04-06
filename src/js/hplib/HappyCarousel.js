const HappyCarousel = {
  touches: {
      touchstart: {x: -1, y: -1},
      touchmove: {x: -1, y: -1},
      touchend: false,
      direction: "undetermined",
  },

  handleTouches: function (carouselIndex, event) {
    if (typeof event === "undefined") {
      return;
    }
    if (typeof event.touches === "undefined") {
      return;
    }

    let touch = event.touches[0];

    switch (event.type) {
      case "touchstart":
      case "touchmove":
        this.touches[event.type].x = touch.pageX;
        this.touches[event.type].y = touch.pageY;
        break;
      case "touchend":
        this.touches[event.type] = true;
        let x = this.touches.touchstart.x - this.touches.touchmove.x;
        let y = this.touches.touchstart.y - this.touches.touchmove.y;
        if (x < 0) {
          x /= -1;
        }
        if (y < 0) {
          y /= -1;
        }
        if (x > y) {
          this.touches.direction = this.touches.touchstart.x <
            this.touches.touchmove.x ? "right" : "left";
        } else {
          this.touches.direction = this.touches.touchstart.y <
          this.touches.touchmove.y ? "down" : "up";
        }

        switch (this.touches.direction) {
          case "left":
          case "right":
            this.moveCarousel(this.touches.direction === "left" ? 1 : -1,
            carouselIndex);
            break;
          default:
        }

        break;
      default:
    }
  },

  blockCarouselNavigation: false,
  onCarouselArrowClick: function (arrowDirection, carouselIndex, e) {
    // Animate arrow
    let arrowContainer = e.target.closest(".arrow-container");
    if (!arrowContainer) {
      if (e.target.classList.contains("left-fader")) {
        arrowContainer = e.target.closest(".happy-carousel").querySelector(
          ".arrow-container.left");
      } else if (e.target.classList.contains("right-fader")) {
        arrowContainer = e.target.closest(".happy-carousel").querySelector(
          ".arrow-container.right");
      }
    }
    if (arrowContainer) {
      arrowContainer.style.willChange = "transform";
      HappyNellyUtils.setVendorStyle(
        arrowContainer,
        "Transform",
        `translateX(${arrowDirection * 0.5}em)`);

      setTimeout(() => {
        HappyNellyUtils.setVendorStyle(
          arrowContainer,
          "Transform",
          "");
        arrowContainer.style.willChange = "";
      }, 100);
    }

    this.moveCarousel(arrowDirection, carouselIndex);
  },

  moveCarousel: function (arrowDirection, carouselIndex) {
    if (this.blockCarouselNavigation) {
      return;
    }

    this.blockCarouselNavigation = true;

    const carousels = HappyNellyUtils.querySelectorAllCached(
      `.${this.rootClassName} .happy-carousel`);
    const carousel = carousels[carouselIndex];
    const slider = carousel.querySelector(".carousel-slider");
    const products = slider.children;
    const productWidth = products[0].offsetWidth;
    let currentOffset = 0;
    if (slider.style.transform) {
      currentOffset = -Number(slider.style.transform.replace(/\D/g, ""));
    }
    const maxOffset = 0;
    let productsWidth = products.length * productWidth;
    const minOffset = slider.offsetWidth - productsWidth;
    let newOffset = Math.round(currentOffset - productWidth * arrowDirection);
    const center = Math.round(productsWidth / 2);
    slider.style.willChange = "transform";
    let performAdjustment = false;
    let adjustTo = 0;
    if (newOffset < minOffset) {
      newOffset += center;
      performAdjustment = true;
      if (HappyNellyUtils.isMobile()) {
        adjustTo =
          slider.offsetWidth / 2 - productWidth / 2 - productsWidth / 2 +
              2 * productWidth;
      } else {
        adjustTo = slider.offsetWidth - center;
      }
    } else if (newOffset > maxOffset) {
      newOffset -= center;
      performAdjustment = true;
      if (HappyNellyUtils.isMobile()) {
        adjustTo =
          slider.offsetWidth / 2 - productWidth / 2 - productsWidth / 2 -
              productWidth;
      } else {
        adjustTo = -center;
      }
    }

    const transition = "transform 300ms ease-in-out";

    if (performAdjustment) {
      slider.style.transition = "";
      HappyNellyUtils.setVendorStyle(slider, "Transform",
        `translateX(${Math.round(adjustTo)}px)`);
      slider.offsetWidth; // Force reflow
    }

    const self = this; // Wow, this old pattern
    slider.addEventListener("transitionend", function onEnd (e) {
      slider.removeEventListener("transitionend", onEnd);
      self.blockCarouselNavigation = false;
    });

    slider.style.transition = transition;
    HappyNellyUtils.setVendorStyle(slider, "Transform",
      `translateX(${newOffset}px)`);
    setTimeout(() => {
      slider.style.willChange = "";
    }, 500);
  },

  init: function (rootClassName, mobileBreak) {
    this.mobileBreak = mobileBreak || 767;
    this.rootClassName = rootClassName;
    const arrows = HappyNellyUtils.querySelectorAllCached(
      `.${this.rootClassName} .happy-carousel .arrow-container`);

    for (let i = 0; i < arrows.length; i++) {
      const arrow = arrows[i];
      arrow.addEventListener("click",
        this.onCarouselArrowClick.bind(this, Math.sign(i % 2 - 0.5),
        Math.floor(i / 2)));
    }

    const faders = HappyNellyUtils.querySelectorAllCached(
      `.${this.rootClassName} .happy-carousel .fader`);

    for (let i = 0; i < faders.length; i++) {
      const fader = faders[i];
      fader.addEventListener("click",
        this.onCarouselArrowClick.bind(this, Math.sign(i % 2 - 0.5),
        Math.floor(i / 2)));
    }

    const sliders = HappyNellyUtils.querySelectorAllCached(
      `.${this.rootClassName} .carousel-slider`);
    for (let i = 0; i < sliders.length; i++) {
      const slider = sliders[i];
      const copy = slider.cloneNode(true);
      while (copy.children.length) {
        const productCopy = copy.children[0];
        slider.insertBefore(productCopy, null);
      }

      const images = Array.prototype.slice.call(
        slider.querySelectorAll("img"));

      const interval = setInterval(() => {
        const imagesPending = Boolean(images.find((i) => !i.complete));

        if (!imagesPending) {
          clearInterval(interval);

          if (HappyNellyUtils.isMobile()) {
            const products = slider.children;
            const productWidth = products[0].offsetWidth;
            const productsWidth = products.length * productWidth;
            const center = productsWidth / 2;
            const initialOffset = Math.round(
              slider.offsetWidth / 2 - productWidth / 2 - productsWidth / 2
              );
            HappyNellyUtils.setVendorStyle(slider, "Transform",
              `translateX(${initialOffset}px)`);
          }

          const carousels = HappyNellyUtils.querySelectorAllCached(
            `.${this.rootClassName} .happy-carousel`);

          for (let i = 0; i < carousels.length; i++) {
            const carousel = carousels[i];
            carousel.addEventListener("touchstart",
              this.handleTouches.bind(this, i));
            carousel.addEventListener("touchmove",
              this.handleTouches.bind(this, i));
            carousel.addEventListener("touchend",
              this.handleTouches.bind(this, i));
          }

          slider.style.opacity = 1;
        }
      }, 100);
    }
  },
};
