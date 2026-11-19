
document.addEventListener('DOMContentLoaded', function () {

  /* ---------- 1. Swiper — слайдер відгуків ---------- */
  new Swiper('.reviews-swiper', {
    loop: true,
    spaceBetween: 24,
    grabCursor: true,
    slidesPerView: 1,

    autoplay: {
      delay: 3500,                 // пауза між слайдами, мс
      disableOnInteraction: false, // автоплей не вимикається після дотику
      pauseOnMouseEnter: true      // зупинка при наведенні миші
    },

    pagination: {
      el: '.swiper-pagination',
      clickable: true
    },

    navigation: {
      nextEl: '.swiper-button-next',
      prevEl: '.swiper-button-prev'
    },

    // адаптивність: ширина екрана -> кількість видимих слайдів
    breakpoints: {
      320:  { slidesPerView: 1 },
      768:  { slidesPerView: 2 },
      1024: { slidesPerView: 3 }
    }
  });

  /* ---------- 2. Fancybox — галерея клініки ---------- */
  Fancybox.bind("[data-fancybox='zoovet-gallery']", {
    Carousel: {
      Transition: 'fade'           // плавне перетікання між фото
    },
    Images: {
      Panzoom: { maxScale: 3 }     // максимальне наближення — 3x
    }
  });

  /* ---------- 3. Typed.js — ефект друку в Hero ---------- */
  new Typed('#typed-text', {
    strings: [
      'вакцинація за записом',
      'УЗД та аналізи на місці',
      'хірургія без черги',
      'окремий зал для котів'
    ],
    typeSpeed: 50,
    backSpeed: 30,
    backDelay: 1800,
    loop: true
  });

});
