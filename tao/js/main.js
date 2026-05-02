(function() {
  'use strict';

  const hamburger = document.querySelector('.hamburger');
  const navMobile = document.querySelector('.nav-mobile');

  if (hamburger && navMobile) {
    hamburger.addEventListener('click', function() {
      hamburger.classList.toggle('is-active');
      navMobile.classList.toggle('is-open');
      document.body.style.overflow = navMobile.classList.contains('is-open') ? 'hidden' : '';
    });

    navMobile.querySelectorAll('.nav-mobile__link').forEach(function(link) {
      link.addEventListener('click', function() {
        hamburger.classList.remove('is-active');
        navMobile.classList.remove('is-open');
        document.body.style.overflow = '';
      });
    });
  }

  var currentPage = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav__link, .nav-mobile__link').forEach(function(link) {
    var href = link.getAttribute('href');
    if (href === currentPage || (href === 'index.html' && (currentPage === '' || currentPage === '/'))) {
      link.classList.add('active');
    }
  });
})();
