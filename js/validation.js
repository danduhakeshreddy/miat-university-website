// Shared validation expressions and form helpers for MIAT pages.
const studentDomain = window.SITE_CONFIG.studentEmailDomain.replaceAll(".", "\\.");
window.PATTERNS = {
  name: /^[A-Za-z][A-Za-z ]*$/, registerNumber: /^REG\d{6}$/,
  email: /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/,
  // Assignment pattern name retained; MIAT is the configured student domain.
  vitEmail: new RegExp("^[A-Za-z0-9._%+-]+@" + studentDomain + "$"),
  mobile10: /^\d{10}$/, employeeId: /^EMP\d{4}$/, pinCode: /^[1-9]\d{5}$/,
  cardNumber: /^(?:\d{4} ?){3}\d{4}$/, cvv: /^\d{3,4}$/,
  upi: /^[A-Za-z0-9._-]{2,256}@[A-Za-z]{2,64}$/,
  strongPassword: /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/,
  username: /^[A-Za-z0-9._]{4,20}$/, pin4: /^\d{4}$/, digitsOnly: /^\d+$/
};
window.validateField = (input, pattern, errorEl, message) => {
  const valid = pattern.test(input.value.trim());
  if (errorEl) errorEl.textContent = valid ? "" : message;
  input.setAttribute("aria-invalid", String(!valid));
  return valid;
};
