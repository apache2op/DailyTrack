let currentHabitIndex = null;

// 🔥 Auto resize
function autoResize(el) {
  el.style.height = "auto";
  el.style.height = el.scrollHeight + "px";
}

// 🔥 Preview (20 chars)
function getPreview(text) {
  if (!text) return "";
  return text.length > 20 ? text.slice(0, 20) + "..." : text;
}

// 🔥 Day name helper
function getDayName(dayIndex) {
  const year = new Date().getFullYear();
  const date = new Date(year, currentMonth, dayIndex + 1);
  return date.toLocaleDateString("en-US", { weekday: "short" }); // Mon, Tue
}

function openHabitDetail(index) {
  currentHabitIndex = index;

  document.querySelector(".container").style.display = "none";
  document.getElementById("detailView").style.display = "block";

  renderDetail();
}

function goBack() {
  document.getElementById("detailView").style.display = "none";
  document.querySelector(".container").style.display = "block";

  render(); // 🔥 re-render main grid
}

function renderDetail() {
  const habit = habits[currentHabitIndex];
  const title = document.getElementById("detailTitle");
  const container = document.getElementById("detailDays");

  title.innerText = habit.name;
  container.innerHTML = "";

  const daysInMonth = getDaysInMonth(currentMonth);

  if (!habit.logs) habit.logs = {};
  const key = `${currentYear}-${currentMonth}`;

if (!habit.logs[key]) {
  habit.logs[key] = Array(daysInMonth).fill("");
}
  for (let i = 0; i < daysInMonth; i++) {

    const dayDiv = document.createElement("div");
    dayDiv.className = "day-log";

    // 🔥 HEADER (Day X + Day Name)
    const header = document.createElement("div");
    header.className = "day-header";

    const label = document.createElement("div");
    label.className = "day-label";
    label.innerText = `Day ${i + 1}`;

    const dayName = document.createElement("div");
    dayName.className = "day-name";
    dayName.innerText = getDayName(i);

    header.appendChild(label);
    header.appendChild(dayName);

    const textarea = document.createElement("textarea");
    textarea.maxLength = 500;
    textarea.className = "day-textarea";

    const fullText = habit.logs[key][i] || "";

    textarea.value = getPreview(fullText);

    const counter = document.createElement("div");
    counter.className = "char-counter";

    function updateCounter() {
      counter.innerText = `${textarea.value.length} / 500`;
    }

    // 🔥 FOCUS → expand
    textarea.addEventListener("focus", () => {
      textarea.value = habit.logs[key][i] || "";
      textarea.style.minHeight = "80px";
      updateCounter();
      autoResize(textarea);
    });

    // 🔥 BLUR → shrink back
    textarea.addEventListener("blur", () => {
      textarea.value = getPreview(habit.logs[key][i]);
      textarea.style.height = "auto";
      textarea.style.minHeight = "50px";
    });

    textarea.addEventListener("input", () => {
      habit.logs[key][i] = textarea.value;
      updateCounter();
      autoResize(textarea);
      save();
    });

    updateCounter();
    autoResize(textarea);

    dayDiv.appendChild(header);
    dayDiv.appendChild(textarea);
    dayDiv.appendChild(counter);

    container.appendChild(dayDiv);
  }
}