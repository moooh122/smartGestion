

const fields = [
  ['hourlyIncome', 'Hourly Income (DA)', 'Revenu horaire (DA)', 'الدخل بالساعة (دج)'],
  ['appCommission', 'App Commission (%)', 'Commission de l\'application (%)', 'نسبة العمولة (%)'],
  ['hoursWorked', 'Hours Worked per Week', 'Heures travaillées / semaine', 'ساعات العمل في الأسبوع'],
  ['weeksWorked', 'Weeks Worked per Year', 'Semaines travaillées / an', 'أسابيع العمل في السنة'],
  ['investment', 'Initial Investment (DA)', 'Investissement initial (DA)', 'رأس المال (دج)'],
  ['wheelChangeCost', 'Wheel Change Cost (DA)', 'Coût changement pneus (DA)', 'تكلفة تغيير العجلات'],
  ['kmPerHour', 'KM Driven per Hour', 'KM parcourus par heure', 'كم لكل ساعة'],
  ['fuelPrice', 'Fuel Price (DA/L)', 'Prix carburant (DA/L)', 'سعر الوقود (دج/لتر)'],
  ['fuelConsumption', 'Fuel Consumption (L/100km)', 'Consommation (L/100km)', 'استهلاك الوقود (لتر/100كم)'],
  ['maintenanceCost', 'Maintenance Cost (DA)', 'Coût maintenance (DA)', 'تكاليف الصيانة'],
  ['maintenanceKmInterval', 'Maintenance Every (KM)', 'Maintenance tous les (KM)', 'كل (كم) صيانة'],
  ['taxCost', 'Annual Taxes (DA)', 'Taxes annuelles (DA)', 'الضرائب السنوية'],
  ['insuranceCost', 'Annual Insurance (DA)', 'Assurance annuelle (DA)', 'تأمين سنوي'],
  ['phoneFees', 'Monthly Phone Fees', 'Frais téléphone mensuels', 'تكاليف الهاتف'],
  ['parkingFees', 'Monthly Parking Fees', 'Frais stationnement', 'تكاليف الركن'],
  ['carWashFees', 'Monthly Car Wash Fees', 'Frais lavage voiture', 'غسل السيارة']
];

let currentLang = 'en';

function setLanguage(lang) {
  currentLang = lang;
  document.documentElement.lang = lang;
  document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
  document.getElementById('title').innerText = {
    en: 'VTC Income & Profitability Calculator',
    fr: 'Calculateur de Rentabilité VTC',
    ar: 'حاسبة الدخل والربحية لسائق VTC'
  }[lang];
  document.getElementById('calculateBtn').innerText = {
    en: 'Calculate', fr: 'Calculer', ar: 'احسب'
  }[lang];
  document.getElementById('summaryTitle').innerText = {
    en: 'Summary Table', fr: 'Tableau récapitulatif', ar: 'الملخص'
  }[lang];
  renderInputs();
}

function renderInputs() {
  const container = document.getElementById('inputs');
  container.innerHTML = '';
  fields.forEach(([id, en, fr, ar]) => {
    const label = document.createElement('label');
    label.htmlFor = id;
    label.innerText = { en, fr, ar }[currentLang];

    const input = document.createElement('input');
    input.type = 'number';
    input.id = id;
    input.min = 0;
    input.step = '0.01';
    input.value = localStorage.getItem(id) || '';
    input.oninput = () => localStorage.setItem(id, input.value);

    container.appendChild(label);
    container.appendChild(input);
  });
}

function val(id) {
  return parseFloat(document.getElementById(id)?.value) || 0;
}

function calculateIncome() {
  const hours = val("hoursWorked"), weeks = val("weeksWorked") || 46, totalHours = hours * weeks;
  const grossHourly = val("hourlyIncome") * (1 - val("appCommission") / 100);
  const grossYearly = grossHourly * totalHours;
  const kmPerHour = val("kmPerHour");
  const wheelHourly = (val("wheelChangeCost") / 50000) * kmPerHour;
  const fuelHourly = ((val("fuelConsumption") / 100) * kmPerHour) * val("fuelPrice");
  const maintenanceHourly = (val("maintenanceCost") / val("maintenanceKmInterval")) * kmPerHour;
  const taxInsuranceHourly = (val("taxCost") + val("insuranceCost")) / totalHours;
  const monthlyFixedFees = val("phoneFees") + val("parkingFees") + val("carWashFees");
  const fixedFeesYearly = monthlyFixedFees * 12;
  const fixedFeesHourly = fixedFeesYearly / totalHours;
  const totalCostsHourly = wheelHourly + fuelHourly + maintenanceHourly + taxInsuranceHourly + fixedFeesHourly;
  const netHourly = grossHourly - totalCostsHourly;
  const netYearly = netHourly * totalHours;
  const profitability = (netYearly / val("investment")) * 100;

  const rows = [
    ["Gross Income", grossHourly, grossYearly],
    ["Wheel Cost", wheelHourly, wheelHourly * totalHours],
    ["Fuel Cost", fuelHourly, fuelHourly * totalHours],
    ["Maintenance", maintenanceHourly, maintenanceHourly * totalHours],
    ["Tax + Insurance", taxInsuranceHourly, taxInsuranceHourly * totalHours],
    ["Fixed Fees", fixedFeesHourly, fixedFeesYearly],
    ["Net Profit", netHourly, netYearly],
    ["Profitability", profitability.toFixed(2) + "%", ""]
  ];

  document.getElementById("resultBody").innerHTML = rows.map(row =>
    `<tr><td>${row[0]}</td><td>${typeof row[1] === 'number' ? row[1].toFixed(2) : row[1]}</td><td>${typeof row[2] === 'number' ? row[2].toFixed(2) : row[2]}</td></tr>`
  ).join("");

  document.getElementById("resultBox").style.display = "block";
}

function exportToPDF() {
  const resultBox = document.querySelector(".result");
  if (!resultBox || resultBox.style.display === "none") return alert("Calculate first");
  html2pdf().from(resultBox).set({
    filename: 'vtc-income-report.pdf',
    margin: 0.5,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2 },
    jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
  }).save();
}

function exportToExcel() {
  const table = document.querySelector(".result table");
  const wb = XLSX.utils.table_to_book(table, { sheet: "Report" });
  XLSX.writeFile(wb, "vtc-income-report.xlsx");
}

setLanguage('en');