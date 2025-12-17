let sugars = JSON.parse(localStorage.getItem("sugars"))||[];
let insulins = JSON.parse(localStorage.getItem("insulins"))||[];
let chart;

/* DOM */
const sugarTableBody=document.getElementById("sugarTableBody");
const insulinTableBody=document.getElementById("insulinTableBody");
const average=document.getElementById("average");
const ctx=document.getElementById("chart");

/* Date / Time */
function nowDate(){return new Date().toLocaleDateString("fa-IR")}
function nowTime(){return new Date().toLocaleTimeString("fa-IR",{hour:"2-digit",minute:"2-digit"})}

/* Modal */
function openModal(id){
  const m = document.getElementById(id);
  m.style.display = "flex";  // اضافه کردن این خط
  m.classList.remove("hide");
  m.classList.add("show");
}

function closeModal(){
  document.querySelectorAll(".modal").forEach(m=>{
    m.classList.add("hide");
    setTimeout(()=>{m.classList.remove("show","hide"); m.style.display="none";},200);
  });
}

/* Add Sugar */
function addSugarModal(){
  const v=+document.getElementById("sugarModalInput").value;
  if(!v) return;
  const time=document.getElementById("timeModal").value;
  const note=document.getElementById("noteSugarModal").value;
  sugars.push({date:nowDate(),hour:nowTime(),time,value:v,note});
  localStorage.setItem("sugars",JSON.stringify(sugars));
  document.getElementById("sugarModalInput").value="";
  document.getElementById("noteSugarModal").value="";
  closeModal();
  render();
}

/* Add Insulin */
function addInsulinModal(){
  const type=document.getElementById("insulinTypeModal").value;
  const time=document.getElementById("insulinTimeModal").value;
  const units=+document.getElementById("unitsModal").value;
  const note=document.getElementById("noteInsulinModal").value;
  if(!units) return;
  insulins.push({date:nowDate(),hour:nowTime(),type,time,units,note});
  localStorage.setItem("insulins",JSON.stringify(insulins));
  document.getElementById("unitsModal").value="";
  document.getElementById("noteInsulinModal").value="";
  closeModal();
  render();
}

/* Average Sugar */
function avg(){ if(!sugars.length) return "---"; return Math.round(sugars.reduce((a,b)=>a+b.value,0)/sugars.length); }

/* Sugar Color */
function sugarColor(v){
  if(v<140) return "#4ade80";
  if(v<180) return "#facc15";
  return "#fb7185";
}

/* Render Tables */
function renderTables(){
  sugarTableBody.innerHTML="";
  sugars.forEach(s=>{
    sugarTableBody.innerHTML+=`<tr>
      <td>${s.date}</td><td>${s.hour}</td><td>${s.time}</td>
      <td style="color:${sugarColor(s.value)}; font-weight:700">${s.value}</td>
      <td>${s.note||"-"}</td>
    </tr>`;
  });
  insulinTableBody.innerHTML="";
  insulins.forEach(i=>{
    insulinTableBody.innerHTML+=`<tr>
      <td>${i.date}</td><td>${i.hour}</td><td>${i.type}</td><td>${i.time}</td>
      <td>${i.units}</td><td>${i.note||"-"}</td>
    </tr>`;
  });
}

/* Draw Chart */
function drawChart(){
  if(chart) chart.destroy();
  chart=new Chart(ctx,{
    type:"line",
    data:{
      labels:sugars.map((_,i)=>i+1),
      datasets:[{
        data:sugars.map(s=>s.value),
        borderColor:"#38bdf8",
        tension:0.4,
        pointRadius:5,
        pointHoverRadius:7,
        pointBackgroundColor:sugars.map(s=>sugarColor(s.value)),
        pointBorderColor:"#020617",
        pointBorderWidth:2
      }]
    },
    options:{
      plugins:{legend:{display:false}},
      scales:{y:{min:40,max:300,grid:{color:"rgba(255,255,255,0.05)"}}}
    }
  });
}

/* Render All */
function render(){
  average.innerText=avg();
  renderTables();
  drawChart();
}
function exportPDF(){
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ orientation:"portrait", unit:"mm", format:"a4" });
  
  // عنوان
  doc.setFontSize(16);
  doc.text("گزارش دیابت", 105, 15, {align:"center"});
  
  // میانگین قند
  doc.setFontSize(12);
  doc.text(`میانگین قند: ${avg()}`, 10, 25);

  let y = 35;

  // جدول قند
  doc.setFontSize(10);
  doc.text("سوابق قند:", 10, y);
  y += 6;
  sugars.forEach((s,i)=>{
    let color = sugarColor(s.value);
    doc.setTextColor(color.replace("#","0x"));
    doc.text(`${i+1}) ${s.date} | ${s.hour} | ${s.time} | قند: ${s.value} | ${s.note||"-"}`, 10, y);
    y += 6;
    if(y>280){ doc.addPage(); y=20; }
  });

  y += 6;
  doc.setTextColor(0,0,0);
  doc.text("سوابق انسولین:", 10, y);
  y += 6;
  insulins.forEach((i,j)=>{
    doc.text(`${j+1}) ${i.date} | ${i.hour} | ${i.type} | ${i.time} | ${i.units}u | ${i.note||"-"}`, 10, y);
    y += 6;
    if(y>280){ doc.addPage(); y=20; }
  });

  doc.save("diabetes-report.pdf");
}


render();
