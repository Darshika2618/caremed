const storageKey = "caremed-demo-data";

const starterData = {
  patients: [
    {
      id: "PT-1001",
      name: "Asha Mehta",
      age: 42,
      phone: "+91 98765 43210",
      department: "Endocrinology"
    },
    {
      id: "PT-1002",
      name: "Rohan Nair",
      age: 58,
      phone: "+91 91234 56789",
      department: "Cardiology"
    }
  ],
  prescriptions: [
    {
      id: "RX-2001",
      patientId: "PT-1001",
      medicine: "Metformin 500 mg",
      dose: "1 tablet",
      timing: "Morning after food",
      notes: "Monitor sugar level every week.",
      status: "Due today"
    },
    {
      id: "RX-2002",
      patientId: "PT-1002",
      medicine: "Atorvastatin 10 mg",
      dose: "1 tablet",
      timing: "Night after food",
      notes: "Avoid missing night dose.",
      status: "Taken"
    }
  ],
  appointments: [
    {
      id: "AP-3001",
      patientId: "PT-1001",
      date: "2026-05-20",
      time: "10:30",
      doctor: "Dr. Rao",
      reason: "Medicine review"
    }
  ]
};

function readData() {
  const saved = localStorage.getItem(storageKey);
  if (!saved) {
    localStorage.setItem(storageKey, JSON.stringify(starterData));
    return structuredClone(starterData);
  }
  return JSON.parse(saved);
}

function writeData(data) {
  localStorage.setItem(storageKey, JSON.stringify(data));
}

function getPatient(data, patientId) {
  return data.patients.find((patient) => patient.id === patientId);
}

function nextId(prefix, items) {
  const next = items.length + 1001;
  return `${prefix}-${next}`;
}

function renderDashboard() {
  const rows = document.querySelector("#dashboardRows");
  if (!rows) return;

  const data = readData();
  document.querySelector("#totalPatients").textContent = data.patients.length;
  document.querySelector("#totalPrescriptions").textContent = data.prescriptions.length;
  document.querySelector("#todayMeds").textContent = data.prescriptions.length;
  document.querySelector("#upcomingAppointments").textContent = data.appointments.length;

  rows.innerHTML = data.prescriptions.map((prescription) => {
    const patient = getPatient(data, prescription.patientId);
    return `
      <tr>
        <td>${patient ? patient.name : "Unknown patient"}</td>
        <td>${prescription.medicine}</td>
        <td>${prescription.timing}</td>
        <td><span class="pill ${prescription.status === "Taken" ? "done" : "warning"}">${prescription.status}</span></td>
      </tr>
    `;
  }).join("");

  const preview = document.querySelector("#patientPreview");
  preview.innerHTML = data.patients.slice(0, 3).map((patient) => {
    const medicines = data.prescriptions.filter((item) => item.patientId === patient.id);
    return `
      <div class="preview-item">
        <strong>${patient.name}</strong>
        <span>${patient.id} - ${medicines.length} active medicine item${medicines.length === 1 ? "" : "s"}</span>
      </div>
    `;
  }).join("");
}

function setupLoginTabs() {
  const tabs = document.querySelectorAll("[data-login-tab]");
  const email = document.querySelector("#loginEmail");
  const message = document.querySelector("#loginMessage");
  const form = document.querySelector("#loginForm");
  if (!tabs.length || !email || !form) return;

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      tabs.forEach((item) => item.classList.remove("active"));
      tab.classList.add("active");
      const type = tab.dataset.loginTab;
      email.value = type === "patient" ? "PT-1001" : "staff@cityhospital.com";
      message.textContent = type === "patient"
        ? "Patient demo login opens the medicine board."
        : "Staff demo login opens the hospital workflow.";
    });
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const active = document.querySelector("[data-login-tab].active").dataset.loginTab;
    window.location.href = active === "patient" ? "medicines.html" : "patients.html";
  });
}

function renderPatientOptions(selectId) {
  const select = document.querySelector(selectId);
  if (!select) return;

  const data = readData();
  select.innerHTML = data.patients.map((patient) => (
    `<option value="${patient.id}">${patient.name} (${patient.id})</option>`
  )).join("");
}

function renderPatients(filter = "") {
  const table = document.querySelector("#patientsTable");
  if (!table) return;

  const data = readData();
  const query = filter.trim().toLowerCase();
  const patients = data.patients.filter((patient) => (
    patient.name.toLowerCase().includes(query) ||
    patient.id.toLowerCase().includes(query) ||
    patient.department.toLowerCase().includes(query)
  ));

  table.innerHTML = patients.map((patient) => `
    <tr>
      <td>${patient.id}</td>
      <td>${patient.name}, ${patient.age}</td>
      <td>${patient.department}</td>
      <td>${patient.phone}</td>
    </tr>
  `).join("");
}

