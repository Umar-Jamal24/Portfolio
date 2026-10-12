/* =========================================================
   Muhammad Umar Jamal portfolio: JavaScript
   1. CONFIG (the only part you need to edit)
   2. Render skills, projects and links
   3. Navigation active state + scroll reveal
   4. Resume download check
   5. Contact form validation
   ========================================================= */

/* ---------- 1. CONFIG ---------- */
const CONFIG = {
  resumePath: "assets/resume.pdf",   // put your PDF here (see README.txt)
  formEndpoint: "",                  // paste your Formspree (or similar) URL here to make the form deliver messages

  // Add a link below only when you have the real URL. Links with an empty url are hidden.
  links: [
    { label: "GitHub",   url: "" },  // e.g. "https://github.com/your-username"
    { label: "LinkedIn", url: "" }   // e.g. "https://www.linkedin.com/in/your-profile"
  ],

  skills: [
    { icon: "</>", name: "HTML", text: "Structuring web pages with clear, meaningful markup." },
    { icon: "{ }", name: "CSS", text: "Styling layouts, colors and responsive behavior." },
    { icon: "B",   name: "Bootstrap", text: "Building responsive grids and components efficiently." },
    { icon: "JS",  name: "JavaScript", learning: true, text: "Learning the basics to add interactions such as form checks and filters." },
    { icon: "Git", name: "GitHub", text: "Storing my projects and publishing them online." }
  ],

  // To add a project, copy one block, paste it after the last one and edit the text.
  projects: [
    {
      title: "Alberto Clocks",
      description: "A multi-section website for a fictional luxury watch brand, built as an academic project to practise website design and frontend development. It is a demonstration only: no real purchases, repairs or appraisals take place.",
      highlights: [
        "Watch collection with category filters and search",
        "Product details, price list and image gallery",
        "Repair and appraisal request forms (demonstration only)",
        "Cart, wishlist and checkout flow (demonstration only)"
      ],
      tech: ["HTML", "CSS", "Bootstrap 5", "JavaScript"],
      image: "",                     // e.g. "assets/images/alberto-clocks.png" (add a screenshot, then put its path here)
      liveUrl: "https://umar-jamal24.github.io/Alberto-Clocks/",
      sourceUrl: ""                  // add your repository URL here to show a "View source code" button
    }
  ]
};

/* ---------- 2. RENDER ---------- */
document.documentElement.classList.add("js");

// Makes text safe to insert into HTML
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

// Skills
document.getElementById("skillsGrid").innerHTML = CONFIG.skills.map((s) => `
  <div class="col-sm-6 col-lg-4 reveal">
    <article class="skill">
      <span class="skill-icon" aria-hidden="true">${esc(s.icon)}</span>
      <h3>${esc(s.name)}${s.learning ? '<span class="tag-learning">Learning</span>' : ""}</h3>
      <p>${esc(s.text)}</p>
    </article>
  </div>`).join("");

// Projects
document.getElementById("projectsList").innerHTML = CONFIG.projects.map((p) => `
  <article class="project reveal">
    <div class="project-media">
      ${p.image ? `<img src="${esc(p.image)}" alt="Screenshot of ${esc(p.title)}">` : '<div class="clockface" role="img" aria-label="Preview placeholder"></div>'}
    </div>
    <div class="project-body">
      <h3>${esc(p.title)}</h3>
      <p>${esc(p.description)}</p>
      <ul>${p.highlights.map((h) => `<li>${esc(h)}</li>`).join("")}</ul>
      <ul class="tags" aria-label="Technologies">${p.tech.map((t) => `<li>${esc(t)}</li>`).join("")}</ul>
      <div class="d-flex flex-wrap gap-2">
        <a class="btn btn-cobalt" href="${esc(p.liveUrl)}" target="_blank" rel="noopener noreferrer">View live project</a>
        ${p.sourceUrl ? `<a class="btn btn-outline-ink" href="${esc(p.sourceUrl)}" target="_blank" rel="noopener noreferrer">View source code</a>` : ""}
      </div>
    </div>
  </article>`).join("");

// Professional links (only those with a URL)
const activeLinks = CONFIG.links.filter((l) => l.url.trim() !== "");
document.getElementById("contactLinks").innerHTML = activeLinks.map((l) =>
  `<li><a href="${esc(l.url)}" target="_blank" rel="noopener noreferrer">${esc(l.label)}</a></li>`).join("");
document.getElementById("footerLinks").insertAdjacentHTML("beforeend", activeLinks.map((l) =>
  `<li><a href="${esc(l.url)}" target="_blank" rel="noopener noreferrer">${esc(l.label)}</a></li>`).join(""));

