import { db } from "./firebase-config.js";
import { doc, setDoc } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";

const form = document.getElementById("traitForm");
const bonusRulesContainer = document.getElementById("bonusRulesContainer");
const addBonusRuleBtn = document.getElementById("addBonusRuleBtn");

let bonusRuleCount = 0;

addBonusRuleBtn.addEventListener("click", addBonusRule);
form.addEventListener("submit", saveTrait);

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
  bonusRulesContainer.appendChild(div);
}

async function saveTrait(e) {
  e.preventDefault();

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
    form.reset();
    bonusRulesContainer.innerHTML = "";
    bonusRuleCount = 0;
  } catch (error) {
    console.error("Error saving trait:", error);
    alert("Error saving trait. See console for details.");
  }
}

function csvToArray(str) {
  return str
    ? str.split(',').map(s => s.trim()).filter(s => s.length > 0)
    : [];
}

function nullIfEmpty(str) {
  return str.trim() === "" ? null : str.trim();
}

