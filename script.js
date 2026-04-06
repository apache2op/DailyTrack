const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

let currentMonth = new Date().getMonth();
let currentYear = new Date().getFullYear();

let habits = JSON.parse(localStorage.getItem("habits")) || [];



habits = habits.map((h) => ({
  name: h.name,
  color: h.color,
  data: h.data || {},
  logs: h.logs || {}, // ✅ ensure logs exists
}));

const monthSelect = document.getElementById("monthSelect");

/* ✅ MONTH SHORT NAME */
months.forEach((m, i) => {
  const opt = document.createElement("option");
  opt.value = i;
  opt.innerText = m.slice(0, 3);
  if (i === currentMonth) opt.selected = true;
  monthSelect.appendChild(opt);
});

monthSelect.addEventListener("change", () => {
  currentMonth = parseInt(monthSelect.value);
  render();
});

/* ✅ YEAR SELECT */
const yearSelect = document.getElementById("yearSelect");

for (let y = 2020; y <= 2035; y++) {
  const opt = document.createElement("option");
  opt.value = y;
  opt.innerText = y;
  if (y === currentYear) opt.selected = true;
  yearSelect.appendChild(opt);
}

yearSelect.addEventListener("change", () => {
  currentYear = parseInt(yearSelect.value);
  render();
});

/* ✅ DAYS */
function getDaysInMonth(month) {
  return new Date(currentYear, month + 1, 0).getDate();
}

function save() {
  localStorage.setItem("habits", JSON.stringify(habits));
}

/* ✅ ADD HABIT */
function addHabit() {
  const input = document.getElementById("habitName");
  const name = input.value.trim();
  const color = document.getElementById("habitColor").value;

  if (!name) return;

  habits.push({
    name,
    color,
    data: {},
    logs: {}, // ✅ important
  });

  input.value = "";
  render();
  save();
}

/* ✅ TOGGLE DAY */
function toggleDay(h, d) {
  const key = `${currentYear}-${currentMonth}`;
  const daysInMonth = getDaysInMonth(currentMonth);

  if (!habits[h].data[key]) {
    habits[h].data[key] = Array(daysInMonth).fill(false);
  }

  if (!habits[h].logs[key]) {
    habits[h].logs[key] = Array(daysInMonth).fill(false);
  }

  habits[h].data[key][d] = !habits[h].data[key][d];

  render();
  save();
}

/* ✅ COLOR */
function isDarkColor(color) {
  const r = parseInt(color.substr(1, 2), 16);
  const g = parseInt(color.substr(3, 2), 16);
  const b = parseInt(color.substr(5, 2), 16);
  return (r * 299 + g * 587 + b * 114) / 1000 < 128;
}

/* ✅ RENDER */
function render() {
  const tracker = document.getElementById("tracker");
  tracker.innerHTML = "";

  const emptyState = document.getElementById("emptyState");

  const daysInMonth = getDaysInMonth(currentMonth);
  const key = `${currentYear}-${currentMonth}`;

  habits.forEach((habit, hIndex) => {
    // ✅ ensure arrays exist
    if (!habit.data[key]) {
      habit.data[key] = Array(daysInMonth).fill(false);
    }

    if (!habit.logs[key]) {
      habit.logs[key] = Array(daysInMonth).fill(false);
    }

    const days = habit.data[key];
    const logs = habit.logs[key];

    const title = document.createElement("div");
    title.className = "habit-title";
    title.innerText = habit.name;
    title.onclick = () => openHabitDetail(hIndex);

    const grid = document.createElement("div");
    grid.className = "habit-grid";

    for (let i = 0; i < daysInMonth; i++) {
      const box = document.createElement("div");

      const tooltip = document.getElementById("noteTooltip");
      const logText = logs[i];

      function showTooltip(x, y) {
  tooltip.innerText = logText && logText.trim() !== ""
    ? logText
    : "No notes made";

  tooltip.style.left = x + 10 + "px";
  tooltip.style.top = y + 10 + "px";
  tooltip.style.opacity = "1";
  tooltip.style.transform = "scale(1)";
}

      function hideTooltip() {
        tooltip.style.opacity = "0";
        tooltip.style.transform = "scale(0.95)";
      }

      box.className = "day-box";

      const num = document.createElement("div");
      num.className = "day-number";
      num.innerText = i + 1;

      const dayName = document.createElement("div");
      dayName.className = "day-name-grid";

      const date = new Date(currentYear, currentMonth, i + 1);
      dayName.innerText = date.toLocaleDateString("en-US", {
        weekday: "short",
      });

      // ✅ DOT FIX (clean & reliable)
      if (logs[i]) {
        const dot = document.createElement("div");
        dot.className = "note-dot";
        box.appendChild(dot);
      }

      num.style.color = "#111";
      dayName.style.color = "#111";

      if (days[i]) {
        box.style.background = habit.color;

        const textColor = isDarkColor(habit.color) ? "#fff" : "#111";

        num.style.color = textColor;
        dayName.style.color = textColor;

        const dot = box.querySelector(".note-dot");
        if (dot) dot.style.backgroundColor = textColor;
      }

      box.addEventListener("mousemove", (e) => {
        showTooltip(e.clientX, e.clientY);
      });

      box.addEventListener("mouseleave", hideTooltip);

      let pressTimer; // keep global in script.js

box.addEventListener("touchstart", (e) => {
  clearTimeout(pressTimer);
  pressTimer = setTimeout(() => {
    const touch = e.touches[0];
    showTooltip(touch.clientX, touch.clientY);
  }, 500); // long press
});

box.addEventListener("touchend", () => {
  clearTimeout(pressTimer); 
  // DO NOT hide tooltip here — let it stay until tapping outside
});

box.addEventListener("touchmove", () => {
  clearTimeout(pressTimer); 
  hideTooltip(); // hide if user scrolls/moves finger
});

// ✅ Hide tooltip when tapping anywhere outside a day box
document.addEventListener("touchstart", (e) => {
  if (!e.target.classList.contains("day-box")) {
    hideTooltip();
  }
});

      box.onclick = () => toggleDay(hIndex, i);

      box.appendChild(num);
      box.appendChild(dayName);
      grid.appendChild(box);
    }

    tracker.appendChild(title);
    tracker.appendChild(grid);
  });

  renderList();

  emptyState.innerHTML =
    habits.length === 0
      ? `<div class="empty-box">
        <h3>No habits yet 👀</h3>
        <p>Try adding one to get started.</p>
      </div>`
      : "";
}

