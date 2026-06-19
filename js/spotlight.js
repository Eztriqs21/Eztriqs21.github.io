(function() {
  function initSpotlight() {
    if (window.matchMedia('(pointer: coarse)').matches) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    var SELECTOR = '.nx-card, .bl-card, .nb-card, .fd-card, .au-card';

    document.addEventListener('mousemove', function(e) {
      var cards = document.querySelectorAll(SELECTOR);
      for (var i = 0; i < cards.length; i++) {
        var card = cards[i];
        var rect = card.getBoundingClientRect();
        if (e.clientX >= rect.left && e.clientX <= rect.right &&
            e.clientY >= rect.top && e.clientY <= rect.bottom) {
          var x = ((e.clientX - rect.left) / rect.width * 100).toFixed(1);
          var y = ((e.clientY - rect.top) / rect.height * 100).toFixed(1);
          card.style.setProperty('--spotlight-x', x + '%');
          card.style.setProperty('--spotlight-y', y + '%');
        }
      }
    }, { passive: true });

    document.addEventListener('mouseleave', function() {
      var cards = document.querySelectorAll(SELECTOR);
      for (var i = 0; i < cards.length; i++) {
        cards[i].style.setProperty('--spotlight-x', '50%');
        cards[i].style.setProperty('--spotlight-y', '50%');
      }
    }, { passive: true });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSpotlight);
  } else {
    initSpotlight();
  }
})();
