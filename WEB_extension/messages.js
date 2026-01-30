const messagesList = document.getElementById("messagesList");
const backBtn = document.getElementById("backBtn");

// Map des vaisseaux
const VESSELS = {
  41: "Petit Transporteur",
  42: "Grand Transporteur",
  43: "Chasseur Léger",
  44: "Chasseur Lourd",
  45: "Croiseur",
  46: "Vaisseau de Bataille",
  47: "Recycleur",
  48: "Sonde d'espionnage",
  49: "Satelite Solaire",
  50: "Colonisateur",
  51: "Bombardier",
  52: "Destructeur",
  53: "Extracteur",
  54: "Fossoyeur",
  55: "Etoile de la mort",
  56: "Traqueur"
};

// Bouton retour vers popup principal
backBtn.addEventListener("click", () => {
  window.location.href = "popup.html";
});

// Charger les messages depuis le storage
chrome.storage.local.get({ messages: [] }, (data) => {
  const messages = data.messages.reverse();

  if (messages.length === 0) {
    messagesList.innerHTML = "<p style='text-align:center;opacity:0.6;'>📭 Aucun message</p>";
    return;
  }

  messages.forEach((msg, index) => {
    const div = document.createElement("div");
    div.className = "message-item";

    const receivedTime = msg.receivedTime || new Date().toLocaleTimeString();
    const fleetStr = msg.fleet.map(v => `${VESSELS[v.id] || "Inconnu"} x${v.nombre}`).join(", ");

    div.innerHTML = `
      <div class="message-header">
        <span class="message-text">[${receivedTime}] ${msg.message}</span>
        <div class="message-actions">
        <span class="message-unread"></span>
          <img src="img/trash.svg" class="delete-btn" title="Supprimer ce message" />
          <span class="expand-arrow">▶</span>
        </div>
      </div>
      <div class="message-details">
        <p><strong>Flotte:</strong> ${fleetStr}</p>
        <p><strong>Attaquants:</strong> ${msg.attaquants.join(", ")}</p>
        <p><strong>Heure d'arrivée:</strong> ${msg.arrivalTime.join(", ")}</p>
        <p><strong>Coordonnées cibles:</strong> ${msg.targetCoords.join(", ")}</p>
      </div>
    `;

    const unreadDot = div.querySelector(".message-unread");
    if (!msg.read) {
      unreadDot.style.display = "inline-block";
    } else {
      unreadDot.style.display = "none";
    }


    const header = div.querySelector(".message-header");
    const details = div.querySelector(".message-details");
    const deleteBtn = div.querySelector(".delete-btn");
    const arrow = div.querySelector(".expand-arrow");

    // Démarre fermé
    details.style.maxHeight = "0";
    details.style.opacity = "0";
    details.style.transition = "max-height 0.3s ease, opacity 0.3s ease";
    arrow.style.transition = "transform 0.3s ease";

    // Expand/collapse sur tout le container header
    header.addEventListener("click", (e) => {
      if (e.target === deleteBtn) return; // Ignorer clic sur poubelle         

      // Masquer le point rouge
      unreadDot.style.display = "none";
      msg.read = true; // marquer comme lu si tu veux mettre à jour le storage
      
      const currentlyExpanded = document.querySelector(".message-item.expanded");
      if (currentlyExpanded && currentlyExpanded !== div) {
        currentlyExpanded.classList.remove("expanded");
        const det = currentlyExpanded.querySelector(".message-details");
        det.style.maxHeight = "0";
        det.style.opacity = "0";
        currentlyExpanded.querySelector(".expand-arrow").style.transform = "rotate(0deg)";
      }

      if (div.classList.contains("expanded")) {
        div.classList.remove("expanded");
        details.style.maxHeight = "0";
        details.style.opacity = "0";
        arrow.style.transform = "rotate(0deg)";
      } else {
        div.classList.add("expanded");
        details.style.maxHeight = details.scrollHeight + "px";
        details.style.opacity = "1";
        arrow.style.transform = "rotate(90deg)";
      }
    });

    // Supprimer le message
    deleteBtn.addEventListener("click", (e) => {
      e.stopPropagation(); // Empêche l'expand
      div.remove();

      // Met à jour le storage
      chrome.storage.local.get({ messages: [] }, (data) => {
        const newMessages = data.messages.filter((_, i) => i !== (messages.length - 1 - index));
        chrome.storage.local.set({ messages: newMessages });
      });
    });

    messagesList.appendChild(div);
  });
});
