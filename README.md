# 🏠 HR Nekretnine Helper

[![Manifest Version](https://img.shields.io/badge/Manifest-V3-blue.svg)]()
[![Locale](https://img.shields.io/badge/Locale-HR%20%7C%20EN-green.svg)]()

**HR Nekretnine Helper** is a powerful Chrome extension designed to enhance your experience on [hr-nekretnine.hr](https://hr-nekretnine.hr). It helps you manage, filter, and track real estate and business space tenders with ease.

---

## ✨ Key Features

### 🛠️ In-Page Listing Management
*   **Hide Listings**: Easily hide properties you aren't interested in to declutter your view.
*   **Custom Tags**: Add preset tags (e.g., *Zanimljivo*, *Prijavljeno*) or create your own custom tags for each listing. 🏷️
*   **Bidding System (Ponude)**: Track your bids directly on the listing! Save the bid amount, submission date, and personal notes.
*   **Repeaters (Povratnik)**: Automatically highlights properties you've already bidded on.

### 🔍 Advanced Filtering
Apply powerful filters directly to the page you are viewing:
*   Filter by **City** and **Activity/Purpose**.
*   Filter by **Street name**.
*   Filter by **Area (m²)** (Min / Max).
*   Filter by **Price (€)** (Min / Max).
*   Toggle to show only **Tagged** or **Bidded** listings.

### 🔔 Automated Tender Tracking & Notifications
*   **Background Monitoring**: Automatically checks for new tenders (Rent & Sale) at customizable intervals (e.g., every 60 minutes).
*   **Smart Notifications**: Get notified instantly when a **new tender** is published or when an existing tender's **stage changes**. 📢
*   **Recent Calls Dashboard**: Keep track of recently active tenders directly from the extension popup.

### 📊 Dashboard & Settings
*   **Side Panel Support**: Open the extension in the Chrome Side Panel for a seamless companion view.
*   **Data Export/Import**: Export your tags, hidden items, and bids to JSON or CSV for backup and analysis.
*   **Theme Support**: Choose between Auto, Light, and Dark themes. 🌙
*   **Bilingual**: Fully supports Croatian (HR) and English (EN) interfaces.

---

## 🚀 Installation (Developer Mode)

Since this is a custom extension, you can install it manually via Chrome's Developer Mode:

1. Clone or download this repository to your local machine.
2. Open Google Chrome and navigate to `chrome://extensions/`.
3. Enable **"Developer mode"** by toggling the switch in the top right corner.
4. Click on the **"Load unpacked"** button.
5. Select the `extension` folder containing the `manifest.json` file.
6. The extension is now installed! 🎉 Pin it to your toolbar for quick access.

---

## 💡 How to Use

1. **Navigate** to [hr-nekretnine.hr](https://hr-nekretnine.hr).
2. Browse the property listings. You will notice new action buttons injected next to each listing:
    *   👁️ **Hide/Restore**
    *   🏷️ **Tags**
    *   💰 **Bid (Ponuda)**
3. **Open the Extension Popup** (or Side Panel) to access:
    *   **Filters:** Apply filters that immediately update the page.
    *   **Dashboard:** View your tracked statistics (Managed, Hidden, Bids).
    *   **Notifications & Recent Calls:** See what tenders have recently changed status.
    *   **Settings:** Configure background tracking intervals and notification preferences.

---

## 🛠️ Technologies Used

*   **Manifest V3**: The latest Chrome Extension standard.
*   **Vanilla JavaScript (ES6+)**: No heavy frameworks, fast and lightweight.
*   **Offscreen API**: Used for silent, background parsing of tender pages to check for updates.
*   **Chrome Storage & Alarms**: For data persistence and scheduled tender checking.

---

*Made to simplify property hunting on hr-nekretnine.hr!* 🏢
