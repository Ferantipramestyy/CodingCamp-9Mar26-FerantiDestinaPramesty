const liveTime = document.getElementById("liveTime");
const liveDate = document.getElementById("liveDate");
const greetingText = document.getElementById("greetingText");
const userGreeting = document.getElementById("userGreeting");

const nameForm = document.getElementById("nameForm");
const nameInput = document.getElementById("nameInput");

const themeToggle = document.getElementById("themeToggle");
const themeIcon = document.getElementById("themeIcon");

const timerDisplay = document.getElementById("timerDisplay");
const startTimerBtn = document.getElementById("startTimer");
const stopTimerBtn = document.getElementById("stopTimer");
const resetTimerBtn = document.getElementById("resetTimer");

const taskForm = document.getElementById("taskForm");
const taskInput = document.getElementById("taskInput");
const taskList = document.getElementById("taskList");
const taskCount = document.getElementById("taskCount");

const linkForm = document.getElementById("linkForm");
const linkName = document.getElementById("linkName");
const linkUrl = document.getElementById("linkUrl");
const linksList = document.getElementById("linksList");

let timerMinutes = 25;
let timeLeft = timerMinutes * 60;
let timerInterval = null;

let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
let links = JSON.parse(localStorage.getItem("quickLinks")) || [
  { id: Date.now() + 1, name: "Google", url: "https://google.com" },
  { id: Date.now() + 2, name: "YouTube", url: "https://youtube.com" },
  { id: Date.now() + 3, name: "Gmail", url: "https://mail.google.com" }
];

let savedName = localStorage.getItem("username") || "";
let savedTheme = localStorage.getItem("theme") || "light";

function updateClock() {
  const now = new Date();

  const timeString = now.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false
  });

  const dateString = now.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric"
  });

  liveTime.textContent = timeString;
  liveDate.textContent = dateString;

  updateGreeting(now.getHours());
}

function updateGreeting(hour) {
  let greeting = "Good Evening";

  if (hour >= 5 && hour < 12) {
    greeting = "Good Morning";
  } else if (hour >= 12 && hour < 18) {
    greeting = "Good Afternoon";
  }

  greetingText.textContent = greeting;

  if (savedName.trim()) {
    userGreeting.textContent = `${greeting}, ${savedName} ✨`;
  } else {
    userGreeting.textContent = "Let's make today beautiful and productive.";
  }
}

function saveName(event) {
  event.preventDefault();

  const name = nameInput.value.trim();
  savedName = name;
  localStorage.setItem("username", savedName);
  nameInput.value = "";
  updateClock();
}

function applyTheme(theme) {
  document.body.classList.toggle("dark", theme === "dark");
  themeIcon.textContent = theme === "dark" ? "☀️" : "🌙";
  localStorage.setItem("theme", theme);
}

function toggleTheme() {
  const isDark = document.body.classList.contains("dark");
  applyTheme(isDark ? "light" : "dark");
}

function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}

function updateTimerDisplay() {
  timerDisplay.textContent = formatTime(timeLeft);
}

function startTimer() {
  if (timerInterval) return;

  timerInterval = setInterval(() => {
    if (timeLeft > 0) {
      timeLeft -= 1;
      updateTimerDisplay();
    } else {
      clearInterval(timerInterval);
      timerInterval = null;
      alert("Focus session completed!");
    }
  }, 1000);
}

function stopTimer() {
  clearInterval(timerInterval);
  timerInterval = null;
}

function resetTimer() {
  stopTimer();
  timeLeft = timerMinutes * 60;
  updateTimerDisplay();
}

function saveTasks() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

function sortTasks() {
  tasks.sort((a, b) => Number(a.completed) - Number(b.completed));
}

function renderTasks() {
  sortTasks();
  taskList.innerHTML = "";

  if (tasks.length === 0) {
    taskList.innerHTML = '<p class="empty-state">No tasks yet. Add your first task.</p>';
    taskCount.textContent = "0 pending";
    return;
  }

  const pendingCount = tasks.filter((task) => !task.completed).length;
  taskCount.textContent = `${pendingCount} pending`;

  tasks.forEach((task) => {
    const item = document.createElement("li");
    item.className = `task-item ${task.completed ? "completed" : ""}`;

    item.innerHTML = `
      <div class="task-left">
        <input type="checkbox" class="toggle-task" data-id="${task.id}" ${task.completed ? "checked" : ""} />
        <span class="task-text">${escapeHtml(task.text)}</span>
      </div>
      <div class="task-actions">
        <button class="small-btn edit-btn" data-id="${task.id}">Edit</button>
        <button class="small-btn delete-btn" data-id="${task.id}">Delete</button>
      </div>
    `;

    taskList.appendChild(item);
  });
}

