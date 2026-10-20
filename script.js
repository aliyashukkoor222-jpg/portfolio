(() => {
  document.documentElement.classList.add("js-ready");

  const header = document.getElementById("site-header");
  const progressBar = document.getElementById("scroll-progress");
  const menuButton = document.getElementById("menu-toggle");
  const nav = document.getElementById("nav-links");
  const navLinks = Array.from(document.querySelectorAll(".nav-link, .nav-cta"));
  const sections = Array.from(document.querySelectorAll("main section[id]"));
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  /* ---------------------------------------------------------------------
     Footer year
     --------------------------------------------------------------------- */
  const year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();

  /* ---------------------------------------------------------------------
     Header state, scroll progress and active section
     --------------------------------------------------------------------- */
  let ticking = false;

  const updateActiveSection = () => {
    if (!sections.length) return;

    const offset = (header ? header.offsetHeight : 76) + 120;
    let current = sections[0];

    for (const section of sections) {
      if (section.getBoundingClientRect().top <= offset) current = section;
    }

    const atBottom =
      window.innerHeight + window.scrollY >=
      document.documentElement.scrollHeight - 8;

    if (atBottom) current = sections[sections.length - 1];

    navLinks.forEach((link) => {
      const isActive = link.hash === `#${current.id}`;
      link.classList.toggle("is-active", isActive);
      if (isActive) {
        link.setAttribute("aria-current", "location");
      } else {
        link.removeAttribute("aria-current");
      }
    });
  };

  const onScroll = () => {
    if (header) {
      header.classList.toggle("is-scrolled", window.scrollY > 8);
    }

    if (progressBar) {
      const scrollable =
        document.documentElement.scrollHeight - window.innerHeight;
      const progress = scrollable > 0 ? window.scrollY / scrollable : 0;
      progressBar.style.transform = `scaleX(${Math.min(Math.max(progress, 0), 1)})`;
    }

    updateActiveSection();
    ticking = false;
  };

  const requestScrollUpdate = () => {
    if (!ticking) {
      ticking = true;
      window.requestAnimationFrame(onScroll);
    }
  };

  window.addEventListener("scroll", requestScrollUpdate, { passive: true });
  window.addEventListener("resize", requestScrollUpdate);
  onScroll();

  /* ---------------------------------------------------------------------
     Mobile navigation
     --------------------------------------------------------------------- */
  if (menuButton && nav) {
    const setMenu = (open) => {
      nav.classList.toggle("open", open);
      menuButton.setAttribute("aria-expanded", String(open));
      menuButton.setAttribute("aria-label", open ? "Close menu" : "Open menu");
      document.body.classList.toggle("nav-open", open);
    };

    const isOpen = () => nav.classList.contains("open");

    menuButton.addEventListener("click", () => setMenu(!isOpen()));

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && isOpen()) {
        setMenu(false);
        menuButton.focus();
      }
    });

    document.addEventListener("click", (event) => {
      if (!isOpen()) return;
      if (nav.contains(event.target) || menuButton.contains(event.target)) return;
      setMenu(false);
    });

    nav.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => setMenu(false));
    });

    window.addEventListener("resize", () => {
      if (window.innerWidth > 860 && isOpen()) setMenu(false);
    });

    nav.addEventListener("click", (event) => {
      if (event.target === nav) setMenu(false);
    });
  }

  /* ---------------------------------------------------------------------
     Scroll-triggered reveals
     --------------------------------------------------------------------- */
  const revealElements = document.querySelectorAll(".reveal");
  const revealAll = () => {
    revealElements.forEach((element) => element.classList.add("is-visible"));
  };

  if (!("IntersectionObserver" in window) || reduceMotion.matches) {
    revealAll();
  } else {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        });
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 }
    );

    revealElements.forEach((element) => observer.observe(element));

    // Safety net: make sure nothing stays hidden if the observer is throttled.
    window.setTimeout(() => {
      revealElements.forEach((element) => {
        if (element.getBoundingClientRect().top < window.innerHeight) {
          element.classList.add("is-visible");
        }
      });
    }, 1200);
  }

  // Keep reveals working if the user changes the motion preference.
  if (typeof reduceMotion.addEventListener === "function") {
    reduceMotion.addEventListener("change", (event) => {
      if (event.matches) revealAll();
    });
  }
})();
