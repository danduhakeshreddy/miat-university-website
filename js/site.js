// Interactive behaviours shared by MIAT forms, learning labs, and campus tools.
window.MIAT = window.MIAT || {};
window.MIAT.initPage = () => {
  window.MIAT.cleanupPage?.();
  const pageCleanups = [];
  window.MIAT.cleanupPage = () => { pageCleanups.splice(0).forEach(cleanup => cleanup()); };
  const addPageCleanup = cleanup => pageCleanups.push(cleanup);
  document.querySelectorAll("img[data-fallback]").forEach(image => image.addEventListener("error", () => { if (image.dataset.fallback && image.src !== new URL(image.dataset.fallback, location.href).href) image.src = image.dataset.fallback; }, {once:true}));

  const page = document.body.dataset.page;
  const msg = document.querySelector("[data-result]");
  const result = text => { if (msg) { msg.textContent = text; msg.hidden = false; } };

  // Add mouse feedback to existing cards and controls throughout the site.
  const mouseTargets = ".feature-card, .product-card, .event-row, .campus-feature-photo, .button, .nav-link, .nav-trigger, .nav-dropdown a";
  const handleMouseOver = event => {
    const target = event.target.closest(mouseTargets);
    if (target && !target.contains(event.relatedTarget)) target.classList.add("mouse-hovered");
  };
  const handleMouseOut = event => {
    const target = event.target.closest(mouseTargets);
    if (target && !target.contains(event.relatedTarget)) target.classList.remove("mouse-hovered");
  };
  const handleMouseClick = event => {
    const target = event.target.closest(mouseTargets);
    if (!target) return;
    target.classList.remove("mouse-clicked");
    void target.offsetWidth;
    target.classList.add("mouse-clicked");
    window.setTimeout(() => target.classList.remove("mouse-clicked"), 260);
  };
  document.addEventListener("mouseover", handleMouseOver);
  document.addEventListener("mouseout", handleMouseOut);
  document.addEventListener("click", handleMouseClick);
  addPageCleanup(() => {
    document.removeEventListener("mouseover", handleMouseOver);
    document.removeEventListener("mouseout", handleMouseOut);
    document.removeEventListener("click", handleMouseClick);
  });

  // Give existing cards a restrained 3D tilt on precise pointer devices.
  const tiltMotion = window.matchMedia("(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)");
  if (tiltMotion.matches) {
    const tiltCards = Array.from(document.querySelectorAll(".feature-card, .product-card, .event-row, .campus-feature-photo, .side-note"));
    const resetTilt = card => {
      card.classList.remove("is-tilting");
      card.style.removeProperty("--tilt-x");
      card.style.removeProperty("--tilt-y");
    };
    tiltCards.forEach(card => {
      const move = event => {
        const bounds = card.getBoundingClientRect();
        if (!bounds.width || !bounds.height) return;
        const x = (event.clientX - bounds.left) / bounds.width - .5;
        const y = (event.clientY - bounds.top) / bounds.height - .5;
        card.style.setProperty("--tilt-x", `${(-y * 5).toFixed(2)}deg`);
        card.style.setProperty("--tilt-y", `${(x * 6).toFixed(2)}deg`);
        card.classList.add("is-tilting");
      };
      const leave = () => resetTilt(card);
      card.classList.add("tilt-card");
      card.addEventListener("pointermove", move);
      card.addEventListener("pointerleave", leave);
      addPageCleanup(() => {
        card.removeEventListener("pointermove", move);
        card.removeEventListener("pointerleave", leave);
        resetTilt(card);
        card.classList.remove("tilt-card");
      });
    });
  }

  // Reveal page sections as they enter the viewport; leave content visible if unsupported.
  const revealMotion = window.matchMedia("(prefers-reduced-motion: no-preference)");
  if (revealMotion.matches && "IntersectionObserver" in window) {
    const revealTargets = Array.from(document.querySelectorAll("main > .page-hero, main > .section, main > .section--compact, main > .carousel, main .feature-card, main .product-card, main .event-row, main .campus-feature-photo, main .video-placeholder, main .side-note")).filter(target => !target.closest("[hidden]"));
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-revealed");
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.08, rootMargin: "0px 0px -32px 0px" });
    revealTargets.forEach(target => { target.classList.add("reveal-pending"); observer.observe(target); });
    addPageCleanup(() => {
      observer.disconnect();
      revealTargets.forEach(target => target.classList.remove("reveal-pending", "is-revealed"));
    });
  }

  // Run the home hero carousel with buttons, dots, pause-on-hover, and arrow keys.
  const carousel = document.querySelector("[data-carousel]");
  if (carousel) {
    const slides = Array.from(carousel.querySelectorAll("[data-slide]"));
    const dots = Array.from(carousel.querySelectorAll("[data-dot]"));
    const renderSlide = (_, index) => { slides.forEach((slide, i) => { slide.hidden = i !== index; slide.setAttribute("aria-hidden", String(i !== index)); }); dots.forEach((dot, i) => dot.setAttribute("aria-current", String(i === index))); };
    if (tiltMotion.matches) {
      const moveHero = event => {
        const bounds = carousel.getBoundingClientRect();
        if (!bounds.width || !bounds.height) return;
        carousel.style.setProperty("--hero-x", `${(((event.clientX - bounds.left) / bounds.width) - .5) * -10}px`);
        carousel.style.setProperty("--hero-y", `${(((event.clientY - bounds.top) / bounds.height) - .5) * -8}px`);
      };
      const resetHero = () => { carousel.style.removeProperty("--hero-x"); carousel.style.removeProperty("--hero-y"); };
      carousel.addEventListener("pointermove", moveHero);
      carousel.addEventListener("pointerleave", resetHero);
      addPageCleanup(() => { carousel.removeEventListener("pointermove", moveHero); carousel.removeEventListener("pointerleave", resetHero); resetHero(); });
    }
    const slideData = slides.map((slide, i) => ({source: `images/campus-${i + 1}.svg`, caption: slide.querySelector("h1")?.textContent || "MIAT campus"}));
    const controller = createSlider(carousel, slideData, renderSlide);
    carousel.querySelector("[data-prev]")?.addEventListener("click", controller.prev);
    carousel.querySelector("[data-next]")?.addEventListener("click", controller.next);
    dots.forEach((dot, i) => dot.addEventListener("click", () => controller.goTo(i)));
    carousel.addEventListener("keydown", event => { if (event.key === "ArrowLeft") controller.prev(); if (event.key === "ArrowRight") controller.next(); });
    let timer = setInterval(controller.next, 6000);
    addPageCleanup(() => clearInterval(timer));
    const pause = () => clearInterval(timer);
    const resume = () => { clearInterval(timer); timer = setInterval(controller.next, 6000); };
    carousel.addEventListener("mouseenter", pause);
    carousel.addEventListener("mouseleave", resume);
    carousel.addEventListener("focusin", pause);
    carousel.addEventListener("focusout", event => { if (!carousel.contains(event.relatedTarget)) resume(); });
  }

  // Validate MIAT workshop email and selected interests.
  const workshop = document.querySelector("#workshop-form");
  workshop?.addEventListener("submit", event => {
    event.preventDefault();
    const email = workshop.elements.email; const name = workshop.elements.name.value.trim();
    const interests = Array.from(workshop.querySelectorAll('[name="interest"]:checked')).map(item => item.value);
    const emailOk = validateField(email, PATTERNS.vitEmail, document.querySelector("#email-error"), "Enter your MIAT email in the format username@miat.ac.in.");
    const interestsOk = interests.length > 0; document.querySelector("#interest-error").textContent = interestsOk ? "" : "Select at least one interest.";
    if (emailOk && interestsOk && name) result(`Registration successful for ${name}. Interests: ${interests.join(", ")}.`);
  });
  workshop?.querySelector('[name="email"]')?.addEventListener("input", () => { const input = workshop.elements.email; if (PATTERNS.miatEmail.test(input.value.trim())) document.querySelector("#email-error").textContent = ""; });

  // Validate employee registration and render its confirmation.
  const staff = document.querySelector("#staff-form");
  staff?.addEventListener("submit", event => {
    event.preventDefault(); const id = staff.elements.employeeId; const name = staff.elements.name.value.trim();
    const idOk = validateField(id, PATTERNS.employeeId, document.querySelector("#employee-error"), "Use EMP followed by four digits, for example EMP1234.");
    const type = staff.querySelector('[name="employmentType"]:checked'); document.querySelector("#employment-error").textContent = type ? "" : "Select an employment type.";
    if (idOk && name && type) result(`Registration complete: ${id.value.trim()} · ${name} · ${type.value} · ${staff.elements.department.value}.`);
  });
  staff?.elements.employeeId?.addEventListener("input", () => { if (PATTERNS.employeeId.test(staff.elements.employeeId.value.trim())) document.querySelector("#employee-error").textContent = ""; });

  // Validate symposium identity fields and summarize selected interests.
  const symposium = document.querySelector("#symposium-form");
  symposium?.addEventListener("submit", event => {
    event.preventDefault();
    const validName = PATTERNS.name.test(symposium.elements.symName.value.trim());
    const validEmail = PATTERNS.email.test(symposium.elements.symEmail.value.trim());
    const validRegister = PATTERNS.registerNumber.test(symposium.elements.registerNumber.value.trim());
    const validMobile = PATTERNS.mobile10.test(symposium.elements.symMobile.value.trim());
    const selectedSkills = [];
    selectedSkills.push(...Array.from(symposium.querySelectorAll('[name="symSkill"]:checked')).map(input => input.value));
    if (!validName || !validEmail || !validRegister || !validMobile) return result("Check your name, MIAT email, register number (REG123456), and 10-digit mobile number.");
    const summary = document.querySelector("#symposium-results");
    summary.innerHTML = `<h2>Registration received</h2><div class="table-wrap"><table><thead><tr><th>Participant Name</th><th>Department</th><th>Skills</th></tr></thead><tbody><tr><td>${symposium.elements.symName.value.trim()}</td><td>${symposium.elements.symDepartment.value}</td><td>${selectedSkills.join(", ") || "General participation"}</td></tr></tbody></table></div>`;
    summary.hidden = false; result("Symposium registration complete.");
  });

  // Confirm a complete campus health-centre registration.
  const healthForm = document.querySelector("#health-form");
  if (healthForm?.elements.patientId) healthForm.elements.patientId.value = `PAT${String(Math.floor(Math.random() * 1000000)).padStart(6, "0")}`;
  healthForm?.addEventListener("reset", () => { const confirmation = document.querySelector("#health-confirmation"); if (confirmation) { confirmation.hidden = true; confirmation.innerHTML = ""; } if (msg) msg.hidden = true; });
  healthForm?.addEventListener("submit", event => {
    event.preventDefault();
    if (!healthForm.elements.bloodGroup.value) return result("Choose a blood group before submitting.");
    const password = healthForm.elements.patientPassword.value.trim();
    if (!PATTERNS.name.test(healthForm.elements.patientName.value.trim())) return result("Enter your name using letters and spaces.");
    if (!PATTERNS.strongPassword.test(password)) return result("Use a password with at least 8 characters, including uppercase, lowercase, a number, and a symbol.");
    const confirmation = document.querySelector("#health-confirmation");
    confirmation.innerHTML = `<p class="eyebrow">Registration complete · ${healthForm.elements.patientId.value}</p><h2>Thank you, ${healthForm.elements.patientName.value.trim()}.</h2><p>Email: ${healthForm.elements.patientEmail.value.trim()}</p><p>Blood group: ${healthForm.elements.bloodGroup.value}</p>`;
    confirmation.hidden = false;
  });

  // Search and filter the campus store product array.
  const store = document.querySelector("#store-tools");
  if (store) {
    const products = [
      {name:"MIAT Hoodie",category:"Clothing",price:1299,image:"https://luxemeadow.co.uk/assets/black-hoodie-D8pfBsf6.jpg"},
      {name:"Engineering Notebook Set",category:"Books",price:449,image:"https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=900&q=85"},
      {name:"Campus Water Bottle",category:"Groceries",price:299,image:"https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=900&q=85"},
      {name:"Wireless Earbuds",category:"Electronics",price:1899,image:"https://images.unsplash.com/photo-1640901821270-6e9c47fbdc07?auto=format&fit=crop&w=900&q=85"},
      {name:"Programming Handbook",category:"Books",price:1150,image:"https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=900&q=85"},
      {name:"Organic Snack Pack",category:"Groceries",price:560,image:"https://img.drz.lazcdn.com/static/lk/p/3867fa910d6409c0b09c8005ac818c52.jpg_720x720q80.jpg"}
    ];
    const grid = document.querySelector("#product-grid");
    const allowedProducts = new Set(products.map(item => item.name));
    let cart = readArray("miat-cart").filter(name => allowedProducts.has(name));
    storeArray("miat-cart", cart);
    const draw = () => {
      const q = store.querySelector('[name="query"]').value.trim().toLowerCase(), category = store.querySelector('[name="category"]').value, price = store.querySelector('[name="price"]').value;
      const shown = products.filter(item => (!q || item.name.toLowerCase().includes(q)) && (category === "all" || item.category === category) && (price === "all" || price === "low" && item.price < 500 || price === "mid" && item.price >= 500 && item.price <= 2000 || price === "high" && item.price > 2000));
      grid.innerHTML = shown.length ? shown.map(item => `<article class="product-card"><div class="product-art-wrap"><img class="product-art" data-store-image src="${item.image}" alt="Photo of ${item.name}" loading="lazy" decoding="async"><span class="product-art-fallback" hidden aria-hidden="true">${item.name}</span></div><p class="eyebrow">${item.category}</p><h3>${item.name}</h3><p class="price">₹${item.price.toLocaleString("en-IN")}</p><button class="button button--dark" data-add="${item.name}">Add to cart</button></article>`).join("") : '<p class="empty-state">No products found for your search.</p>';
      const cartCount = document.querySelector("#cart-count");
      if (cartCount) {
        cartCount.textContent = cart.length;
        cartCount.closest("a")?.setAttribute("aria-label", `Cart, ${cart.length} ${cart.length === 1 ? "item" : "items"}`);
      }
    };
    store.addEventListener("input", draw); store.addEventListener("change", draw);
    grid.addEventListener("error", event => {
      const image = event.target.closest("img[data-store-image]");
      if (!image) return;
      image.hidden = true;
      image.nextElementSibling.hidden = false;
    }, true);
    store.querySelector("#store-search")?.addEventListener("click", draw);
    grid.addEventListener("click", event => { const button = event.target.closest("[data-add]"); if (!button) return; cart.push(button.dataset.add); storeArray("miat-cart", cart); draw(); result(`${button.dataset.add} added to your cart.`); }); draw();
  }

  // Build the checkout summary from the products actually in the demo cart.
  const checkoutItems = document.querySelector("[data-checkout-items]");
  if (checkoutItems) {
    const catalog = new Map([["MIAT Hoodie",1299],["Engineering Notebook Set",449],["Campus Water Bottle",299],["Wireless Earbuds",1899],["Programming Handbook",1150],["Organic Snack Pack",560]]);
    const placeOrder = document.querySelector("[data-place-order]");
    const renderCheckout = () => {
      checkoutItems.replaceChildren();
      const quantities = new Map();
      readArray("miat-cart").forEach(name => { if (catalog.has(name)) quantities.set(name, (quantities.get(name) || 0) + 1); });
      let total = 0;
      if (!quantities.size) {
        const empty = document.createElement("p");
        empty.className = "empty-state";
        empty.textContent = "Your cart is empty. Add a campus store item to start a demo order.";
        checkoutItems.append(empty);
      } else {
        quantities.forEach((quantity, name) => {
          const price = catalog.get(name) * quantity;
          total += price;
          const row = document.createElement("div");
          row.className = "event-row checkout-item-row";
          const count = document.createElement("span"); count.className = "pill"; count.textContent = `${quantity} ×`;
          const label = document.createElement("span"); label.textContent = name;
          const amount = document.createElement("strong"); amount.textContent = `₹${price.toLocaleString("en-IN")}`;
          const remove = document.createElement("button"); remove.type = "button"; remove.className = "button button--dark button--small"; remove.dataset.removeCart = name; remove.textContent = "Remove"; remove.setAttribute("aria-label", `Remove ${name} from cart`);
          row.append(count, label, amount, remove); checkoutItems.append(row);
        });
      }
      const totalLabel = document.querySelector("[data-checkout-total]");
      if (totalLabel) { totalLabel.textContent = `Total ₹${total.toLocaleString("en-IN")}`; totalLabel.hidden = !quantities.size; }
      if (placeOrder) placeOrder.disabled = !quantities.size;
    };
    checkoutItems.addEventListener("click", event => {
      const button = event.target.closest("[data-remove-cart]");
      if (!button) return;
      const cart = readArray("miat-cart");
      const index = cart.indexOf(button.dataset.removeCart);
      if (index < 0) return;
      cart.splice(index, 1);
      storeArray("miat-cart", cart);
      renderCheckout();
    });
    renderCheckout();
  }

  // Calculate three marks using an array reduction.
  document.querySelector("#marks-form")?.addEventListener("submit", event => {
    event.preventDefault(); const form = event.currentTarget; const marks = [1,2,3].map(i => Number(form.elements[`mark${i}`].value));
    if (marks.some(mark => !Number.isFinite(mark) || mark < 0 || mark > 100)) return result("Enter a mark from 0 to 100 for each subject.");
    const total = marks.reduce((sum, mark) => sum + mark, 0), average = total / 3;
    const grade = average >= 90 ? "A" : average >= 75 ? "B" : average >= 60 ? "C" : average >= 40 ? "D" : "F";
    result(`Total: ${total} / 300 · Average: ${average.toFixed(2)}% · Grade: ${grade}`);
  });
  document.querySelector("#marks-form")?.addEventListener("reset", () => { if (msg) msg.hidden = true; });

  // Reveal admissions confirmation only after all extra checks pass.
  const admission = document.querySelector("#admissions-form");
  admission?.addEventListener("submit", event => {
    event.preventDefault(); const skills = admission.querySelectorAll('[name="skills"]:checked');
    if (!skills.length) return result("Please select at least one skill.");
    if (!PATTERNS.email.test(admission.elements.email.value.trim()) || !PATTERNS.mobile10.test(admission.elements.mobile.value.trim())) return result("Enter a valid email address and a 10-digit mobile number.");
    if (admission.elements.password.value !== admission.elements.confirm.value) return result("Passwords do not match. Please check the confirmation field.");
    const id = admission.elements.application_id.value, name = admission.elements.fullName.value, department = admission.elements.department.value;
    admission.hidden = true; const confirmation = document.querySelector("#application-confirmation"); confirmation.hidden = false; confirmation.innerHTML = `<p class="eyebrow">Application received</p><h2>Thank you, ${name}.</h2><p>Your application ID is <strong>${id}</strong>. Programme: ${department}.</p>`;
  });
  const dob = document.querySelector('#admissions-form [name="dob"]'); if (dob) dob.max = new Date().toISOString().slice(0,10);
  const appId = document.querySelector('#admissions-form [name="application_id"]'); if (appId) appId.value = `APP${Date.now()}`;
  document.querySelector('[data-payment-demo]')?.addEventListener("click", event => {
    event.preventDefault();
    result("Application-fee payment is a demo. No payment has been processed.");
  });

  // Support accessible keyboard-driven campus and destination galleries.
  const gallery = document.querySelector("[data-key-gallery]");
  if (gallery) {
    const items = Array.from(gallery.querySelectorAll("[data-gallery-item]")); let current = 0;
    const update = () => { items.forEach((item, i) => item.hidden = i !== current); const counter = gallery.querySelector("[data-counter]"); if (counter) counter.textContent = `Image ${current + 1} of ${items.length}`; };
    gallery.addEventListener("keydown", event => { if (["INPUT","TEXTAREA"].includes(event.target.tagName)) return;
      const key = event.key.toLowerCase(); if (key === "arrowright" || key === "n") { current = (current + 1) % items.length; update(); }
      else if (key === "arrowleft" || key === "p") { current = (current - 1 + items.length) % items.length; update(); }
      else if (key === "enter") result("Image Selected"); else if (key === " ") { event.preventDefault(); current = (current + 1) % items.length; update(); }
    });
    gallery.querySelector("[data-prev]")?.addEventListener("click", () => { current = (current - 1 + items.length) % items.length; update(); });
    gallery.querySelector("[data-next]")?.addEventListener("click", () => { current = (current + 1) % items.length; update(); }); update();
  }

  // Provide the mouse and keyboard lab interactions through event listeners.
  const colourBox = document.querySelector("#colorBox");
  if (colourBox) {
    const colours = ["#e0a526", "#77b8b2", "#ed8b58", "#a9a1d2", "#cf7f6c", "#6588a8"];
    const message = document.querySelector("#colorMessage");
    const eventName = document.querySelector("#mouse-event-name");
    const eventCoordinates = document.querySelector("#mouse-event-coordinates");
    const coordinates = event => { const rect = colourBox.getBoundingClientRect(); return {x:Math.round(event.clientX-rect.left), y:Math.round(event.clientY-rect.top)}; };
    const report = (name, event) => { const point = coordinates(event); if (eventName) eventName.textContent = name; if (eventCoordinates) eventCoordinates.textContent = `x: ${point.x}   y: ${point.y}`; };
    colourBox.addEventListener("mouseenter", event => { message.textContent = "Pointer entered the colour box"; report("mouseenter", event); });
    colourBox.addEventListener("mousemove", event => { const point=coordinates(event); document.querySelector("#mouse-position").textContent = `Position inside box: ${point.x}, ${point.y}`; if (eventName) eventName.textContent = "mousemove · pointer in motion"; if (eventCoordinates) eventCoordinates.textContent = `x: ${point.x}   y: ${point.y}`; });
    colourBox.addEventListener("mousedown", event => report("mousedown · button pressed", event));
    colourBox.addEventListener("mouseup", event => report("mouseup · button released", event));
    colourBox.addEventListener("click", event => { colourBox.style.background = colours[Math.floor(Math.random()*colours.length)]; message.textContent = "Click changed the box colour"; report("click · colour changed", event); });
    colourBox.addEventListener("mouseleave", event => { message.textContent = "Pointer left the colour box"; report("mouseleave", event); });
  }
  const hoverButton = document.querySelector("#hover-button");
  hoverButton?.addEventListener("mouseover", () => { document.querySelector("#welcomeText").textContent = "Welcome to MIAT!"; });
  hoverButton?.addEventListener("mouseout", () => { document.querySelector("#welcomeText").textContent = "Original text here."; });
  const productImage = document.querySelector("#product-image");
  const productInfo = document.querySelector("#product-info");
  productImage?.addEventListener("mouseover", () => { productImage.classList.add("product-image--active"); productInfo.textContent = "Recycled aluminium shell · 12-month campus warranty."; });
  productImage?.addEventListener("mouseout", () => { productImage.classList.remove("product-image--active"); productInfo.textContent = "A practical starter kit for weekend prototypes."; });
  document.querySelector("[data-view-details]")?.addEventListener("click", () => { productInfo.textContent = "₹1,499 · In Stock: 12 units"; });
  document.querySelector(".signal")?.addEventListener("mouseover", event => { const light = event.target.closest("[data-signal]"); if (!light) return; light.classList.add("signal-light--active"); document.querySelector("#signal-message").textContent = light.dataset.signal; });
  document.querySelector(".signal")?.addEventListener("mouseout", event => { const light = event.target.closest("[data-signal]"); if (!light) return; light.classList.remove("signal-light--active"); document.querySelector("#signal-message").textContent = ""; });
  document.querySelector("#productSearch")?.addEventListener("keydown", event => { event.currentTarget.classList.add("is-active"); if (event.key === "Enter") result(`Searching for: ${event.currentTarget.value.trim()}`); });
  document.querySelector("#productSearch")?.addEventListener("input", event => { document.querySelector("#product-typed").textContent = `You typed: ${event.currentTarget.value}`; });
  document.querySelector("#productSearch")?.addEventListener("keyup", event => { document.querySelector("#product-key-output").textContent = `Last key: ${event.key}`; });
  document.querySelector("#live-key-input")?.addEventListener("keyup", event => { document.querySelector("#live-key-output").textContent = `Last key pressed: ${event.key}`; });
  const studentSearch = document.querySelector("#studentSearch");
  const keyDisplay = document.querySelector("#keyDisplay");
  studentSearch?.addEventListener("keydown", event => { keyDisplay.textContent = `Key pressed: ${event.key}`; if (event.key === "Enter") result(studentSearch.value.trim() ? "Searching for student…" : "Please type a student name first."); if (event.key === "Escape") { studentSearch.value = ""; keyDisplay.textContent = ""; if (msg) msg.hidden = true; } });
  studentSearch?.addEventListener("keyup", event => { if (event.key === "Escape") keyDisplay.textContent = ""; else keyDisplay.textContent = `Key pressed: ${event.key}`; });
  const atmPin = document.querySelector("#atm-pin");
  if (atmPin) {
    let pin = ""; let started = false;
    const display = document.querySelector("#atm-display"); const output = document.querySelector("#key-output");
    const refreshPin = () => { atmPin.value = "*".repeat(pin.length); display.textContent = pin.length ? "*".repeat(pin.length) : "____"; };
    atmPin.addEventListener("keydown", event => {
      if (event.key === "Tab" || event.ctrlKey || event.altKey || event.metaKey) return;
      event.preventDefault(); if (!started) { started = true; output.textContent = "PIN Entry Started"; }
      if (PATTERNS.digitsOnly.test(event.key.trim()) && event.key.length === 1) { if (pin.length < 4) pin += event.key; else result("Warning: PIN is limited to four digits."); refreshPin(); }
      else if (event.key === "Backspace") { pin = pin.slice(0, -1); refreshPin(); }
      else if (event.key === "Enter") result(PATTERNS.pin4.test(pin.trim()) && PATTERNS.digitsOnly.test(pin.trim()) ? "PIN Submitted Successfully" : "Please enter a 4-digit PIN.");
      else if (event.key === "Escape") { pin = ""; refreshPin(); if (msg) msg.hidden = true; output.textContent = "PIN cleared."; }
      else result("Warning: Only numeric keys are allowed.");
    });
  }

  // Provide a five-question exam with click and keyboard answer selection.
  const exam = document.querySelector("#exam");
  if (exam) {
    const questions = [
      {q:"What is the time complexity of binary search?",a:["O(n)","O(log n)","O(n²)","O(1)"],correct:1},
      {q:"Which HTML tag creates the largest heading?",a:["h6","h1","head","header"],correct:1},
      {q:"What is the value of 2³?",a:["6","8","9","4"],correct:1},
      {q:"Which language runs in the browser?",a:["Python","C","JavaScript","Java"],correct:2},
      {q:"What does CSS stand for?",a:["Cascading Style Sheets","Creative Style System","Computer Style Sheet","Colourful Style Sheet"],correct:0}
    ]; let q=0, score=0;
    const draw = () => { const item=questions[q]; exam.innerHTML=`<p class="eyebrow">Question ${q+1} of ${questions.length}</p><h2>${item.q}</h2><div class="answer-list">${item.a.map((answer,i)=>`<button type="button" class="answer-button" data-answer="${i}">${answer}</button>`).join("")}</div><button type="button" class="button button--dark" data-submit-answer>Submit</button>`; };
    const submitAnswer = () => { const chosen=exam.querySelector(".selected"); if(!chosen)return result("Please select an option before submitting."); if(Number(chosen.dataset.answer)===questions[q].correct)score++; result("Answer Submitted Successfully"); q++; if(q<questions.length)draw(); else {exam.innerHTML=`<h2>Quiz complete</h2><p>You scored ${score} out of ${questions.length}.</p><p>${score>=3?"Good work. Keep building your knowledge.":"Keep practising and try again."}</p>`;result(`Your final score is ${score} out of ${questions.length}.`);} };
    exam.addEventListener("mouseover", e => { if(e.target.matches("[data-submit-answer]")) e.target.classList.add("is-hovered"); }); exam.addEventListener("mouseout", e => { if(e.target.matches("[data-submit-answer]")) e.target.classList.remove("is-hovered"); });
    exam.addEventListener("click", e => { const answer=e.target.closest("[data-answer]"); if(answer){exam.querySelectorAll("[data-answer]").forEach(x=>x.classList.remove("selected"));answer.classList.add("selected");} if(e.target.matches("[data-submit-answer]"))submitAnswer(); });
    exam.addEventListener("keydown", e => { if(e.key==="Enter" && e.target.matches("[data-answer]")) { if(!e.target.classList.contains("selected")) e.target.click(); else submitAnswer(); } }); draw();
  }

  // Validate checkout values and save a local demo order summary.
  document.querySelector("#delivery-form")?.addEventListener("submit", event => { event.preventDefault(); const form = event.currentTarget;
    if (!readArray("miat-cart").length) return result("Your cart is empty. Add an item from the campus store first.");
    if (!PATTERNS.mobile10.test(form.elements.deliveryMobile.value.trim()) || !PATTERNS.pinCode.test(form.elements.pin.value.trim())) return result("Enter a 10-digit mobile number and a valid six-digit PIN code.");
    window.MIAT.navigate("checkout-payment.html");
  });
  const paymentForm = document.querySelector("#checkout-form");
  paymentForm?.querySelectorAll("input").forEach(input => input.addEventListener("input", () => { const error = document.querySelector(`#${input.name}-error`); if (error) error.textContent = ""; }));
  paymentForm?.addEventListener("submit", event => { event.preventDefault(); const form=event.currentTarget;
    if (!readArray("miat-cart").length) return result("Your cart is empty. Add an item from the campus store first.");
    const card = form.elements.card.value.trim(), cvv = form.elements.cvv.value.trim(), upi = form.elements.upi.value.trim();
    const cardValid = PATTERNS.cardNumber.test(card) && PATTERNS.cvv.test(cvv);
    const upiValid = PATTERNS.upi.test(upi);
    document.querySelector("#card-error").textContent = cardValid || upiValid ? "" : "Enter a valid 16-digit card number.";
    document.querySelector("#cvv-error").textContent = cardValid || upiValid ? "" : "Enter a three or four digit CVV.";
    document.querySelector("#upi-error").textContent = upiValid || cardValid ? "" : "Enter a valid UPI ID, for example name@bank.";
    if (cardValid || upiValid) { result("Your demo order details are ready. No payment has been processed."); window.MIAT.navigate("checkout-summary.html"); }
  });
  document.querySelector("#contact-form")?.addEventListener("submit", event => { event.preventDefault(); const form = event.currentTarget; if (!PATTERNS.name.test(form.elements.contactName.value.trim()) || !PATTERNS.email.test(form.elements.contactEmail.value.trim()) || form.elements.message.value.trim().length < 20) return result("Enter your name, a valid email address, and a message with at least 20 characters."); result("Thank you. Your message has been recorded in this demo."); });
  document.querySelector("#student-search-form")?.addEventListener("submit", event => { event.preventDefault(); const input = document.querySelector("#studentSearch"); result(input.value.trim() ? "Searching for student…" : "Please type a student name first."); });
  document.querySelector("[data-place-order]")?.addEventListener("click", event => {
    if (!readArray("miat-cart").length) return result("Your cart is empty. Add an item from the campus store first.");
    result("Your demo order has been placed. No payment was processed.");
    storeArray("miat-cart", []);
    event.currentTarget.disabled = true;
  });

  // Switch between the dashboard panels in the student portal.
  const portalNav = document.querySelector("#portal-nav");
  portalNav?.addEventListener("click", event => {
    const button = event.target.closest("[data-panel]");
    if (!button) return;
    const panel = button.dataset.panel;
    portalNav.querySelectorAll("[data-panel]").forEach(item => item.setAttribute("aria-selected", String(item === button)));
    document.querySelectorAll("[data-panel-content]").forEach(item => { item.hidden = item.dataset.panelContent !== panel; });
  });

  // Keep the health centre pain-level output in sync with its slider.
  const range = document.querySelector("#pain-level"); range?.addEventListener("input", () => { document.querySelector("#pain-output").value = range.value; });
  const loginForm = document.querySelector("#login-form");
  const loginUser = loginForm?.elements.username;
  try { if (loginUser && localStorage.getItem("miat-remembered-user")) { loginUser.value = localStorage.getItem("miat-remembered-user"); const remember = loginForm.querySelector("[name=remember]"); if (remember) remember.checked = true; } } catch (_) {}
  document.querySelector("[data-toggle-password]")?.addEventListener("click", event => { const password = loginForm.elements.loginPassword; const visible = password.type === "text"; password.type = visible ? "password" : "text"; event.currentTarget.textContent = visible ? "Show password" : "Hide password"; });
  loginForm?.addEventListener("reset", () => { if (msg) msg.hidden = true; });
  loginForm?.addEventListener("submit", event => {
    event.preventDefault(); const username = loginForm.elements.username.value.trim(); const password = loginForm.elements.loginPassword.value;
    if (!PATTERNS.username.test(username) && !PATTERNS.email.test(username)) return result("Enter a valid username or MIAT email address.");
    const role = loginForm.elements.role.value;
    const valid = role === "student" ? username === "student01" && password === "Student@123" : username === "faculty01" && password === "Faculty@123";
    if (!valid) return result("The username, password, or selected role does not match the demo credentials.");
    const remember = loginForm.querySelector("[name=remember]");
    try { if (remember?.checked) localStorage.setItem("miat-remembered-user", username); else localStorage.removeItem("miat-remembered-user"); } catch (_) {}
    result("Demo sign-in complete. Welcome to MIAT."); window.setTimeout(() => { window.MIAT.navigate("portal.html"); }, 1000);
  });
};
document.addEventListener("DOMContentLoaded", window.MIAT.initPage);
document.addEventListener("miat:navigate", window.MIAT.initPage);
