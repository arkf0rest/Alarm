let isReady = true;

// Récupération de l'URL du serveur
fetch("https://raw.githubusercontent.com/arkf0rest/E-univers_alarm/main/server.json")
  .then(res => res.json())
  .then(data => {
    chrome.storage.local.set({ server_url: data.url });
    console.log("URL du serveur mise à jour :", data.url);
  })
  .catch(err => console.error("Impossible de récupérer server.json", err));

// Fonction pour décoder le JWT sans dépendance externe
function decodeJWT(token) {
  try {
    const payload = token.split('.')[1];
    return JSON.parse(atob(payload));
  } catch (e) {
    return null;
  }
}

// Fonction pour récupérer un token valide
async function getToken() {
  const storage = await chrome.storage.local.get(["token", "expiry"]);
  let { token, expiry } = storage;

  // Vérifier si le token existe et n'est pas expiré
  if (!token || !expiry || Date.now() >= expiry) {
    const { server_url } = await chrome.storage.local.get(["server_url"]);
    if (!server_url) throw new Error("server_url manquant");

    const res = await fetch(`${server_url}/get_token`, {
      headers: {
        "X-EXTENSION-SECRET":
          "aKF7UiBihUenjFgme_5LgHcxHiirH4pX3KmbyebU5scoCjwsdpnx0NdQyFyb0v9XnHA"
      }
    });

    const data = await res.json();
    token = data.token;

    const decoded = decodeJWT(token);
    expiry = decoded?.exp ? decoded.exp * 1000 : Date.now() + 3600000;

    await chrome.storage.local.set({ token, expiry });
    console.log(
      "✅ Nouveau token récupéré, expire à",
      new Date(expiry).toLocaleTimeString()
    );
  }

  return token;
}

// Listener pour les messages d'alerte
chrome.runtime.onMessage.addListener(async (msg) => {
  if (msg.type !== "ALERT") return;

  console.log("Alerte reçue. Attaque :", msg.attaque);

  if (msg.attaque && isReady) {
    isReady = false;

    const storage = await chrome.storage.local.get(["discord_id", "server_url"]);
    const discord_id = storage.discord_id;
    const server_url = storage.server_url;


    if (!discord_id || !server_url) return;

    // Récupérer un token valide avant d'envoyer la notification
    const token = await getToken();

    fetch(`${server_url}/notify`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`  // envoyer le JWT
      },
      body: JSON.stringify({
        message: "Une attaque est en cours.",
        discord_id
      })
    }).catch(console.error);
  }

  // Réarmement
  if (!msg.attaque) {
    isReady = true;
  }
});
