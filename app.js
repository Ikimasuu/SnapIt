// app.js - Enhanced carousel implementation
document.addEventListener("DOMContentLoaded", () => {
  // Get carousel elements
  const track = document.querySelector(".carousel-track");
  const cards = Array.from(track.children);
  const carousel = document.querySelector(".carousel");

  // Set initial state
  let currentIndex = 1; // Start with middle card focused
  let startX,
    startScrollLeft,
    isDragging = false;

  // Initialize carousel
  function initCarousel() {
    // Add focused class to the initial center card
    updateActiveCard();

    // Set proper spacing and initial transform
    positionCards();

    // Add navigation buttons
    addNavButtons();

    // Add click event listener to each card
    addCardClickListeners();
  }

  // Position all cards and apply proper spacing
  function positionCards() {
    const cardWidth = cards[0].offsetWidth;
    const cardMargin = 20; // Gap between cards (matching your CSS)
    const totalCardWidth = cardWidth + cardMargin;

    // Calculate the offset to center the active card
    const centerOffset = (carousel.offsetWidth - cardWidth) / 2;

    // Position each card
    cards.forEach((card, index) => {
      card.style.left = `${index * totalCardWidth}px`;
      card.setAttribute("data-index", index);
    });

    // Set initial position to center the active card
    updateCarouselPosition();
  }

  // Update the transform to center the active card
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

  // Update active card styling
  function updateActiveCard() {
    cards.forEach((card, index) => {
      if (index === currentIndex) {
        card.classList.add("focused");
      } else {
        card.classList.remove("focused");
      }
    });
  }

  // Add click event listeners to each card for direct navigation
  function addCardClickListeners() {
    cards.forEach((card, index) => {
      card.addEventListener("click", (e) => {
        // Only respond to actual clicks, not drag end events
        if (!isDragging) {
          currentIndex = index;
          updateActiveCard();
          updateCarouselPosition();
        }
      });

      // Make cards focusable for accessibility
      card.setAttribute("tabindex", "0");

      // Add keyboard support
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

  // Add navigation buttons
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

    // Add event listeners for buttons
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

  // Mouse events for dragging
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

    // Calculate how far was dragged
    const x = e.type === "mouseleave" ? e.clientX : e.pageX;
    const walk = x - startX;

    // Use a smaller threshold to detect a click vs. a drag
    const clickThreshold = 10;

    // If it's a very small movement, treat it as a click - handled by card click handler
    if (Math.abs(walk) < clickThreshold) {
      // It's a click, handled by the card click event
      return;
    }

    // Determine if we should move to next/prev card based on drag distance
    if (walk < -100 && currentIndex < cards.length - 1) {
      currentIndex++;
    } else if (walk > 100 && currentIndex > 0) {
      currentIndex--;
    }

    updateActiveCard();
    updateCarouselPosition();
  }

  // Handle window resize
  window.addEventListener("resize", () => {
    positionCards();
  });

  // Keyboard navigation
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

  // Initialize carousel
  initCarousel();
});

// Gallery and Lightbox functionality
document.addEventListener("DOMContentLoaded", () => {
  // Get all gallery elements
  const galleryItems = document.querySelectorAll(".gallery-item");
  const lightbox = document.getElementById("gallery-lightbox");
  const lightboxImage = document.getElementById("lightbox-image");
  const lightboxClose = document.getElementById("lightbox-close");
  const lightboxPrev = document.getElementById("lightbox-prev");
  const lightboxNext = document.getElementById("lightbox-next");
  const lightboxCaption = document.getElementById("lightbox-caption");

  let currentIndex = 0;

  // Function to open lightbox
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
    document.body.style.overflow = "hidden"; // Prevent scrolling when lightbox is open
  }

  // Function to close lightbox
  function closeLightbox() {
    lightbox.classList.remove("active");
    document.body.style.overflow = ""; // Restore scrolling
  }

  // Function to navigate to previous image
  function prevImage() {
    currentIndex =
      (currentIndex - 1 + galleryItems.length) % galleryItems.length;
    openLightbox(currentIndex);
  }

  // Function to navigate to next image
  function nextImage() {
    currentIndex = (currentIndex + 1) % galleryItems.length;
    openLightbox(currentIndex);
  }

  // Add click event listeners to gallery items
  galleryItems.forEach((item, index) => {
    item.addEventListener("click", () => {
      openLightbox(index);
    });

    // Add keyboard accessibility for tabbing
    item.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        openLightbox(index);
        e.preventDefault();
      }
    });

    // Make gallery items focusable
    item.setAttribute("tabindex", "0");
  });

  // Close lightbox when clicking close button
  lightboxClose.addEventListener("click", closeLightbox);

  // Navigate to previous image
  lightboxPrev.addEventListener("click", prevImage);

  // Navigate to next image
  lightboxNext.addEventListener("click", nextImage);

  // Close lightbox when clicking outside the image
  lightbox.addEventListener("click", (e) => {
    if (e.target === lightbox) {
      closeLightbox();
    }
  });

  // Keyboard navigation
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

  // Load high-resolution images when opening lightbox
  function preloadImages() {
    galleryItems.forEach((item) => {
      const img = item.querySelector("img");
      const highResSrc =
        img.getAttribute("data-high-res") || img.getAttribute("src");

      // Preload the image
      const preloadImg = new Image();
      preloadImg.src = highResSrc;
    });
  }

  // Preload images for smoother experience
  preloadImages();

  // Add touch swipe support for mobile devices
  let touchStartX = 0;
  let touchEndX = 0;

  lightbox.addEventListener(
    "touchstart",
    (e) => {
      touchStartX = e.changedTouches[0].screenX;
    },
    false
  );

  lightbox.addEventListener(
    "touchend",
    (e) => {
      touchEndX = e.changedTouches[0].screenX;
      handleSwipe();
    },
    false
  );

  function handleSwipe() {
    const swipeThreshold = 50;
    if (touchEndX < touchStartX - swipeThreshold) {
      // Swipe left - next image
      nextImage();
    } else if (touchEndX > touchStartX + swipeThreshold) {
      // Swipe right - previous image
      prevImage();
    }
  }
});

// submit button
function showMessage(event) {
  event.preventDefault();
  alert(
    "Form has been submitted! Our Social Interns will get back to you soon!"
  );

  window.location.href = "index.html";
}
