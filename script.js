const API_URL = "http://localhost:5000/medicines";

const form = document.getElementById("medicineForm");
const table = document.getElementById("medicineTable");
const searchInput = document.getElementById("searchInput");
const totalMedicines = document.getElementById("totalMedicines");
const submitBtn = document.getElementById("submitBtn");

let medicines = [];
let editId = null;

async function loadMedicines() {
  try {
    const response = await fetch(API_URL);
    medicines = await response.json();
    displayMedicines();
  } catch (error) {
    console.log("Failed to load medicines:", error);
  }
}

function displayMedicines() {
  const searchText = searchInput.value.toLowerCase();
  const today = new Date().toISOString().split("T")[0];

  table.innerHTML = "";

  const filteredMedicines = medicines.filter((medicine) =>
    medicine.name.toLowerCase().includes(searchText) ||
    medicine.category.toLowerCase().includes(searchText)
  );

  totalMedicines.textContent = medicines.length;

  filteredMedicines.forEach((medicine) => {
    let status = "";

    if (medicine.expirationDate < today) {
      status = `<span class="expired">Expired</span>`;
    } else if (Number(medicine.quantity) <= 10) {
      status = `<span class="low-stock">Low Stock</span>`;
    } else {
      status = `<span class="available">Available</span>`;
    }

    const row = document.createElement("tr");

    row.innerHTML = `
      <td>${medicine.name}</td>
      <td>${medicine.category}</td>
      <td>${medicine.quantity}</td>
      <td>₱${medicine.price}</td>
      <td>${medicine.expirationDate}</td>
      <td>${status}</td>
      <td>
        <button class="edit-btn">Edit</button>
        <button class="delete-btn">Delete</button>
      </td>
    `;

    row.querySelector(".edit-btn").addEventListener("click", () => {
      editMedicine(medicine);
    });

    row.querySelector(".delete-btn").addEventListener("click", () => {
      deleteMedicine(medicine._id);
    });

    table.appendChild(row);
  });
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const medicineData = {
    name: document.getElementById("name").value,
    category: document.getElementById("category").value,
    quantity: document.getElementById("quantity").value,
    price: document.getElementById("price").value,
    expirationDate: document.getElementById("expirationDate").value
  };

  if (editId === null) {
    await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(medicineData)
    });
  } else {
    await fetch(`${API_URL}/${editId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(medicineData)
    });

    editId = null;
    submitBtn.textContent = "Add Medicine";
  }

  form.reset();
  loadMedicines();
});

function editMedicine(medicine) {
  document.getElementById("name").value = medicine.name;
  document.getElementById("category").value = medicine.category;
  document.getElementById("quantity").value = medicine.quantity;
  document.getElementById("price").value = medicine.price;
  document.getElementById("expirationDate").value = medicine.expirationDate;

  editId = medicine._id;
  submitBtn.textContent = "Update Medicine";
}

async function deleteMedicine(id) {
  const confirmDelete = confirm("Are you sure you want to delete this medicine?");

  if (confirmDelete) {
    await fetch(`${API_URL}/${id}`, {
      method: "DELETE"
    });

    loadMedicines();
  }
}

searchInput.addEventListener("input", displayMedicines);

loadMedicines();