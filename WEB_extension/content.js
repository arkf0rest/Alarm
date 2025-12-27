let lastVisibility = null;

function waitForElement(selector, timeout = 10000) {
  return new Promise((resolve, reject) => {
    const el = document.querySelector(selector);
    if (el) return resolve(el);

    const obs = new MutationObserver(() => {
      const el = document.querySelector(selector);
      if (el) {
        obs.disconnect();
        resolve(el);
      }
    });

    obs.observe(document.body, { childList: true, subtree: true });

    setTimeout(() => {
      obs.disconnect();
      reject("Timeout");
    }, timeout);
  });
}

async function verifAttaque() {
  try {
    // 🔥 ATTEND que les flottes existent
    await waitForElement(".fleet-card", 10000);

    const flottes = document.querySelectorAll(".fleet-card");

    for (const flotte of flottes) {
      const nom = flotte
        .querySelector(".fleet-head strong")
        ?.textContent
        ?.trim();

      if (nom === "Attaque") {
        console.log("⚠️ Attaque détectée !");
        return true;
      }
    }
  } catch (e) {
    console.warn("Pas de flottes trouvées", e);
  }
  return false;
}

async function openTab(tabName, timeout = 2000) {
  try {
    const selector = `li[data-section="${tabName}"]`;

    const tab = await waitForElement(selector, timeout);

    tab.click();

    // équivalent du time.sleep(0.5)
    await new Promise(res => setTimeout(res, 500));

    return true;
  } catch (e) {
    console.warn(`Impossible d'ouvrir l’onglet ${tabName}`, e);
    return false;
  }
}


const intervalId = setInterval(() => {
  try {
    // Si le contexte extension est mort → stop
    if (!chrome.runtime?.id) {
      clearInterval(intervalId);
      return;
    }

    const alertImg = document.querySelector("#alert-icon");
    const visible = !!(alertImg && alertImg.offsetParent !== null);

if (visible !== lastVisibility) {
  lastVisibility = visible;

  if (visible) {
    openTab("generale").then(ok => {
      if (!ok) return;

      verifAttaque().then(attaque => {
        chrome.runtime.sendMessage({
          type: "ALERT",
          attaque
        });
      });
    });
  } else {
    chrome.runtime.sendMessage({
      type: "ALERT",
      attaque: false
    });
  }
}


    console.log("Visibilité envoyée :", visible);

  } catch (err) {
    console.warn("Context invalidé, arrêt du script");
    clearInterval(intervalId);
  }
}, 3000);

// Nettoyage si la page se ferme / navigue
window.addEventListener("beforeunload", () => {
  clearInterval(intervalId);
});
