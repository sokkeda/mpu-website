// Load the script after the user scrolls, moves the mouse, or touches the screen
document.addEventListener('scroll', initGTMOnEvent);
document.addEventListener('mousemove', initGTMOnEvent);
document.addEventListener('touchstart', initGTMOnEvent);

// Or, load the script after 2 seconds
document.addEventListener('DOMContentLoaded', () => { setTimeout(initGTM, 2000); });

// Initializes Google Tag Manager in response to an event
function initGTMOnEvent (event) {
  initGTM();
  event.currentTarget.removeEventListener(event.type, initGTMOnEvent);
}

// Initializes Google Tag Manager
function initGTM () {
  if (window.gtmDidInit) {
    // Don't load again
    return false;
  }

  window.gtmDidInit = true;

  // Create the script
  const script = document.createElement('script');
  script.type = 'text/javascript';
  script.onload = () => {
    window.dataLayer = window.dataLayer || [];
    function gtag(){ dataLayer.push(arguments); }
    gtag('js', new Date());
    gtag('config', 'G-LWNFSSCTV3');
  }
  script.src = 'https://www.googletagmanager.com/gtag/js?id=G-LWNFSSCTV3';

  // We are still deferring the script
  script.defer = true;

  // Append the script to the body of the document
  document.getElementsByTagName('body')[0].appendChild(script);
}
