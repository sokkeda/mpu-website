(function() {
  emailjs.init('292WUCT9KsfrMXiFK');
})();

window.onload = function() {
  document.querySelector('.js-contact-form').addEventListener('submit', function(event) {
    event.preventDefault();
    emailjs.sendForm('service_cqf3xb5', 'template_ggpax1d', this)
      .then(function() {
        document.querySelector('.js-contact-form-success').classList.remove('hidden')
        console.log('SUCCESS!');
      }, function(error) {
        console.log('FAILED...', error);
      });
  });
}
