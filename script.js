document.addEventListener("DOMContentLoaded", () => {
  const body = document.body;
  const header = document.querySelector(".site-header");
  const pageLoader = document.getElementById("pageLoader");
  const navToggle = document.querySelector(".nav-toggle");
  const navPanel = document.querySelector(".nav-panel");
  const navOverlay = document.querySelector(".nav-overlay");
  const navLinks = document.querySelectorAll('a[href^="#"]');
  const sectionLinks = document.querySelectorAll('.nav-links a[href^="#"]');
  const sections = document.querySelectorAll("main section[id]");
  const revealItems = document.querySelectorAll("[data-reveal]");
  const backToTop = document.getElementById("backToTop");
  const form = document.getElementById("contactForm");
  const formStatus = document.getElementById("formStatus");
  const formSuccessActions = document.getElementById("formSuccessActions");
  const whatsappPrefill = document.getElementById("whatsappPrefill");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const sliderTrack = document.getElementById("testimonialTrack");
  const sliderDots = document.getElementById("testimonialDots");
  const sliderPrev = document.getElementById("testimonialPrev");
  const sliderNext = document.getElementById("testimonialNext");
  const sliderSlides = sliderTrack ? Array.from(sliderTrack.children) : [];

  const lightbox = document.getElementById("galleryLightbox");
  const lightboxImage = document.getElementById("lightboxImage");
  const lightboxCaption = document.getElementById("lightboxCaption");
  const lightboxClose = document.getElementById("lightboxClose");
  const lightboxPrev = document.getElementById("lightboxPrev");
  const lightboxNext = document.getElementById("lightboxNext");
  const galleryTriggers = Array.from(document.querySelectorAll(".gallery-trigger"));

  let currentSlide = 0;
  let sliderTimer = null;
  let currentLightboxIndex = 0;

  const setLoaderState = () => {
    if (!pageLoader) {
      body.classList.remove("is-loading");
      return;
    }

    const hideLoader = () => {
      pageLoader.classList.add("is-hidden");
      body.classList.remove("is-loading");
    };

    if (reduceMotion) {
      hideLoader();
      return;
    }

    window.setTimeout(hideLoader, 650);
  };

  window.addEventListener("load", setLoaderState);
  window.setTimeout(setLoaderState, 1400);

  const openMenu = () => {
    if (!navPanel || !navToggle || !navOverlay) {
      return;
    }

    navPanel.classList.add("open");
    navToggle.classList.add("active");
    navOverlay.classList.add("open");
    navToggle.setAttribute("aria-expanded", "true");
    body.classList.add("nav-open");
  };

  const closeMenu = () => {
    if (!navPanel || !navToggle || !navOverlay) {
      return;
    }

    navPanel.classList.remove("open");
    navToggle.classList.remove("active");
    navOverlay.classList.remove("open");
    navToggle.setAttribute("aria-expanded", "false");
    body.classList.remove("nav-open");
  };

  if (navToggle) {
    navToggle.addEventListener("click", () => {
      const isOpen = navPanel && navPanel.classList.contains("open");
      if (isOpen) {
        closeMenu();
      } else {
        openMenu();
      }
    });
  }

  if (navOverlay) {
    navOverlay.addEventListener("click", closeMenu);
  }

  window.addEventListener("resize", () => {
    if (window.innerWidth > 860) {
      closeMenu();
    }
  });

  const smoothScrollTo = (targetId) => {
    const target = document.querySelector(targetId);
    if (!target) {
      return;
    }

    const headerOffset = header ? header.offsetHeight + 12 : 90;
    const targetPosition = target.getBoundingClientRect().top + window.scrollY - headerOffset;

    window.scrollTo({
      top: targetPosition,
      behavior: reduceMotion ? "auto" : "smooth"
    });
  };

  navLinks.forEach((link) => {
    link.addEventListener("click", (event) => {
      const href = link.getAttribute("href");
      if (!href || !href.startsWith("#")) {
        return;
      }

      event.preventDefault();
      smoothScrollTo(href);
      closeMenu();
    });
  });

  const updateHeaderState = () => {
    if (!header) {
      return;
    }

    header.classList.toggle("is-sticky", window.scrollY > 20);
  };

  const updateActiveLink = () => {
    const scrollPosition = window.scrollY + (header ? header.offsetHeight + 130 : 180);

    sections.forEach((section) => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.offsetHeight;
      const sectionId = section.getAttribute("id");
      const isActive = scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight;

      if (isActive) {
        sectionLinks.forEach((link) => {
          link.classList.toggle("active", link.getAttribute("href") === `#${sectionId}`);
        });
      }
    });
  };

  const updateBackToTop = () => {
    if (!backToTop) {
      return;
    }

    backToTop.classList.toggle("visible", window.scrollY > 520);
  };

  updateHeaderState();
  updateActiveLink();
  updateBackToTop();

  window.addEventListener("scroll", () => {
    updateHeaderState();
    updateActiveLink();
    updateBackToTop();
  });

  if (backToTop) {
    backToTop.addEventListener("click", () => {
      window.scrollTo({
        top: 0,
        behavior: reduceMotion ? "auto" : "smooth"
      });
    });
  }

  if ("IntersectionObserver" in window) {
    const revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) {
            return;
          }

          entry.target.classList.add("revealed");
          observer.unobserve(entry.target);
        });
      },
      {
        threshold: 0.15,
        rootMargin: "0px 0px -40px 0px"
      }
    );

    revealItems.forEach((item) => revealObserver.observe(item));
  } else {
    revealItems.forEach((item) => item.classList.add("revealed"));
  }

  const updateSlider = (index) => {
    if (!sliderTrack || sliderSlides.length === 0) {
      return;
    }

    currentSlide = (index + sliderSlides.length) % sliderSlides.length;
    sliderTrack.style.transform = `translateX(-${currentSlide * 100}%)`;

    sliderSlides.forEach((slide, slideIndex) => {
      slide.setAttribute("aria-hidden", slideIndex === currentSlide ? "false" : "true");
    });

    if (sliderDots) {
      Array.from(sliderDots.children).forEach((dot, dotIndex) => {
        dot.classList.toggle("active", dotIndex === currentSlide);
        dot.setAttribute("aria-current", dotIndex === currentSlide ? "true" : "false");
      });
    }
  };

  const stopSliderAutoplay = () => {
    if (!sliderTimer) {
      return;
    }

    window.clearInterval(sliderTimer);
    sliderTimer = null;
  };

  const startSliderAutoplay = () => {
    if (reduceMotion || sliderSlides.length < 2) {
      return;
    }

    stopSliderAutoplay();
    sliderTimer = window.setInterval(() => {
      updateSlider(currentSlide + 1);
    }, 5000);
  };

  if (sliderTrack && sliderDots && sliderSlides.length > 0) {
    sliderSlides.forEach((_, index) => {
      const dot = document.createElement("button");
      dot.type = "button";
      dot.className = "testimonial-dot";
      dot.setAttribute("aria-label", `Go to testimonial ${index + 1}`);
      dot.addEventListener("click", () => {
        updateSlider(index);
        startSliderAutoplay();
      });
      sliderDots.appendChild(dot);
    });

    updateSlider(0);

    if (sliderPrev) {
      sliderPrev.addEventListener("click", () => {
        updateSlider(currentSlide - 1);
        startSliderAutoplay();
      });
    }

    if (sliderNext) {
      sliderNext.addEventListener("click", () => {
        updateSlider(currentSlide + 1);
        startSliderAutoplay();
      });
    }

    const sliderArea = sliderTrack.closest(".testimonial-slider");
    if (sliderArea) {
      sliderArea.addEventListener("mouseenter", stopSliderAutoplay);
      sliderArea.addEventListener("mouseleave", startSliderAutoplay);
      sliderArea.addEventListener("focusin", stopSliderAutoplay);
      sliderArea.addEventListener("focusout", startSliderAutoplay);
    }

    startSliderAutoplay();
  }

  const openLightbox = (index) => {
    if (!lightbox || !lightboxImage || !lightboxCaption || galleryTriggers.length === 0) {
      return;
    }

    currentLightboxIndex = (index + galleryTriggers.length) % galleryTriggers.length;
    const trigger = galleryTriggers[currentLightboxIndex];

    lightboxImage.src = trigger.dataset.lightboxSrc || "";
    lightboxImage.alt = trigger.dataset.lightboxAlt || "";
    lightboxCaption.textContent = trigger.dataset.lightboxCaption || "";

    lightbox.classList.add("open");
    lightbox.setAttribute("aria-hidden", "false");
    body.classList.add("lightbox-open");
  };

  const closeLightbox = () => {
    if (!lightbox || !lightboxImage) {
      return;
    }

    lightbox.classList.remove("open");
    lightbox.setAttribute("aria-hidden", "true");
    body.classList.remove("lightbox-open");
    lightboxImage.src = "";
  };

  if (galleryTriggers.length > 0) {
    galleryTriggers.forEach((trigger, index) => {
      trigger.addEventListener("click", () => openLightbox(index));
    });
  }

  if (lightboxClose) {
    lightboxClose.addEventListener("click", closeLightbox);
  }

  if (lightboxPrev) {
    lightboxPrev.addEventListener("click", () => openLightbox(currentLightboxIndex - 1));
  }

  if (lightboxNext) {
    lightboxNext.addEventListener("click", () => openLightbox(currentLightboxIndex + 1));
  }

  if (lightbox) {
    lightbox.addEventListener("click", (event) => {
      if (event.target === lightbox) {
        closeLightbox();
      }
    });
  }

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeMenu();
      closeLightbox();
    }

    if (lightbox && lightbox.classList.contains("open")) {
      if (event.key === "ArrowLeft") {
        openLightbox(currentLightboxIndex - 1);
      }

      if (event.key === "ArrowRight") {
        openLightbox(currentLightboxIndex + 1);
      }
    }
  });

  if (form) {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const fields = Array.from(form.querySelectorAll("input, textarea"));

    const setFieldError = (field, message) => {
      const wrapper = field.closest(".form-group");
      const error = wrapper ? wrapper.querySelector(".error-message") : null;

      if (wrapper) {
        wrapper.classList.add("error");
      }

      if (error) {
        error.textContent = message;
      }
    };

    const clearFieldError = (field) => {
      const wrapper = field.closest(".form-group");
      const error = wrapper ? wrapper.querySelector(".error-message") : null;

      if (wrapper) {
        wrapper.classList.remove("error");
      }

      if (error) {
        error.textContent = "";
      }
    };

    const validateField = (field) => {
      const value = field.value.trim();

      if (!value) {
        setFieldError(field, "This field is required.");
        return false;
      }

      if (field.type === "email" && !emailPattern.test(value)) {
        setFieldError(field, "Please enter a valid email address.");
        return false;
      }

      if (field.name === "message" && value.length < 10) {
        setFieldError(field, "Please enter at least 10 characters.");
        return false;
      }

      clearFieldError(field);
      return true;
    };

    fields.forEach((field) => {
      field.addEventListener("input", () => validateField(field));
      field.addEventListener("blur", () => validateField(field));
    });

    form.addEventListener("submit", (event) => {
      event.preventDefault();

      const isValid = fields.every((field) => validateField(field));

      formStatus.classList.remove("is-error", "is-success");
      if (formSuccessActions) {
        formSuccessActions.hidden = true;
      }

      if (!isValid) {
        formStatus.textContent = "Please review the highlighted fields and try again.";
        formStatus.classList.add("is-error");
        return;
      }

      const name = document.getElementById("name")?.value.trim() || "";
      const email = document.getElementById("email")?.value.trim() || "";
      const message = document.getElementById("message")?.value.trim() || "";
      const whatsappMessage = encodeURIComponent(
        `Hello Dallas Tetouan, my name is ${name}. My email is ${email}. I would like to ask about: ${message}`
      );

      if (whatsappPrefill) {
        whatsappPrefill.href = `https://wa.me/212728904907?text=${whatsappMessage}`;
      }

      formStatus.textContent = "Thank you. Your message is ready, and you can continue instantly on WhatsApp.";
      formStatus.classList.add("is-success");

      if (formSuccessActions) {
        formSuccessActions.hidden = false;
      }

      form.reset();
      fields.forEach((field) => clearFieldError(field));
    });
  }
});
