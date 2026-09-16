const habitForm = document.getElementById("habitForm");
const habitInput = document.getElementById("habitInput");
const priorityInput = document.getElementById("priorityInput");
const habitsList = document.getElementById("habitsList");
const themeButton = document.getElementById("themeButton");

const totalHabits = document.getElementById("totalHabits");
const completedHabits = document.getElementById("completedHabits");
const progressText = document.getElementById("progressText");
const progressFill = document.getElementById("progressFill");
const progressMessage = document.getElementById("progressMessage");
const streakValue = document.getElementById("streakValue");
const habitCount = document.getElementById("habitCount");

let habits = JSON.parse(localStorage.getItem("novahabit-habits")) || [];
let activeFilter = "all";

function saveHabits() {
  localStorage.setItem("novahabit-habits", JSON.stringify(habits));
}

function calculateProgress() {
  if (habits.length === 0) return 0;

  const completed = habits.filter(habit => habit.completed).length;
  return Math.round((completed / habits.length) * 100);
}

function updateDashboard() {
  const completed = habits.filter(habit => habit.completed).length;
  const progress = calculateProgress();

  totalHabits.textContent = habits.length;
  completedHabits.textContent = completed;
  progressText.textContent = `${progress}%`;
  progressFill.style.width = `${progress}%`;
  habitCount.textContent = `${habits.length} habit${habits.length === 1 ? "" : "s"}`;

  if (habits.length === 0) {
    progressMessage.textContent = "Add your first habit to begin.";
  } else if (progress === 100) {
    progressMessage.textContent = "Amazing! You completed every habit today.";
  } else if (progress >= 50) {
    progressMessage.textContent = "Great progress. Keep going!";
  } else {
    progressMessage.textContent = "Small steps create big changes.";
  }

  streakValue.textContent = `${completed} day${completed === 1 ? "" : "s"}`;
}

function renderHabits() {
  habitsList.innerHTML = "";

  let filteredHabits = habits;

  if (activeFilter === "active") {
    filteredHabits = habits.filter(habit => !habit.completed);
  }

  if (activeFilter === "completed") {
    filteredHabits = habits.filter(habit => habit.completed);
  }

  if (filteredHabits.length === 0) {
    habitsList.innerHTML = `
      <div class="empty-state">
        No habits found here. Add a habit or change the filter.
      </div>
    `;
    updateDashboard();
    return;
  }

  filteredHabits.forEach(habit => {
    const habitElement = document.createElement("div");
    habitElement.className = "habit-item";

    habitElement.innerHTML = `
      <input
        class="habit-check"
        type="checkbox"
        ${habit.completed ? "checked" : ""}
        aria-label="Mark ${habit.name} as completed"
      >

      <div class="habit-content">
        <div class="habit-name ${habit.completed ? "completed" : ""}">
          ${escapeHTML(habit.name)}
        </div>

        <div class="habit-meta">
          <span>Daily habit</span>
          <span class="priority">${habit.priority}</span>
        </div>
      </div>

      <button class="delete-button" aria-label="Delete habit">×</button>
    `;

    const checkbox = habitElement.querySelector(".habit-check");
    const deleteButton = habitElement.querySelector(".delete-button");

    checkbox.addEventListener("change", () => {
      habit.completed = checkbox.checked;
      saveHabits();
      renderHabits();
    });

    deleteButton.addEventListener("click", () => {
      habits = habits.filter(item => item.id !== habit.id);
      saveHabits();
      renderHabits();
    });

    habitsList.appendChild(habitElement);
  });

  updateDashboard();
}

function escapeHTML(text) {
  return text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

habitForm.addEventListener("submit", event => {
  event.preventDefault();

  const name = habitInput.value.trim();

  if (!name) return;

  habits.push({
    id: Date.now(),
    name,
    priority: priorityInput.value,
    completed: false
  });

  saveHabits();
  habitInput.value = "";
  priorityInput.value = "Medium";
  renderHabits();
});

document.querySelectorAll(".filter-button").forEach(button => {
  button.addEventListener("click", () => {
    document.querySelectorAll(".filter-button").forEach(item => {
      item.classList.remove("active");
    });

    button.classList.add("active");
    activeFilter = button.dataset.filter;
    renderHabits();
  });
});

themeButton.addEventListener("click", () => {
  document.body.classList.toggle("light-mode");

  const isLight = document.body.classList.contains("light-mode");
  themeButton.textContent = isLight ? "🌙" : "☀️";

  localStorage.setItem("novahabit-theme", isLight ? "light" : "dark");
});

if (localStorage.getItem("novahabit-theme") === "light") {
  document.body.classList.add("light-mode");
  themeButton.textContent = "🌙";
}

renderHabits();