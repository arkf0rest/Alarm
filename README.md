# 🚀 E-Univers Galaxy Web Extension

**E-Univers Galaxy Web Extension** is a Chrome extension for [e-univers.fr](https://e-univers.fr) that:

* Scans galaxies and systems to collect planet and player data
* Sends real-time notifications for incoming attacks
* Alerts when all your expeditions have returned

It also includes a user-friendly popup interface with real-time progress updates.

---

## 🌟 Features

* **Galaxy & System Scan** – Automatically iterates through galaxies and systems to collect planet and player info.
* **Player Aggregation** – Groups data by player with badges (Noob Protection, Vacation Mode, Inactive, etc.).
* **Attack Alerts** – Sends notifications if any of your planets are under attack.
* **Expedition Return Alerts** – Notifies you when all your ongoing expeditions have returned.
* **CSRF Protection** – Retrieves CSRF token from the page for secure POST requests.
* **Real-Time Progress** – Popup shows galaxy, system, and scan percentage.
* **Safe Scanning** – Prevents multiple scans from running at the same time.
* **Server Integration** – Sends aggregated data to a remote server using JWT authentication.

---

## 📦 Installation

1. Download the repository:

   ```bash
   git clone https://github.com/YOUR_USERNAME/e-univers-galaxy-scanner.git
   ```
2. Open Chrome and go to:

   ```
   chrome://extensions/
   ```
3. Enable **Developer Mode** (top-right toggle).
4. Click **Load unpacked** and select the extension folder.
5. The extension icon will appear in the toolbar.

---

## 🖥 Usage

1. Log in to [e-univers.fr](https://e-univers.fr).
2. Open the extension popup.
3. Click **Scan** to start scanning galaxies and systems.
4. Monitor scan progress in the popup.
5. Receive notifications for:

   * Incoming attacks
   * Return of all expeditions
6. Aggregated player data is automatically sent to the server.

---

## ⚙️ Configuration

| Option                    | Description                                                            |
| ------------------------- | ---------------------------------------------------------------------- |
| **Server URL**            | Fetched dynamically from `server.json` on GitHub.                      |
| **JWT Token**             | Retrieved automatically for secure server communication.               |
| **Notification Settings** | Configurable to enable/disable attack or expedition alerts.            |

---

## 🔒 Security & Reliability

* Prevents duplicate scans with a `scanEnCours` flag.
* Message listeners are added **only once** per tab to avoid duplicate logs.
* CSRF tokens are retrieved to secure POST requests.

---

## ⚠️ Disclaimer

This project is intended for personal use only. Do **not** use it to violate the terms of service of e-univers.fr or any other platform.