function setupPatientForm() {
  const form = document.querySelector("#patientForm");
  const search = document.querySelector("#patientSearch");
  if (!form) return;

  renderPatients();
  search.addEventListener("input", () => renderPatients(search.value));

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const data = readData();
    data.patients.push({
      id: nextId("PT", data.patients),
      name: document.querySelector("#patientName").value,
      age: Number(document.querySelector("#patientAge").value),
      phone: document.querySelector("#patientPhone").value,
      department: document.querySelector("#patientDepartment").value
    });
    writeData(data);
    form.reset();
    renderPatients();
  });
}

function renderPrescriptions() {
  const list = document.querySelector("#prescriptionList");
  if (!list) return;

  const data = readData();
  list.innerHTML = data.prescriptions.map((prescription) => {
    const patient = getPatient(data, prescription.patientId);
    return `
      <article class="record">
        <strong>${prescription.medicine}</strong>
        <span>${patient ? patient.name : "Unknown patient"} - ${prescription.dose} - ${prescription.timing}</span>
        <p>${prescription.notes || "No extra notes."}</p>
      </article>
    `;
  }).join("");
}

function setupPrescriptionForm() {
  const form = document.querySelector("#prescriptionForm");
  if (!form) return;

  renderPatientOptions("#prescriptionPatient");
  renderPrescriptions();

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const data = readData();
    data.prescriptions.unshift({
      id: nextId("RX", data.prescriptions),
      patientId: document.querySelector("#prescriptionPatient").value,
      medicine: document.querySelector("#medicineName").value,
      dose: document.querySelector("#medicineDose").value,
      timing: document.querySelector("#medicineTiming").value,
      notes: document.querySelector("#doctorNotes").value,
      status: "Due today"
    });
    writeData(data);
    form.reset();
    renderPatientOptions("#prescriptionPatient");
    renderPrescriptions();
  });
}

function renderMedicineBoard() {
  const board = document.querySelector("#medicineBoard");
  if (!board) return;

  const data = readData();
  if (!data.prescriptions.length) {
    board.innerHTML = `<div class="empty-state">No medicines added yet. Add a prescription first.</div>`;
    return;
  }

  board.innerHTML = data.prescriptions.map((prescription) => {
    const patient = getPatient(data, prescription.patientId);
    const done = prescription.status === "Taken";
    return `
      <article class="medicine-card">
        <header>
          <div>
            <h2>${prescription.medicine}</h2>
            <p>${patient ? patient.name : "Unknown patient"} - ${prescription.patientId}</p>
          </div>
          <span class="pill ${done ? "done" : "warning"}">${prescription.status}</span>
        </header>
        <div>
          <strong>${prescription.dose}</strong>
          <p>${prescription.timing}</p>
          <p>${prescription.notes || "Follow doctor instructions."}</p>
        </div>
        <button class="button ${done ? "" : "primary"} full" type="button" data-toggle-medicine="${prescription.id}">
          ${done ? "Mark due again" : "Mark as taken"}
        </button>
      </article>
    `;
  }).join("");

  document.querySelectorAll("[data-toggle-medicine]").forEach((button) => {
    button.addEventListener("click", () => {
      const data = readData();
      const prescription = data.prescriptions.find((item) => item.id === button.dataset.toggleMedicine);
      prescription.status = prescription.status === "Taken" ? "Due today" : "Taken";
      writeData(data);
      renderMedicineBoard();
    });
  });
}

function renderAppointments() {
  const list = document.querySelector("#appointmentList");
  if (!list) return;

  const data = readData();
  if (!data.appointments.length) {
    list.innerHTML = `<div class="empty-state">No appointments scheduled yet.</div>`;
    return;
  }

  list.innerHTML = data.appointments.map((appointment) => {
    const patient = getPatient(data, appointment.patientId);
    return `
      <article class="record">
        <strong>${appointment.date} at ${appointment.time}</strong>
        <span>${patient ? patient.name : "Unknown patient"} with ${appointment.doctor}</span>
        <p>${appointment.reason}</p>
      </article>
    `;
  }).join("");
}

function setupAppointmentForm() {
  const form = document.querySelector("#appointmentForm");
  if (!form) return;

  renderPatientOptions("#appointmentPatient");
  renderAppointments();

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const data = readData();
    data.appointments.unshift({
      id: nextId("AP", data.appointments),
      patientId: document.querySelector("#appointmentPatient").value,
      date: document.querySelector("#appointmentDate").value,
      time: document.querySelector("#appointmentTime").value,
      doctor: document.querySelector("#appointmentDoctor").value,
      reason: document.querySelector("#appointmentReason").value
    });
    writeData(data);
    form.reset();
    renderAppointments();
  });
}

renderDashboard();
setupLoginTabs();
setupPatientForm();
setupPrescriptionForm();
renderMedicineBoard();
setupAppointmentForm();