function addTask(event) {
  event.preventDefault();

  const text = taskInput.value.trim();
  if (!text) return;

  const isDuplicate = tasks.some(
    (task) => task.text.toLowerCase() === text.toLowerCase()
  );

  if (isDuplicate) {
    alert("Task already exists. Please enter a different task.");
    return;
  }

  tasks.push({
    id: Date.now(),
    text,
    completed: false
  });

  saveTasks();
  renderTasks();
  taskInput.value = "";
}

function handleTaskAction(event) {
  const target = event.target;
  const id = Number(target.dataset.id);

  if (target.classList.contains("toggle-task")) {
    tasks = tasks.map((task) =>
      task.id === id ? { ...task, completed: target.checked } : task
    );
    saveTasks();
    renderTasks();
    return;
  }

  if (target.classList.contains("delete-btn")) {
    tasks = tasks.filter((task) => task.id !== id);
    saveTasks();
    renderTasks();
    return;
  }

  if (target.classList.contains("edit-btn")) {
    const selectedTask = tasks.find((task) => task.id === id);
    if (!selectedTask) return;

    const updatedText = prompt("Edit your task:", selectedTask.text);
    if (updatedText === null) return;

    const cleanText = updatedText.trim();
    if (!cleanText) return;

    const isDuplicate = tasks.some(
      (task) =>
        task.id !== id && task.text.toLowerCase() === cleanText.toLowerCase()
    );

    if (isDuplicate) {
      alert("Another task with the same name already exists.");
      return;
    }

    selectedTask.text = cleanText;
    saveTasks();
    renderTasks();
  }
}

function saveLinks() {
  localStorage.setItem("quickLinks", JSON.stringify(links));
}

function renderLinks() {
  linksList.innerHTML = "";

  if (links.length === 0) {
    linksList.innerHTML = '<p class="empty-state">No links yet. Add your favorite website.</p>';
    return;
  }

  links.forEach((link) => {
    const wrapper = document.createElement("div");
    wrapper.className = "link-item";

    wrapper.innerHTML = `
      <a class="link-anchor" href="${escapeAttribute(link.url)}" target="_blank" rel="noopener noreferrer">
        ${escapeHtml(link.name)}
      </a>
      <button class="remove-link" data-id="${link.id}" title="Remove link">×</button>
    `;

    linksList.appendChild(wrapper);
  });
}

function addLink(event) {
  event.preventDefault();

  const name = linkName.value.trim();
  let url = linkUrl.value.trim();

  if (!name || !url) return;

  if (!/^https?:\/\//i.test(url)) {
    url = `https://${url}`;
  }

  links.push({
    id: Date.now(),
    name,
    url
  });

  saveLinks();
  renderLinks();

  linkName.value = "";
  linkUrl.value = "";
}

function handleLinkAction(event) {
  const target = event.target;
  const id = Number(target.dataset.id);

  if (target.classList.contains("remove-link")) {
    links = links.filter((link) => link.id !== id);
    saveLinks();
    renderLinks();
  }
}

function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

function escapeAttribute(text) {
  return String(text).replace(/"/g, "&quot;");
}

function init() {
  applyTheme(savedTheme);
  updateClock();
  setInterval(updateClock, 1000);

  updateTimerDisplay();
  renderTasks();
  renderLinks();

  nameForm.addEventListener("submit", saveName);
  themeToggle.addEventListener("click", toggleTheme);

  startTimerBtn.addEventListener("click", startTimer);
  stopTimerBtn.addEventListener("click", stopTimer);
  resetTimerBtn.addEventListener("click", resetTimer);

  taskForm.addEventListener("submit", addTask);
  taskList.addEventListener("click", handleTaskAction);
  taskList.addEventListener("change", handleTaskAction);

  linkForm.addEventListener("submit", addLink);
  linksList.addEventListener("click", handleLinkAction);
}

init();