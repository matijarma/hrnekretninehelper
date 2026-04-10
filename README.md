# 🏛️ HR-Nekretnine Helper

[![Manifest Version](https://img.shields.io/badge/Manifest-V3-blue.svg)]()
[![Locale](https://img.shields.io/badge/Locale-HR%20%7C%20EN-green.svg)]()
[![Design](https://img.shields.io/badge/Design-Liquid%20Glass-purple.svg)]()

[Chrome Web store](https://chromewebstore.google.com/detail/hr-nekretninehr-asistent/lgoflneakfjiajafmmdibkgcjodbboii?authuser=0&hl=en)

**DN Nekretnine Helper** is a powerful Chrome extension designed to work as your private CRM while browsing [hr-nekretnine.hr](https://hr-nekretnine.hr). It transforms your experience with a gorgeous **Liquid Glass** aesthetic, helping you filter listings, track bids, and get instant notifications for new real estate tenders.

---

## ✨ Features & Architecture

### 💎 Liquid Glass & Bento Design
The extension interface has been completely overhauled:
*   **Progressive Disclosure:** A clean 3-tab architecture (Home, Feed, More) groups related actions logically to reduce cognitive load.
*   **Bento Grid:** The Home dashboard uses a responsive bento-box grid for quick overview of tracked properties, active bids, and hidden listings.
*   **Micro-interactions:** Delightful hover states, custom scrollbars, and staggered spring animations for an app-like feel.
*   **Side Panel Ready:** The UI automatically adapts to a 4-column layout when opened persistently in the Chrome Side Panel.

### 🛠️ In-Page Listing Management
*   👀 **Hide Listings**: Effortlessly remove uninteresting properties to keep your view decluttered.
*   🏷️ **Smart Tags**: Add preset tags (*Zanimljivo*, *Prijavljeno*) or type your own custom markers.
*   💰 **Track Bids (Ponude)**: No more spreadsheets! Record your offered price, exact submission date, and personal notes directly on the property card.
*   🔄 **Repeaters (Povratnik)**: The extension automatically highlights and bumps up properties you’ve bidded on previously.

### 🔍 Advanced Real-Time Filtering
Filter the active webpage instantly without reloading:
*   Filter by **City** and **Business Activity**.
*   Search by **Street/Address**.
*   Define specific ranges for **Area (m²)** and **Starting Price (€)**.
*   Toggle views to show **only tagged listings** or **listings with active bids**.

### 🔔 Automated Tracking & Unified Feed
*   **Background Monitoring:** The extension silently parses `hr-nekretnine.hr` in the background (using DOMParser inside an Offscreen document) to check for newly published tenders. 
*   **Push Notifications:** Get alerted immediately via Chrome notifications when a new tender is out or a tracked tender changes its legal stage.
*   **Activity Feed:** Review all chronological updates and notifications in the dedicated *Aktivnost* tab.

### 📊 Complete Data Sovereignty
*   **Dark & Light Mode**: Automatic theme switching conforming to your OS preferences.
*   **Export/Import**: Backup your entire private CRM database to a JSON file, or export the raw numbers to a CSV for spreadsheet analysis.

---

## 🚀 Installation (Developer Mode)

Since this is a custom tool, install it manually via Chrome's Developer Mode:

1. Clone or download this repository to your local machine.
2. Open Google Chrome and navigate to `chrome://extensions/`.
3. Enable **"Developer mode"** by toggling the switch in the top right corner.
4. Click on the **"Load unpacked"** button.
5. Select the `extension` folder containing the `manifest.json` file.
6. The extension is now installed! 🎉 Pin it to your toolbar and open the **Side Panel** for the best experience.

---

## 💡 How to Use

1. **Navigate** to [hr-nekretnine.hr](https://hr-nekretnine.hr).
2. Browse the property listings. You will notice new sleek action buttons injected next to each listing:
    *   👁️ **Hide/Restore**
    *   🏷️ **Tags**
    *   💰 **Bid (Ponuda)**
3. **Open the Extension** to access:
    *   **Pregled (Home):** Manage filters that immediately cull the active page, and view your at-a-glance bento dashboard. Click on any dashboard stat to view and manage specific properties, or to jump straight to their individual URLs.
    *   **Aktivnost (Feed):** Keep up with newly detected tenders and stage changes.
    *   **Postavke (More):** Configure background tracking intervals or export your data.

---

## 🛠️ Technologies Used

*   **Manifest V3**: The modern standard for secure and performant Chrome extensions.
*   **Vanilla Stack (HTML/CSS/JS)**: Zero heavy frameworks. Hand-crafted CSS tokens for the Liquid Glass UI ensure high performance.
*   **Offscreen API**: Guarantees silent background polling without interrupting active tabs or creating heavy background service workers.
*   **Chrome Storage Local**: Guarantees that none of your private tracking or bidding data ever leaves your device.

---

*Made to simplify property hunting on hr-nekretnine.hr!* 🏢
