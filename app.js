// scroll effects
document.addEventListener("DOMContentLoaded", () => {
  const animateElements = document.querySelectorAll(".animate-on-scroll");
  const timelineItems = document.querySelectorAll(".timeline-item");
  const staggeredContainers = document.querySelectorAll(".staggered-container");

  const observerOptions = {
    root: null,
    rootMargin: "0px 0px -50px 0px",
    threshold: 0.1,
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("animated");
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  animateElements.forEach((element) => {
    observer.observe(element);
  });

  timelineItems.forEach((item) => {
    observer.observe(item);
  });

  staggeredContainers.forEach((container) => {
    const staggerObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const children = Array.from(entry.target.children);
          children.forEach((child, index) => {
            setTimeout(() => {
              child.classList.add("animated");
            }, index * 100);
          });
          staggerObserver.unobserve(entry.target);
        }
      });
    }, observerOptions);

    staggerObserver.observe(container);
  });
});

// carousel functionality
document.addEventListener("DOMContentLoaded", () => {
  const track = document.querySelector(".carousel-track");
  const cards = Array.from(track.children);
  const carousel = document.querySelector(".carousel");

  let currentIndex = 1;
  let startX,
    startScrollLeft,
    isDragging = false;

  function initCarousel() {
    updateActiveCard();
    positionCards();
    addNavButtons();
    addCardClickListeners();
  }

  function positionCards() {
    const cardWidth = cards[0].offsetWidth;
    const cardMargin = 20;
    const totalCardWidth = cardWidth + cardMargin;

    const centerOffset = (carousel.offsetWidth - cardWidth) / 2;

    cards.forEach((card, index) => {
      card.style.left = `${index * totalCardWidth}px`;
      card.setAttribute("data-index", index);
    });

    updateCarouselPosition();
  }

  function updateCarouselPosition(withAnimation = true) {
    const cardWidth = cards[0].offsetWidth;
    const cardMargin = 20;
    const totalCardWidth = cardWidth + cardMargin;
    const centerOffset = (carousel.offsetWidth - cardWidth) / 2;

    if (withAnimation) {
      track.style.transition = "transform 0.5s ease";
    } else {
      track.style.transition = "none";
    }

    const translateX = -(currentIndex * totalCardWidth - centerOffset);
    track.style.transform = `translateX(${translateX}px)`;
  }

  function updateActiveCard() {
    cards.forEach((card, index) => {
      if (index === currentIndex) {
        card.classList.add("focused");
      } else {
        card.classList.remove("focused");
      }
    });
  }

  function addCardClickListeners() {
    cards.forEach((card, index) => {
      card.addEventListener("click", (e) => {
        if (!isDragging) {
          currentIndex = index;
          updateActiveCard();
          updateCarouselPosition();
        }
      });

      card.setAttribute("tabindex", "0");

      card.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          currentIndex = index;
          updateActiveCard();
          updateCarouselPosition();
          e.preventDefault();
        }
      });
    });
  }

  function addNavButtons() {
    const prevButton = document.createElement("button");
    prevButton.className = "carousel-nav carousel-prev";
    prevButton.innerHTML = "&#10094;";
    prevButton.setAttribute("aria-label", "Previous image");

    const nextButton = document.createElement("button");
    nextButton.className = "carousel-nav carousel-next";
    nextButton.innerHTML = "&#10095;";
    nextButton.setAttribute("aria-label", "Next image");

    carousel.appendChild(prevButton);
    carousel.appendChild(nextButton);

    prevButton.addEventListener("click", () => {
      if (currentIndex > 0) {
        currentIndex--;
        updateActiveCard();
        updateCarouselPosition();
      }
    });

    nextButton.addEventListener("click", () => {
      if (currentIndex < cards.length - 1) {
        currentIndex++;
        updateActiveCard();
        updateCarouselPosition();
      }
    });
  }

  track.addEventListener("mousedown", (e) => {
    isDragging = true;
    startX = e.pageX;
    startScrollLeft =
      track.getBoundingClientRect().left -
      track.offsetParent.getBoundingClientRect().left;
    track.style.transition = "none";
    track.style.cursor = "grabbing";
  });

  track.addEventListener("mousemove", (e) => {
    if (!isDragging) return;

    const x = e.pageX;
    const walk = x - startX;

    track.style.transform = `translateX(${startScrollLeft + walk}px)`;
  });

  track.addEventListener("mouseup", finishDragging);
  track.addEventListener("mouseleave", finishDragging);

  function finishDragging(e) {
    if (!isDragging) return;
    isDragging = false;
    track.style.cursor = "grab";

    const x = e.type === "mouseleave" ? e.clientX : e.pageX;
    const walk = x - startX;

    const clickThreshold = 10;

    if (Math.abs(walk) < clickThreshold) {
      return;
    }

    if (walk < -100 && currentIndex < cards.length - 1) {
      currentIndex++;
    } else if (walk > 100 && currentIndex > 0) {
      currentIndex--;
    }

    updateActiveCard();
    updateCarouselPosition();
  }

  window.addEventListener("resize", () => {
    positionCards();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft" && currentIndex > 0) {
      currentIndex--;
      updateActiveCard();
      updateCarouselPosition();
    } else if (e.key === "ArrowRight" && currentIndex < cards.length - 1) {
      currentIndex++;
      updateActiveCard();
      updateCarouselPosition();
    }
  });

  initCarousel();
});

