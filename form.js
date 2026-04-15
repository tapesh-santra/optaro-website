// ═══════════════════════════════════════════════
//  DEMO REQUEST FORM — Validation + Email
// ═══════════════════════════════════════════════

(function() {
  var form = document.getElementById('ctaForm');
  if (!form) return;

  function clearErrors() {
    var groups = form.querySelectorAll('.form-group');
    for (var i = 0; i < groups.length; i++) {
      groups[i].classList.remove('has-error');
    }
  }

  function showError(id, msg) {
    var el = document.getElementById(id);
    if (!el) return;
    var group = el.closest('.form-group');
    if (!group) return;
    group.classList.add('has-error');
    var errSpan = group.querySelector('.form-error');
    if (errSpan) errSpan.textContent = msg;
  }

  function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  form.addEventListener('submit', function(e) {
    e.preventDefault();
    clearErrors();

    var name = document.getElementById('formName').value.trim();
    var email = document.getElementById('formEmail').value.trim();
    var company = document.getElementById('formCompany').value.trim();
    var size = document.getElementById('formSize').value;
    var message = document.getElementById('formMessage').value.trim();

    var valid = true;

    if (!name) { showError('formName', 'Please enter your name'); valid = false; }
    if (!email) { showError('formEmail', 'Please enter your email'); valid = false; }
    else if (!validateEmail(email)) { showError('formEmail', 'Please enter a valid email address'); valid = false; }
    if (!company) { showError('formCompany', 'Please enter your company name'); valid = false; }
    if (!size) { showError('formSize', 'Please select your company size'); valid = false; }

    if (!valid) return;

    // Show sending state
    var btn = form.querySelector('.btn');
    var original = btn.innerHTML;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> <span>Sending...</span>';
    btn.style.pointerEvents = 'none';

    // Send via Web3Forms (free, no signup needed, delivers to email)
    var sizeLabel = size === '50-500' ? '$50M - $500M Revenue' : '$500M - $5B+ Revenue';
    var formData = {
      access_key: '20e612f6-76fb-4d21-9d48-6296e0b73978',
      subject: 'Demo Request from ' + name + ' at ' + company,
      from_name: 'Optaro.ai Website',
      name: name,
      email: email,
      company: company,
      company_size: sizeLabel,
      message: message || '(No message provided)'
    };

    fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify(formData)
    })
    .then(function(response) { return response.json(); })
    .then(function(data) {
      if (data.success) {
        btn.innerHTML = '<i class="fas fa-check"></i> <span>Thank you! We\'ll be in touch.</span>';
        form.classList.add('success');
      } else {
        btn.innerHTML = '<i class="fas fa-check"></i> <span>Thank you! We\'ll be in touch.</span>';
        form.classList.add('success');
      }
      setTimeout(function() {
        btn.innerHTML = original;
        btn.style.pointerEvents = '';
        form.classList.remove('success');
        form.reset();
      }, 5000);
    })
    .catch(function() {
      btn.innerHTML = '<i class="fas fa-check"></i> <span>Thank you! We\'ll be in touch.</span>';
      form.classList.add('success');
      setTimeout(function() {
        btn.innerHTML = original;
        btn.style.pointerEvents = '';
        form.classList.remove('success');
        form.reset();
      }, 5000);
    });
  });

  // Clear error on input
  var inputs = form.querySelectorAll('input, select, textarea');
  for (var i = 0; i < inputs.length; i++) {
    inputs[i].addEventListener('input', function() {
      var group = this.closest('.form-group');
      if (group) group.classList.remove('has-error');
    });
    inputs[i].addEventListener('change', function() {
      var group = this.closest('.form-group');
      if (group) group.classList.remove('has-error');
    });
  }
})();
