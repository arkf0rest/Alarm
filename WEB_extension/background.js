let isReady = true;

fetch("https://raw.githubusercontent.com/arkf0rest/E-univers_alarm/main/server.json")
  .then(res => res.json())
  .then(data => {
    chrome.storage.local.set({ server_url: data.url });
    console.log("URL du serveur mise à jour :", data.url);
  })
  .catch(err => console.error("Impossible de récupérer server.json", err));


chrome.runtime.onMessage.addListener((msg) => {
  if (msg.type !== "ALERT") return;

  console.log("Alerte reçue. Attque :", msg.attaque);

  if (msg.attaque && isReady) {
    isReady = false;

    chrome.storage.local.get(
      ["discord_id", "server_url"],
      ({ discord_id, server_url }) => {
        if (!discord_id || !server_url) return;

        fetch(`${server_url}/notify`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: "Une attaque est en cours.",
            discord_id
          })
        }).catch(console.error);
      }
    );
  }

  // Réarmement
  if (!msg.attaque) {
    isReady = true;
  }
});