// Gallery and Lightbox functionality
document.addEventListener("DOMContentLoaded", () => {
  const galleryItems = document.querySelectorAll(".gallery-item");
  const lightbox = document.getElementById("gallery-lightbox");
  const lightboxImage = document.getElementById("lightbox-image");
  const lightboxClose = document.getElementById("lightbox-close");
  const lightboxPrev = document.getElementById("lightbox-prev");
  const lightboxNext = document.getElementById("lightbox-next");
  const lightboxCaption = document.getElementById("lightbox-caption");

  let currentIndex = 0;

  function openLightbox(index) {
    currentIndex = index;
    const currentItem = galleryItems[index];
    const imgSrc = currentItem.querySelector("img").getAttribute("src");
    const imgAlt = currentItem.querySelector("img").getAttribute("alt");
    const imgCaption = currentItem
      .querySelector("img")
      .getAttribute("data-caption");

    lightboxImage.setAttribute("src", imgSrc);
    lightboxImage.setAttribute("alt", imgAlt);

    if (imgCaption) {
      lightboxCaption.textContent = imgCaption;
    } else {
      lightboxCaption.textContent = "";
    }

    lightbox.classList.add("active");
    document.body.style.overflow = "hidden";
  }

  function closeLightbox() {
    lightbox.classList.remove("active");
    document.body.style.overflow = "";
  }

  function prevImage() {
    currentIndex =
      (currentIndex - 1 + galleryItems.length) % galleryItems.length;
    openLightbox(currentIndex);
  }

  function nextImage() {
    currentIndex = (currentIndex + 1) % galleryItems.length;
    openLightbox(currentIndex);
  }

  galleryItems.forEach((item, index) => {
    item.addEventListener("click", () => {
      openLightbox(index);
    });

    item.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        openLightbox(index);
        e.preventDefault();
      }
    });

    item.setAttribute("tabindex", "0");
  });

  lightboxClose.addEventListener("click", closeLightbox);
  lightboxPrev.addEventListener("click", prevImage);
  lightboxNext.addEventListener("click", nextImage);
  lightbox.addEventListener("click", (e) => {
    if (e.target === lightbox) {
      closeLightbox();
    }
  });

  document.addEventListener("keydown", (e) => {
    if (!lightbox.classList.contains("active")) return;
    switch (e.key) {
      case "Escape":
        closeLightbox();
        break;
      case "ArrowLeft":
        prevImage();
        break;
      case "ArrowRight":
        nextImage();
        break;
    }
  });

  function preloadImages() {
    galleryItems.forEach((item) => {
      const img = item.querySelector("img");
      const highResSrc =
        img.getAttribute("data-high-res") || img.getAttribute("src");
      const preloadImg = new Image();
      preloadImg.src = highResSrc;
    });
  }
  preloadImages();
});

// Immediate animation for story section
document.addEventListener("DOMContentLoaded", function () {
  // Force animations for Our Story section to be visible
  setTimeout(() => {
    document
      .querySelectorAll(
        ".story-section .slide-in-left, .story-section .slide-in-right"
      )
      .forEach((element) => {
        element.classList.add("animated");
      });
  }, 300);
});

// submit button
function showMessage(event) {
  event.preventDefault();
  alert(
    "Form has been submitted! Our Social Interns will get back to you soon!"
  );

  window.location.href = "index.html";
}
