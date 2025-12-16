let sugars = JSON.parse(localStorage.getItem("sugars")) || [];
let insulins = JSON.parse(localStorage.getItem("insulins")) || [];
let editSugarIndex = null;
const ctx = document.getElementById("chart");
let chart;

const sugarInput = document.getElementById("sugar");
const timeSelect = document.getElementById("time");
const noteSugar = document.getElementById("noteSugar");
const sugarTableBody = document.getElementById("sugarTableBody");

const insulinType = document.getElementById("insulinType");
const insulinTime = document.getElementById("insulinTime");
const unitsInput = document.getElementById("units");
const noteInsulin = document.getElementById("noteInsulin");
const insulinTableBody = document.getElementById("insulinTableBody");
const average = document.getElementById("average");

function getTimeNow() {
  return new Date().toLocaleTimeString("fa-IR", { hour: "2-digit", minute: "2-digit" });
}

function addSugar() {
  const value = +sugarInput.value;
  const time = timeSelect.value;
  const note = noteSugar.value;
  if (!value) return;
  const item = { date: new Date().toLocaleDateString("fa-IR"), hour: getTimeNow(), time, value, note };
  if (editSugarIndex !== null) {
    sugars[editSugarIndex] = item;
    editSugarIndex = null;
  } else {
    sugars.push(item);
  }
  localStorage.setItem("sugars", JSON.stringify(sugars));
  clearSugarInputs();
  render();
}

function addInsulin() {
  const units = +unitsInput.value;
  if (!units) return;
  insulins.push({ date: new Date().toLocaleDateString("fa-IR"), hour: getTimeNow(), type: insulinType.value, time: insulinTime.value, units, note: noteInsulin.value });
  localStorage.setItem("insulins", JSON.stringify(insulins));
  clearInsulinInputs();
  render();
}

function editSugar(i) {
  const s = sugars[i];
  sugarInput.value = s.value;
  timeSelect.value = s.time;
  noteSugar.value = s.note;
  editSugarIndex = i;
}

function deleteSugar(i) {
  if (!confirm("حذف شود؟")) return;
  sugars.splice(i, 1);
  localStorage.setItem("sugars", JSON.stringify(sugars));
  render();
}

function averageSugar() {
  if (!sugars.length) return "---";
  return Math.round(sugars.reduce((a, b) => a + b.value, 0) / sugars.length);
}

function sugarClass(v) {
  if (v < 140) return "green";
  if (v < 180) return "yellow";
  return "red";
}

function renderSugarTable() {
  sugarTableBody.innerHTML = "";
  sugars.forEach((s, i) => {
    sugarTableBody.innerHTML += `<tr>
      <td>${s.date}</td>
      <td>${s.hour}</td>
      <td>${s.time}</td>
      <td class="badge ${sugarClass(s.value)}">${s.value}</td>
      <td>${s.note || "-"}</td>
      <td class="actions">
        <button onclick="editSugar(${i})">✏️</button>
        <button class="danger" onclick="deleteSugar(${i})">🗑️</button>
      </td>
    </tr>`;
  });
}

function renderInsulinTable() {
  insulinTableBody.innerHTML = "";
  insulins.forEach(i => {
    insulinTableBody.innerHTML += `<tr>
      <td>${i.date}</td>
      <td>${i.hour}</td>
      <td>${i.type}</td>
      <td>${i.time}</td>
      <td>${i.units}u</td>
      <td>${i.note || "-"}</td>
    </tr>`;
  });
}

function drawChart() {
  if (chart) chart.destroy();
  const labels = sugars.map((_, i) => i + 1);
  const data = sugars.map(s => s.value);
  chart = new Chart(ctx, {
    type: "line",
    data: {
      labels,
      datasets: [
        { label: "قند خون", data, borderColor: "#38bdf8", tension: 0.3, fill: false },
        { label: "نرمال", data: labels.map(() => 140), borderColor: "#16a34a", borderDash: [5,5] },
        { label: "هشدار", data: labels.map(() => 180), borderColor: "#f59e0b", borderDash: [5,5] }
      ]
    },
    options: { plugins: { legend: { display: false } }, scales: { y: { min: 40, max: 300 } } }
  });
}

function exportPDF() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  doc.setFontSize(14);
  doc.text("گزارش قند خون", 105, 10, { align: "center" });
  doc.setFontSize(10);
  doc.text(`میانگین قند: ${averageSugar()}`, 10, 20);
  let y = 30;
  sugars.forEach((s, i) => { doc.text(`${i+1}) ${s.date} ${s.hour} | ${s.time} | قند: ${s.value} | ${s.note || "-"}`, 10, y); y += 8; if(y>280){ doc.addPage(); y=20; } });
  insulins.forEach((i,j) => { doc.text(`${j+1}) ${i.date} ${i.hour} | ${i.type} | ${i.time} | ${i.units}u | ${i.note || "-"}`, 10, y); y += 8; if(y>280){ doc.addPage(); y=20; } });
  doc.save("diabetes-report.pdf");
}

function render() {
  average.innerText = averageSugar();
  renderSugarTable();
  renderInsulinTable();
  drawChart();
}

function clearSugarInputs() { sugarInput.value=""; noteSugar.value=""; }
function clearInsulinInputs() { unitsInput.value=""; noteInsulin.value=""; }

render();
