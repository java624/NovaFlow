/**
 * NovaFlow Language School - Language Selection & Redirection Handler
 */
document.addEventListener('DOMContentLoaded', () => {
  const langSelects = document.querySelectorAll('.lang-select');
  
  // Determine current language from page URL
  const path = window.location.pathname;
  let currentLang = 'en';
  
  if (path.includes('ukrainian.html')) {
    currentLang = 'uk';
  } else if (path.includes('german.html')) {
    currentLang = 'de';
  } else if (path.includes('english.html')) {
    currentLang = 'en';
  }

  // Sync all select elements on page load
  langSelects.forEach(select => {
    select.value = currentLang;
    
    // Listen to changes and redirect
    select.addEventListener('change', (e) => {
      const val = e.target.value;
      let targetPage = 'index.html';
      
      if (val === 'uk') {
        targetPage = 'ukrainian.html';
      } else if (val === 'de') {
        targetPage = 'german.html';
      } else if (val === 'en') {
        // Redirect to index.html or english.html depending on current file
        targetPage = path.includes('index.html') ? 'index.html' : 'english.html';
      }
      
      // Smooth fade transition or redirect directly
      document.body.style.opacity = '0';
      document.body.style.transition = 'opacity 0.25s ease';
      setTimeout(() => {
        window.location.href = targetPage;
      }, 250);
    });
  });
});
