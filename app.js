const $ = (sel, root = document) => root.querySelector(sel);

const state = {
  theme: localStorage.getItem("theme") || "dark",
  draftKey: "contactDraft_v1"
};

const features = [
  "Переключение светлой/тёмной темы + сохранение выбора",
  "Мобильное меню с открытием/закрытием",
  "Анимация появления секций при прокрутке",
  "Валидация формы + сохранение черновика в localStorage"
];

const jsFeatures = $("#jsFeatures");
jsFeatures.innerHTML = features.map(f => `<li>${f}</li>`).join("");

$("#year").textContent = new Date().getFullYear();

function applyTheme(theme) {
  document.documentElement.dataset.theme = theme === "light" ? "light" : "dark";
  localStorage.setItem("theme", theme);
  state.theme = theme;
}
applyTheme(state.theme);

$("#themeBtn").addEventListener("click", () => {
  applyTheme(state.theme === "dark" ? "light" : "dark");
  toast(`Тема: ${state.theme === "dark" ? "тёмная" : "светлая"}`);
});

const menuBtn = $("#menuBtn");
const nav = $("#siteNav");

menuBtn.addEventListener("click", () => {
  const open = nav.classList.toggle("open");
  menuBtn.setAttribute("aria-expanded", String(open));
});

nav.addEventListener("click", (e) => {
  const link = e.target.closest("a");
  if (!link) return;
  nav.classList.remove("open");
  menuBtn.setAttribute("aria-expanded", "false");
});

const observer = new IntersectionObserver((entries) => {
  for (const entry of entries) {
    if (entry.isIntersecting) entry.target.classList.add("visible");
  }
}, { threshold: 0.15 });

document.querySelectorAll(".reveal").forEach(el => observer.observe(el));

const form = $("#contactForm");
const hint = $("#formHint");
const draft = JSON.parse(localStorage.getItem(state.draftKey) || "{}");

for (const [k, v] of Object.entries(draft)) {
  const field = form.elements[k];
  if (field && typeof v === "string") field.value = v;
}

form.addEventListener("input", () => {
  const data = {
    name: form.elements.name.value,
    email: form.elements.email.value,
    message: form.elements.message.value
  };
  localStorage.setItem(state.draftKey, JSON.stringify(data));
});

form.addEventListener("submit", (e) => {
  e.preventDefault();

  hint.textContent = "";
  const name = form.elements.name.value.trim();
  const email = form.elements.email.value.trim();
  const message = form.elements.message.value.trim();
  const agree = form.elements.agree.checked;

  const errors = [];
  if (name.length < 2) errors.push("Укажите имя (минимум 2 символа).");
  if (!email.includes("@") || email.length < 5) errors.push("Укажите корректный email.");
  if (message.length < 10) errors.push("Сообщение должно быть минимум 10 символов.");
  if (!agree) errors.push("Нужно согласие на обработку данных.");

  if (errors.length) {
    hint.textContent = errors.join(" ");
    toast("Проверьте поля формы.");
    return;
  }

  localStorage.removeItem(state.draftKey);
  form.reset();
  hint.textContent = "Сообщение готово. Здесь можно подключить реальную отправку на сервер.";
  toast("Форма успешно проверена.");
});

const toastEl = $("#toast");
let toastTimer = null;

function toast(text) {
  toastEl.textContent = text;
  toastEl.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toastEl.classList.remove("show"), 2200);
}
