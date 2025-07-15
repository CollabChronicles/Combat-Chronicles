import { db } from "./firebase-config.js";
import { doc, setDoc } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-auth.js";

const YOUR_EMAIL = "collabchroniclesproject@gmail.com";

// Auth UI Elements
const loginForm = document.getElementById("loginForm");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const logoutBtn = document.getElementById("logoutBtn");
const accessDenied = document.getElementById("accessDenied");

// Admin UI Elements
const adminSection = document.getElementById("adminSection");
const entryTypeSelect = document.getElementById("entryType");
const formContainer = document.getElementById("formContainer");
const submitBtn = document.getElementById("submitBtn");

let bonusRuleCount = 0;

const auth = getAuth();

// -----------------------------------
// Auth Handlers
// -----------------------------------
loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = emailInput.value;
  const password = passwordInput.value;
  try {
    await signInWithEmailAndPassword(auth, email, password);
  } catch (error) {
    alert("Login failed: " + error.message);
  }
});

logoutBtn.addEventListener("click", () => {
  signOut(auth);
});

onAuthStateChanged(auth, (user) => {
  if (user && user.email === YOUR_EMAIL) {
    loginForm.style.display = "none";
    logoutBtn.style.display = "inline-block";
    accessDenied.style.display = "none";
    adminSection.style.display = "block";
    renderForm(entryTypeSelect.value);
  } else if (user) {
    accessDenied.style.display = "block";
    logoutBtn.style.display = "inline-block";
    loginForm.style.display = "none";
    adminSection.style.display = "none";
    signOut(auth);
  } else {
    loginForm.style.display = "block";
    logoutBtn.style.display = "none";
    accessDenied.style.display = "none";
    adminSection.style.display = "none";
  }
});

// -----------------------------------
// Form Rendering
// -----------------------------------
entryTypeSelect.addEventListener("change", () => {
  renderForm(entryTypeSelect.value);
});

function renderForm(type) {
  bonusRuleCount = 0;
  formContainer.innerHTML = "";

  if (type === "trait") {
    renderTraitForm();
  } else if (type === "species" || type === "occupation") {
    renderSpeciesOccupationForm();
  }
}

function renderTraitForm() {
  const html = `
    <label>Name:
      <input type="text" id="name" required>
    </label>
    <label>Description:
      <textarea id="description"></textarea>
    </label>
    <h2>Bonus Rules</h2>
    <div id="bonusRulesContainer"></div>
    <button type="button" id="addBonusRuleBtn">Add Bonus Rule</button>
  `;
  formContainer.innerHTML = html;

  document.getElementById("addBonusRuleBtn").addEventListener("click", addBonusRule);
}

function renderSpeciesOccupationForm() {
  formContainer.innerHTML = `
    <label>Name:
      <input type="text" id="name" required>
    </label>
    <label>Description:
      <textarea id="description"></textarea>
    </label>
    <label>Default Traits (comma-separated):
      <input type="text" id="defaultTraits" placeholder="e.g. Strong,Fast">
    </label>
  `;
}

// -----------------------------------
// Bonus Rule Logic
// -----------------------------------
function addBonusRule() {
  const idx = bonusRuleCount++;
  const div = document.createElement("div");
  div.className = "bonus-rule";
  div.innerHTML = `
    <label>Bonus:
      <input type="number" id="bonus${idx}" required>
    </label>
    <label>SelfAction:
      <input type="text" id="selfAction${idx}" placeholder="(Optional)">
    </label>
    <label>OpponentAction:
      <input type="text" id="opponentAction${idx}" placeholder="(Optional)">
    </label>
    <label>SelfTraits (comma-separated):
      <input type="text" id="selfTraits${idx}" placeholder="(Optional)">
    </label>
    <label>OpponentTraits (comma-separated):
      <input type="text" id="opponentTraits${idx}" placeholder="(Optional)">
    </label>
  `;
  document.getElementById("bonusRulesContainer").appendChild(div);
}

// -----------------------------------
// Submission Handler
// -----------------------------------
submitBtn.addEventListener("click", async () => {
  const type = entryTypeSelect.value;
  if (type === "trait") {
    await saveTrait();
  } else {
    await saveSpeciesOrOccupation(type);
  }
});

// Save Trait
async function saveTrait() {
  const name = document.getElementById("name").value.trim();
  const description = document.getElementById("description").value.trim();

  const rules = [];
  for (let i = 0; i < bonusRuleCount; i++) {
    const bonus = parseInt(document.getElementById(`bonus${i}`).value);
    const selfAction = nullIfEmpty(document.getElementById(`selfAction${i}`).value);
    const opponentAction = nullIfEmpty(document.getElementById(`opponentAction${i}`).value);
    const selfTraits = csvToArray(document.getElementById(`selfTraits${i}`).value);
    const opponentTraits = csvToArray(document.getElementById(`opponentTraits${i}`).value);

    rules.push({
      bonus,
      SelfAction: selfAction,
      OpponentAction: opponentAction,
      SelfTraits: selfTraits,
      OpponentTraits: opponentTraits
    });
  }

  const traitData = {
    name,
    description,
    bonusRules: rules
  };

  try {
    await setDoc(doc(db, "traits", name), traitData);
    alert("Trait saved successfully!");
    renderForm("trait");
  } catch (error) {
    console.error("Error saving trait:", error);
    alert("Error saving trait. See console for details.");
  }
}

// Save Species/Occupation
async function saveSpeciesOrOccupation(collection) {
  const name = document.getElementById("name").value.trim();
  const description = document.getElementById("description").value.trim();
  const defaultTraits = csvToArray(document.getElementById("defaultTraits").value);

  const data = {
    name,
    description,
    defaultTraits
  };

  try {
    await setDoc(doc(db, collection, name), data);
    alert(`${collection.charAt(0).toUpperCase() + collection.slice(1)} saved successfully!`);
    renderForm(collection);
  } catch (error) {
    console.error(`Error saving ${collection}:`, error);
    alert(`Error saving ${collection}. See console for details.`);
  }
}

// Helpers
function csvToArray(str) {
  return str
    ? str.split(',').map(s => s.trim()).filter(s => s.length > 0)
    : [];
}

function nullIfEmpty(str) {
  return str.trim() === "" ? null : str.trim();
}
