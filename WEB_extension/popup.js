const inputId = document.getElementById("discordId");
const statusEl = document.getElementById("status");
const scanButton = document.getElementById("scanButton");
const progressBar = document.getElementById("progressBar");
const progressText = document.getElementById("progressText");

const attackCheckbox = document.getElementById("attackMsg");
const exploreCheckbox = document.getElementById("exploreMsg");
const audioCheckbox = document.getElementById("checkboxInput");

const messagesBtn = document.getElementById("messagesBtn");
const messagesPopup = document.getElementById("messagesPopup");
const messagesContainer = document.getElementById("messagesContainer");

// ----- Charger les valeurs sauvegardées -----
chrome.storage.local.get(
  ["discord_id", "audioEnable", "exploreEnable", "attackEnable"],
  (data) => {
    if (data.discord_id) inputId.value = data.discord_id;

    attackCheckbox.checked = Boolean(data.attackEnable);
    exploreCheckbox.checked = Boolean(data.exploreEnable);
    audioCheckbox.checked = Boolean(data.audioEnable);
  }
);

// ----- Sauvegarder ID Discord -----
document.getElementById("save").onclick = () => {
  const id = inputId.value.trim();
  if (!/^\d{17,20}$/.test(id)) {
    statusEl.textContent = "ID Discord invalide";
    return;
  }
  chrome.storage.local.set({ discord_id: id }, () => {
    statusEl.textContent = "Sauvegardé ✓";
    console.log("ID Discord :", id);
  });
};

// ----- Toggle attaques -----
attackCheckbox.addEventListener("change", () => {
  chrome.storage.local.set({ attackEnable: attackCheckbox.checked });
  console.log(attackCheckbox.checked ? "✅ Notifications attaques activées" : "❌ Notifications attaques désactivées");
});

// ----- Toggle explorations -----
exploreCheckbox.addEventListener("change", () => {
  chrome.storage.local.set({ exploreEnable: exploreCheckbox.checked });
  console.log(exploreCheckbox.checked ? "✅ Notifications explorations activées" : "❌ Notifications explorations désactivées");
});

// ----- Toggle audio -----
audioCheckbox.addEventListener("change", () => {
  chrome.storage.local.set({ audioEnable: audioCheckbox.checked });
  console.log(audioCheckbox.checked ? "🔊 Son activé" : "🔇 Son coupé");
});

// ----- Bouton Scan -----
scanButton.addEventListener("click", async () => {
  scanButton.classList.add("active");
  scanButton.querySelector(".scan-text").textContent = "Scan en cours...";

  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab?.id) return;

  try {
    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ["content.js"]
    });
  } catch (e) {
    console.error("Erreur injection content script :", e);
    scanButton.querySelector(".scan-text").textContent = "Erreur injection ❌";
    return;
  }

  chrome.tabs.sendMessage(tab.id, { action: "startScan" });
});

// ----- Messages depuis content.js -----
chrome.runtime.onMessage.addListener((msg) => {
  switch (msg.action) {
    case "updateProgress":
      scanButton.classList.add("active");
      scanButton.querySelector(".scan-text").textContent = "Scan en cours...";
      progressBar.parentElement.style.display = "block";
      progressBar.style.width = msg.percent + "%";
      progressText.textContent = `Galaxie ${msg.galaxy} / Système ${msg.system} (${msg.percent}%)`;
      break;

    case "scanFinished":
      progressBar.style.width = "100%";
      progressText.textContent = "Scan terminé ✅";
      scanButton.querySelector(".scan-text").textContent = "Scan terminé ✅";
      setTimeout(() => {
        scanButton.classList.remove("active");
        progressBar.parentElement.style.display = "none";
        progressBar.style.width = "0%";
        progressText.textContent = "";
        chrome.storage.local.set({ scanFinished: false });
      }, 3000);
      break;
  }
});

// Clique sur le bouton Messagerie
document.getElementById("messagesBtn").addEventListener("click", () => {
  window.location.href = "messages.html";
});


// // ---- Messagerie ----
// messagesBtn.addEventListener("click", () => {
//   messagesPopup.style.display = messagesPopup.style.display === "none" ? "block" : "none";
// });

// // Charger messages depuis storage
// function loadMessages() {
//   chrome.storage.local.get("messages", (data) => {
//     const messages = data.messages || [];
//     messagesContainer.innerHTML = "";

//     messages.forEach((msg, index) => {
//       const div = document.createElement("div");
//       div.className = "message";
//       div.textContent = `[${msg.arrivalTime.join(', ')}] ${msg.message}`;

//       const delBtn = document.createElement("button");
//       delBtn.textContent = "❌";
//       delBtn.onclick = () => {
//         messages.splice(index, 1);
//         chrome.storage.local.set({ messages }, loadMessages);
//       };

//       div.appendChild(delBtn);
//       messagesContainer.appendChild(div);
//     });

//     // Auto-scroll vers le dernier message
//     messagesContainer.scrollTop = messagesContainer.scrollHeight;
//   });
// }

// // Charger au démarrage
// loadMessages();

// // Recevoir les nouveaux messages en direct
// chrome.runtime.onMessage.addListener((msg) => {
//   if (msg.type === "NEW_MESSAGE") loadMessages();
// });