document.addEventListener('DOMContentLoaded', () => {
    function setFieldError(input, message) {
        input.classList.add('input-error');
        input.classList.remove('input-success');

        let errorEl = input.parentElement.querySelector('.field-error');
        if (!errorEl) {
            errorEl = document.createElement('small');
            errorEl.className = 'field-error';
            input.parentElement.appendChild(errorEl);
        }
        errorEl.textContent = message;
    }

    function clearFieldError(input) {
        input.classList.remove('input-error');

        if (input.value.trim() !== '') {
            input.classList.add('input-success');
        } else {
            input.classList.remove('input-success');
        }

        const errorEl = input.parentElement.querySelector('.field-error');
        if (errorEl) {
            errorEl.textContent = '';
        }
    }

    function validateName(input) {
        const value = input.value.trim();
        if (value.length < 2) {
            setFieldError(input, 'Emri duhet të ketë të paktën 2 karaktere.');
            return false;
        }
        clearFieldError(input);
        return true;
    }

    function validateEmail(input) {
        const value = input.value.trim();
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailRegex.test(value)) {
            setFieldError(input, 'Vendos një email të vlefshëm.');
            return false;
        }
        clearFieldError(input);
        return true;
    }

    function validatePassword(input) {
        const value = input.value;
        if (value.length < 6) {
            setFieldError(input, 'Password duhet të ketë të paktën 6 karaktere.');
            return false;
        }
        clearFieldError(input);
        return true;
    }

    function validateConfirmPassword(passwordInput, confirmInput) {
        if (confirmInput.value !== passwordInput.value) {
            setFieldError(confirmInput, 'Password-et nuk përputhen.');
            return false;
        }
        clearFieldError(confirmInput);
        return true;
    }

    function validateRequiredPassword(input, message = 'Password nuk mund të jetë bosh.') {
        if (input.value.trim() === '') {
            setFieldError(input, message);
            return false;
        }

        clearFieldError(input);
        return true;
    }

    function validateDeleteConfirm(input) {
        if (input.value.trim() !== 'DELETE') {
            setFieldError(input, 'Shkruaj DELETE për të konfirmuar.');
            return false;
        }

        clearFieldError(input);
        return true;
    }

    function validateCity(input) {
        const value = input.value.trim();
        const cityRegex = /^[A-Za-zÀ-ž\u00C0-\u024F\s'’-]{2,}$/;

        if (!cityRegex.test(value)) {
            setFieldError(input, 'Shkruaj një emër qyteti të vlefshëm.');
            return false;
        }
        clearFieldError(input);
        return true;
    }

    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        const nameInput = document.getElementById('name');
        const emailInput = document.getElementById('email');
        const passwordInput = document.getElementById('password');
        const confirmPasswordInput = document.getElementById('confirm_password');

        nameInput.addEventListener('input', () => validateName(nameInput));
        emailInput.addEventListener('input', () => validateEmail(emailInput));
        passwordInput.addEventListener('input', () => validatePassword(passwordInput));
        confirmPasswordInput.addEventListener('input', () => validateConfirmPassword(passwordInput, confirmPasswordInput));

        registerForm.addEventListener('submit', (event) => {
            const isValid =
                validateName(nameInput) &&
                validateEmail(emailInput) &&
                validatePassword(passwordInput) &&
                validateConfirmPassword(passwordInput, confirmPasswordInput);

            if (!isValid) {
                event.preventDefault();
            }
        });
    }

    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        const emailInput = document.getElementById('email');
        const passwordInput = document.getElementById('password');

        emailInput.addEventListener('input', () => validateEmail(emailInput));
        passwordInput.addEventListener('input', () => {
            if (passwordInput.value.trim() === '') {
                setFieldError(passwordInput, 'Password nuk mund të jetë bosh.');
                return;
            }
            clearFieldError(passwordInput);
        });

        loginForm.addEventListener('submit', (event) => {
            const emailOk = validateEmail(emailInput);

            let passwordOk = true;
            if (passwordInput.value.trim() === '') {
                setFieldError(passwordInput, 'Password nuk mund të jetë bosh.');
                passwordOk = false;
            } else {
                clearFieldError(passwordInput);
            }

            if (!emailOk || !passwordOk) {
                event.preventDefault();
            }
        });
    }

    const citySearchForm = document.getElementById('citySearchForm');
    if (citySearchForm) {
        const cityInput = document.getElementById('cityInput');

        cityInput.addEventListener('input', () => validateCity(cityInput));

        citySearchForm.addEventListener('submit', (event) => {
            if (!validateCity(cityInput)) {
                event.preventDefault();
            }
        });
    }

    const accountProfileForm = document.getElementById('accountProfileForm');
    if (accountProfileForm) {
        const nameInput = document.getElementById('accountName');
        const emailInput = document.getElementById('accountEmail');

        nameInput.addEventListener('input', () => validateName(nameInput));
        emailInput.addEventListener('input', () => validateEmail(emailInput));

        accountProfileForm.addEventListener('submit', (event) => {
            const isValid = validateName(nameInput) && validateEmail(emailInput);

            if (!isValid) {
                event.preventDefault();
            }
        });
    }

    const accountPasswordForm = document.getElementById('accountPasswordForm');
    if (accountPasswordForm) {
        const currentPasswordInput = document.getElementById('currentPassword');
        const newPasswordInput = document.getElementById('newPassword');
        const confirmNewPasswordInput = document.getElementById('confirmNewPassword');

        currentPasswordInput.addEventListener('input', () => validateRequiredPassword(currentPasswordInput, 'Password aktual nuk mund të jetë bosh.'));
        newPasswordInput.addEventListener('input', () => validatePassword(newPasswordInput));
        confirmNewPasswordInput.addEventListener('input', () => validateConfirmPassword(newPasswordInput, confirmNewPasswordInput));

        accountPasswordForm.addEventListener('submit', (event) => {
            const isValid =
                validateRequiredPassword(currentPasswordInput, 'Password aktual nuk mund të jetë bosh.') &&
                validatePassword(newPasswordInput) &&
                validateConfirmPassword(newPasswordInput, confirmNewPasswordInput);

            if (!isValid) {
                event.preventDefault();
            }
        });
    }

    const deleteAccountForm = document.getElementById('deleteAccountForm');
    if (deleteAccountForm) {
        const deletePasswordInput = document.getElementById('deletePassword');
        const deleteConfirmInput = document.getElementById('deleteConfirm');

        deletePasswordInput.addEventListener('input', () => validateRequiredPassword(deletePasswordInput));
        deleteConfirmInput.addEventListener('input', () => validateDeleteConfirm(deleteConfirmInput));

        deleteAccountForm.addEventListener('submit', (event) => {
            const isValid =
                validateRequiredPassword(deletePasswordInput) &&
                validateDeleteConfirm(deleteConfirmInput);

            if (!isValid) {
                event.preventDefault();
                return;
            }

            if (!window.confirm('Je i sigurt qe do ta fshish llogarine perfundimisht?')) {
                event.preventDefault();
            }
        });
    }
});