document.getElementById("year").textContent = new Date().getFullYear();

/* ---------- 3. NAV ACTIVE STATE + REVEAL ---------- */
const navLinks = document.querySelectorAll(".nav-link");
const sections = [...navLinks].map((a) => document.querySelector(a.getAttribute("href")));

function updateActive() {
  const y = window.scrollY + 140;
  let current = sections[0];
  sections.forEach((s) => { if (s && s.offsetTop <= y) current = s; });
  navLinks.forEach((a) => {
    const on = a.getAttribute("href") === "#" + current.id;
    a.classList.toggle("active", on);
    on ? a.setAttribute("aria-current", "page") : a.removeAttribute("aria-current");
  });
}
window.addEventListener("scroll", updateActive, { passive: true });
updateActive();

// Close the mobile menu after choosing a link
const menu = document.getElementById("mainNav");
navLinks.forEach((a) => a.addEventListener("click", () => {
  if (menu.classList.contains("show") && window.bootstrap) bootstrap.Collapse.getOrCreateInstance(menu).hide();
}));

// Gentle reveal when sections scroll into view
if ("IntersectionObserver" in window) {
  const io = new IntersectionObserver((entries) => entries.forEach((e) => {
    if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
  }), { threshold: 0.12 });
  document.querySelectorAll(".reveal").forEach((el) => io.observe(el));
} else {
  document.querySelectorAll(".reveal").forEach((el) => el.classList.add("in"));
}

/* ---------- 4. RESUME DOWNLOAD ---------- */
// Checks that the PDF exists first, so visitors never get a broken download.
const resumeNote = document.getElementById("resumeNote");
document.querySelectorAll(".js-resume").forEach((link) => {
  link.setAttribute("href", CONFIG.resumePath);
  link.addEventListener("click", async (e) => {
    if (!location.protocol.startsWith("http")) return;   // opened from a folder: let the browser handle it
    e.preventDefault();
    try {
      const res = await fetch(CONFIG.resumePath, { method: "HEAD" });
      const type = res.headers.get("content-type") || "";
      if (!res.ok || !type.includes("pdf")) throw new Error("missing");
      const a = document.createElement("a");
      a.href = CONFIG.resumePath;
      a.download = "Muhammad-Umar-Jamal-Resume.pdf";
      document.body.appendChild(a); a.click(); a.remove();
      resumeNote.hidden = true;
    } catch {
      resumeNote.textContent = "My resume isn't available to download just yet. Please contact me and I'll send it.";
      resumeNote.hidden = false;
      resumeNote.scrollIntoView({ block: "nearest" });
    }
  });
});

/* ---------- 5. CONTACT FORM ---------- */
const form = document.getElementById("contactForm");
const statusBox = document.getElementById("formStatus");
const rules = {
  name:    (v) => v.trim().length >= 2 ? "" : "Enter your name (at least 2 characters).",
  email:   (v) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()) ? "" : "Enter a valid email address, like name@example.com.",
  subject: (v) => v.trim().length >= 3 ? "" : "Enter a subject (at least 3 characters).",
  message: (v) => v.trim().length >= 10 ? "" : "Write a message of at least 10 characters."
};

function checkField(input) {
  const msg = rules[input.name](input.value);
  document.getElementById(input.id + "Err").textContent = msg;
  input.setAttribute("aria-invalid", msg ? "true" : "false");
  return !msg;
}
function showStatus(type, text) {
  statusBox.className = "form-status " + type;
  statusBox.textContent = text;
  statusBox.hidden = false;
}
form.querySelectorAll("input, textarea").forEach((el) => el.addEventListener("blur", () => checkField(el)));

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const fields = [...form.querySelectorAll("input, textarea")];
  const results = fields.map(checkField);
  if (results.includes(false)) {
    fields[results.indexOf(false)].focus();
    showStatus("bad", "Please fix the highlighted fields and try again.");
    return;
  }
  // No delivery service configured: be honest, don't pretend the message was sent.
  if (!CONFIG.formEndpoint) {
    showStatus("warn", "Your details look good, but this form isn't connected to a delivery service yet, so nothing was sent. Please call me on 03313266084 instead.");
    return;
  }
  try {
    const res = await fetch(CONFIG.formEndpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Accept": "application/json" },
      body: JSON.stringify(Object.fromEntries(new FormData(form)))
    });
    if (!res.ok) throw new Error("failed");
    form.reset();
    showStatus("ok", "Thank you! Your message has been sent.");
  } catch {
    showStatus("bad", "Your message could not be sent. Please try again or call me on 03313266084.");
  }
});
