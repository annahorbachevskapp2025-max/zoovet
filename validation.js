/* =========================================================
   ZooVet — клієнтська валідація форми зворотного зв'язку
   Лабораторна робота №9
   ========================================================= */
(function () {
  'use strict';

  /* ---------- 1. Регулярні вирази ---------- */
  // Ім'я: мінімум 2 літери (укр/лат), дозволені пробіл, дефіс, апостроф
  const RE_NAME  = /^[A-Za-zА-Яа-яЁёЇїІіЄєҐґ'’\- ]{2,40}$/;
  // Email: текст без пробілів та @, далі @, домен, крапка, зона з 2+ літер
  const RE_EMAIL = /^[^\s@]+@[^\s@.]+\.[A-Za-z]{2,}$/;
  // Телефон: рівно +380 і 9 цифр після нього
  const RE_PHONE = /^\+380\d{9}$/;

  /* ---------- 2. Елементи ---------- */
  const form    = document.getElementById('feedback-form');
  if (!form) return;

  const fields = {
    name:    document.getElementById('fb-name'),
    email:   document.getElementById('fb-email'),
    phone:   document.getElementById('fb-phone'),
    message: document.getElementById('fb-message'),
    agree:   document.getElementById('fb-agree')
  };

  const submitBtn   = document.getElementById('fb-submit');
  const modal       = document.getElementById('fb-modal');
  const modalCard   = document.getElementById('fb-modal-card');
  const modalClose  = document.getElementById('fb-modal-close');
  const modalOk     = document.getElementById('fb-modal-ok');
  let   lastFocused = null;

  /* ---------- 3. UI-функції станів ---------- */
  const ERR_CLASSES = ['border-red-500',   'ring-2', 'ring-red-200'];
  const OK_CLASSES  = ['border-green-500', 'ring-2', 'ring-green-200'];

  function errorBox(input) {
    return document.getElementById(input.id + '-error');
  }

  function clearError(input) {
    input.classList.remove(...ERR_CLASSES, ...OK_CLASSES);
    input.classList.add('border-slate-300');
    input.setAttribute('aria-invalid', 'false');
    const box = errorBox(input);
    if (box) { box.textContent = ''; box.classList.add('hidden'); }
  }

  function showError(input, message) {
    input.classList.remove('border-slate-300', ...OK_CLASSES);
    input.classList.add(...ERR_CLASSES);
    input.setAttribute('aria-invalid', 'true');
    const box = errorBox(input);
    if (box) { box.textContent = message; box.classList.remove('hidden'); }
  }

  function showSuccess(input) {
    input.classList.remove('border-slate-300', ...ERR_CLASSES);
    input.classList.add(...OK_CLASSES);
    input.setAttribute('aria-invalid', 'false');
    const box = errorBox(input);
    if (box) { box.textContent = ''; box.classList.add('hidden'); }
  }

  /* ---------- 4. Нормалізація телефону (edge cases) ----------
     Користувач може ввести: 0671234567, 380671234567,
     +38 (067) 123-45-67, з пробілами або нерозривними пробілами.
     Прибираємо роздільники й зводимо до формату +380XXXXXXXXX.
     Введення НЕ блокуємо — лише готуємо рядок до перевірки.    */
  function normalizePhone(raw) {
    let v = String(raw)
      .replace(/[\s ()\-–—.]/g, '')  // пробіли, дужки, дефіси, крапки
      .trim();
    if (/^0\d{9}$/.test(v))       v = '+38' + v;   // 0671234567  -> +380671234567
    else if (/^380\d{9}$/.test(v)) v = '+' + v;    // 380671234567 -> +380671234567
    else if (/^80\d{9}$/.test(v))  v = '+3' + v;   // 80671234567  -> +380671234567
    return v;
  }

  /* ---------- 5. Функції валідації ----------
     Кожна повертає рядок з помилкою або '' якщо все гаразд. */

  function validateName() {
    const v = fields.name.value.trim();
    if (v === '')              return 'Вкажіть, будь ласка, ваше ім’я.';
    if (v.length < 2)          return 'Ім’я має містити щонайменше 2 символи.';
    if (!RE_NAME.test(v))      return 'Ім’я може містити лише літери, пробіл, дефіс та апостроф.';
    return '';
  }

  function validateEmail() {
    const v = fields.email.value.trim();
    if (v === '')              return 'Вкажіть email для підтвердження запису.';
    if (!RE_EMAIL.test(v))     return 'Email має бути у форматі ім’я@домен.ua';
    return '';
  }

  function validatePhone() {
    const raw = fields.phone.value.trim();
    if (raw === '')            return 'Вкажіть номер телефону.';
    const v = normalizePhone(raw);
    if (/[^\d+]/.test(v))      return 'Номер може містити лише цифри та символ «+».';
    if (!RE_PHONE.test(v))     return 'Номер має бути у форматі +380XXXXXXXXX (9 цифр після +380).';
    fields.phone.value = v;    // показуємо користувачу канонічний формат
    return '';
  }

  function validateMessage() {
    const v = fields.message.value.trim();
    if (v === '')              return 'Опишіть, що турбує вашого улюбленця.';
    if (v.length < 10)         return 'Повідомлення має містити щонайменше 10 символів (зараз ' + v.length + ').';
    if (v.length > 1000)       return 'Повідомлення задовге — максимум 1000 символів.';
    return '';
  }

  function validateAgreement() {
    return fields.agree.checked ? '' : 'Потрібна згода на обробку персональних даних.';
  }

  const validators = {
    name:    validateName,
    email:   validateEmail,
    phone:   validatePhone,
    message: validateMessage,
    agree:   validateAgreement
  };

  /* ---------- 6. Перевірка одного поля ---------- */
  function checkField(key, markSuccess) {
    const input = fields[key];
    const error = validators[key]();
    if (error) { showError(input, error); return false; }
    if (markSuccess) showSuccess(input); else clearError(input);
    return true;
  }

  /* ---------- 7. Динамічна валідація ----------
     blur  — перевіряємо після того, як користувач залишив поле;
     input — знімаємо помилку, щойно введення стало коректним
             (не «кричимо» на користувача під час набору).      */
  Object.keys(fields).forEach(function (key) {
    const input = fields[key];
    const isCheckbox = input.type === 'checkbox';

    input.addEventListener('blur', function () {
      if (!isCheckbox) checkField(key, true);
    });

    input.addEventListener(isCheckbox ? 'change' : 'input', function () {
      if (isCheckbox) { checkField(key, true); return; }
      // якщо помилка вже показана — прибираємо її, щойно дані стали валідними
      if (input.getAttribute('aria-invalid') === 'true' && !validators[key]()) {
        showSuccess(input);
      }
    });
  });

  /* ---------- 8. Відправка форми ---------- */
  form.addEventListener('submit', function (event) {
    event.preventDefault();              // блокуємо стандартну відправку
    if (submitBtn.disabled) return;      // захист від подвійного кліку

    let firstInvalid = null;
    let valid = true;

    Object.keys(fields).forEach(function (key) {
      const ok = checkField(key, true);
      if (!ok) { valid = false; if (!firstInvalid) firstInvalid = fields[key]; }
    });

    if (!valid) {
      firstInvalid.focus();              // фокус на перше помилкове поле
      return;
    }

    submitBtn.disabled = true;
    openModal();
    form.reset();                        // очищення форми
    Object.keys(fields).forEach(function (key) { clearError(fields[key]); });
    submitBtn.disabled = false;
  });

  /* ---------- 9. Модальне вікно ---------- */
  function openModal() {
    lastFocused = document.activeElement;
    modal.classList.remove('hidden');
    modal.classList.add('flex');
    document.body.classList.add('overflow-hidden');
    modalOk.focus();
  }

  function closeModal() {
    modal.classList.add('hidden');
    modal.classList.remove('flex');
    document.body.classList.remove('overflow-hidden');
    if (lastFocused) lastFocused.focus();   // повертаємо фокус туди, звідки прийшли
  }

  modalClose.addEventListener('click', closeModal);
  modalOk.addEventListener('click', closeModal);

  // Клік по затемненому фону закриває, клік усередині картки — ні
  modal.addEventListener('mousedown', function (e) {
    if (!modalCard.contains(e.target)) closeModal();
  });

  // Escape закриває вікно
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && !modal.classList.contains('hidden')) closeModal();
  });

  // Утримання фокусу всередині вікна (focus trap)
  modal.addEventListener('keydown', function (e) {
    if (e.key !== 'Tab') return;
    const focusable = modalCard.querySelectorAll('button, [href], input, select, textarea');
    if (!focusable.length) return;
    const first = focusable[0];
    const last  = focusable[focusable.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  });
})();
