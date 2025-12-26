# 🖥️ Court Assist - Frontend (React)

The user interface for the **Court Assist** platform. This dashboard provides a streamlined experience for litigants and advocates to manage their legal cases and configure real-time hearing alerts.

## 🛠️ Features

* **Case Dashboard:** A clean, grid-based view of all active cases.
* **User Roles:** Context-aware UI for both **Advocates** (multi-case management) and **Litigants** (personal case tracking).
* **Real-time Notifications:** * Integrated **Firebase Cloud Messaging** for background push alerts.
* **EmailJS** integration for direct client-side email dispatch.


* **Responsive Design:** Built with **Tailwind CSS** for a mobile-first experience.
* **Dynamic Forms:** Easy entry for case numbers, court types, and next hearing dates.

---

## 🏗️ Tech Stack

* **Framework:** React.js (Vite)
* **Styling:** Tailwind CSS
* **API Calls:** Native `fetch` API (No external library bloat)
* **Notifications:** * Firebase (Push Notifications)
* EmailJS (Direct Email)


* **Icons:** Lucide React / Heroicons

---

## 🚀 Installation & Setup

### 1. Clone the repository

```bash
git clone git@github.com:ranjith-2023/CourtAssist-Frontend.git
cd CourtAssist-Frontend

```

### 2. Install Dependencies

```bash
npm install

```

### 3. Environment Variables

Create a `.env` file in the root directory and add your keys:

```env
VITE_APP_API_URL=http://localhost:8080/api
VITE_APP_FIREBASE_API_KEY=your_key
VITE_APP_FIREBASE_AUTH_DOMAIN=your_domain
VITE_APP_FIREBASE_PROJECT_ID=your_id
VITE_APP_FIREBASE_MESSAGING_SENDER_ID=your_id
VITE_APP_FIREBASE_APP_ID=your_app_id
VITE_APP_EMAILJS_SERVICE_ID=your_service_id
VITE_APP_EMAILJS_TEMPLATE_ID=your_template_id
VITE_APP_EMAILJS_PUBLIC_KEY=your_public_key

```

### 4. Run Development Server

```bash
npm run dev

```

---

## 🛰️ API Integration

The frontend communicates with the Spring Boot backend using the native `fetch` API.

**Example Fetch Structure:**

```javascript
const fetchCases = async () => {
  const response = await fetch(`${import.meta.env.VITE_APP_API_URL}/cases`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' }
  });
  return response.json();
};

```

---

## 🔔 Setting Up Push Notifications

1. Ensure your `firebase-messaging-sw.js` is located in the `public/` folder.
2. The app will request notification permission on the first dashboard load.
3. Once granted, the device token is sent to the backend to enable targeted reminders.

---

## 🤝 Contributing

1. Fork the Project.
2. Create your Feature Branch.
3. Commit your Changes.
4. Push to the Branch.
5. Open a Pull Request.

---

## 👤 Contact

**Ranjith** - [GitHub](https://www.google.com/search?q=https://github.com/ranjith-2023)

---
