const months = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December"
];

let currentMonth = new Date().getMonth();

let habits = JSON.parse(localStorage.getItem("habits")) || [];

habits = habits.map(h => ({
  name: h.name,
  color: h.color,
  data: h.data || {}
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

function getDaysInMonth(month) {
  const year = new Date().getFullYear();
  return new Date(year, month + 1, 0).getDate();
}

function save() {
  localStorage.setItem("habits", JSON.stringify(habits));
}

/* ✅ ADD HABIT + CLEAR INPUT */
function addHabit() {
  const input = document.getElementById("habitName");
  const name = input.value.trim();
  const color = document.getElementById("habitColor").value;

  if (!name) return;

  habits.push({
    name,
    color,
    data: {}
  });

  input.value = "";

  render();
  save();
}

function toggleDay(h, d) {
  const daysInMonth = getDaysInMonth(currentMonth);

  if (!habits[h].data[currentMonth]) {
    habits[h].data[currentMonth] = Array(daysInMonth).fill(false);
  }

  habits[h].data[currentMonth][d] =
    !habits[h].data[currentMonth][d];

  render();
  save();
}

/* ✅ COLOR DETECTION */
function isDarkColor(color) {
  const r = parseInt(color.substr(1, 2), 16);
  const g = parseInt(color.substr(3, 2), 16);
  const b = parseInt(color.substr(5, 2), 16);
  return (r*299 + g*587 + b*114)/1000 < 128;
}

function render() {
  const tracker = document.getElementById("tracker");
  tracker.innerHTML = "";

  const daysInMonth = getDaysInMonth(currentMonth);

  habits.forEach((habit, hIndex) => {

    if (!habit.data[currentMonth]) {
      habit.data[currentMonth] = Array(daysInMonth).fill(false);
    }

    const days = habit.data[currentMonth];

    const title = document.createElement("div");
    title.className = "habit-title";
    title.innerText = habit.name;

    const grid = document.createElement("div");
    grid.className = "habit-grid";

    for (let i = 0; i < daysInMonth; i++) {
      const box = document.createElement("div");
      box.className = "day-box";

      const num = document.createElement("div");
      num.className = "day-number";
      num.innerText = i + 1;

      /* ✅ DEFAULT TEXT COLOR */
      num.style.color = "#111111";

      if (days[i]) {
        box.style.background = habit.color;

        const isDark = isDarkColor(habit.color);

        /* ✅ AUTO CONTRAST (MAIN FIX) */
        num.style.color = isDark ? "#ffffff" : "#111111";
      }

      box.onclick = () => toggleDay(hIndex, i);

      box.appendChild(num);
      grid.appendChild(box);
    }

    tracker.appendChild(title);
    tracker.appendChild(grid);
  });

  renderList();
}


function renderList() {
  const list = document.getElementById("habitList");
  list.innerHTML = "";

  const daysInMonth = getDaysInMonth(currentMonth);

  habits.forEach((h, i) => {
    const days = h.data[currentMonth] || Array(daysInMonth).fill(false);

    const progress = Math.round(days.filter(d => d).length / days.length * 100);

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

function deleteHabit(i) {
  habits.splice(i, 1);
  render();
  save();
}

function toggleTheme() {
  document.body.classList.toggle("dark");
}

function downloadCSV() {
  const daysInMonth = getDaysInMonth(currentMonth);

  let csv = "Month,Habit,";

  for (let i = 1; i <= daysInMonth; i++) {
    csv += `Day ${i},`;
  }

  csv += "\n";

  habits.forEach(h => {
    const days = h.data[currentMonth] || Array(daysInMonth).fill(false);

    csv += `${months[currentMonth]},${h.name},`;
    csv += days.map(d => d ? "1" : "0").join(",");
    csv += "\n";
  });

  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = `${months[currentMonth]}-habits.csv`;
  a.click();

  URL.revokeObjectURL(url);
}

document.getElementById("addBtn").addEventListener("click", addHabit);

const colorInput = document.getElementById("habitColor");
const colorCircle = document.getElementById("colorCircle");

/* ✅ UPDATE PREVIEW ON CHANGE */
colorInput.addEventListener("input", () => {
  colorCircle.style.background = colorInput.value;
});

/* ✅ SET DEFAULT COLOR ON LOAD */
colorCircle.style.background = colorInput.value;

render();