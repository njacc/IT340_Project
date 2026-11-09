// Front-end demo behavior only; real authentication must be implemented by a secure server.

// Show/Hide buttons: data-password-toggle holds the ID of the password input to switch.
document.querySelectorAll('[data-password-toggle]').forEach((button) => {
  const passwordInput = document.getElementById(button.dataset.passwordToggle);
  if (!passwordInput) return;

  button.addEventListener('click', () => {
    const showPassword = passwordInput.type === 'password';
    passwordInput.type = showPassword ? 'text' : 'password';
    button.textContent = showPassword ? 'Hide' : 'Show';
    button.setAttribute('aria-pressed', String(showPassword));
  });
});

const loginForm = document.getElementById('loginForm');
if (loginForm) {
  loginForm.addEventListener('submit', (event) => {
    event.preventDefault();
    document.getElementById('loginNotice').textContent =
      'Form looks good. Connect a backend to enable secure sign-in.';
  });
}

const registerForm = document.getElementById('registerForm');
if (registerForm) {
  const passwordField = document.getElementById('registerPassword');
  const confirmField = document.getElementById('confirmPassword');
  const notice = document.getElementById('registerNotice');

  // Clear any old message as soon as the user edits either password field.
  [passwordField, confirmField].forEach((field) => {
    field.addEventListener('input', () => {
      notice.textContent = '';
    });
  });

  registerForm.addEventListener('submit', (event) => {
    event.preventDefault();

    if (passwordField.value !== confirmField.value) {
      notice.textContent = 'Passwords do not match. Please check both fields.';
      confirmField.focus();
      return;
    }

    notice.textContent = 'Form looks good. Connect a backend to create an account securely.';
  });
}