/* ✅ LIST */
function renderList() {
  const list = document.getElementById("habitList");
  list.innerHTML = "";

  const daysInMonth = getDaysInMonth(currentMonth);
  const key = `${currentYear}-${currentMonth}`;

  habits.forEach((h, i) => {
    const days = h.data[key] || Array(daysInMonth).fill(false);

    const progress = Math.round(
      (days.filter((d) => d).length / days.length) * 100,
    );

    const div = document.createElement("div");
    div.className = "habit-card";

    div.innerHTML = `
      <div class="delete-x" onclick="deleteHabit(${i})">×</div>
      <strong>${h.name}</strong>
      <div class="progress-text">${progress}%</div>
      <div class="progress-bar">
        <div class="progress-fill" style="width:${progress}%;background:${h.color}"></div>
      </div>
    `;

    list.appendChild(div);
  });
}

/* ✅ DELETE */
function deleteHabit(i) {
  habits.splice(i, 1);
  render();
  save();
}

/* ✅ THEME */
function toggleTheme() {
  const body = document.body;

  body.classList.toggle("dark");

  const isDark = body.classList.contains("dark");
  const emoji = isDark ? "🌙" : "☀️";

  document.querySelectorAll("#themeBtn, #themeBtnDetail").forEach((btn) => {
    btn.innerText = emoji;
  });

  localStorage.setItem("theme", isDark ? "dark" : "light");
}

/* ✅ INIT */
document.getElementById("addBtn").addEventListener("click", addHabit);

render();

// ✅ EXPORT CSV FUNCTION
function downloadCSV() {
  if (!habits || habits.length === 0) {
    alert("No habits to export!");
    return;
  }

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

  // Header row
  const headers = ["Year", "Month", "Habit Name"];
  for (let i = 1; i <= daysInMonth; i++) headers.push(`Day ${i}`);

  const rows = [headers];

  habits.forEach(habit => {
    const key = `${currentYear}-${currentMonth}`;
    const dayData = habit.data[key] || Array(daysInMonth).fill(false);
    const dayValues = dayData.map(d => (d ? "1" : "0")); // 1 for true, 0 for false
    rows.push([currentYear, months[currentMonth], habit.name, ...dayValues]);
  });

  const csvContent = rows.map(row => row.join(",")).join("\n");

  const blob = new Blob([csvContent], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `habit_tracker_${months[currentMonth]}_${currentYear}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// ✅ Make it global for inline onclick
window.downloadCSV = downloadCSV;

// ✅ Color preview circle update
const colorInput = document.getElementById("habitColor");
const colorCircle = document.getElementById("colorCircle");

colorInput.addEventListener("input", () => {
  colorCircle.style.backgroundColor = colorInput.value;
});

const savedTheme = localStorage.getItem("theme");

document.querySelectorAll("#themeBtn, #themeBtnDetail").forEach((btn) => {
  btn.innerText = savedTheme === "light" ? "☀️" : "🌙";
});

if (savedTheme === "light") {
  document.body.classList.remove("dark");
} else {
  document.body.classList.add("dark");
}
