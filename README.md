# ⚖️ Court Assist - Frontend (React)

This is the client-side application for **Court Assist**, a hearing reminder platform designed for advocates and litigants. Built with **React** and **Vite**, it provides a seamless interface for case management and real-time notifications.

---

## 🎨 Project Overview

The frontend serves as the command center for users to:

* **Register & Login:** Secure authentication via Firebase/JWT.
* **Case Dashboard:** View, search, and filter upcoming court hearings.
* **Notification Management:** Toggle preferences for Email, SMS, and Push alerts.
* **Real-time Interaction:** Integration with Firebase Cloud Messaging (FCM) for instant background alerts.

---

## 🛠️ Tech Stack

* **Framework:** React 18 (Vite)
* **Styling:** Tailwind CSS / Bootstrap (whichever you are using)
* **State Management:** Context API / Redux
* **Notification Handling:** * **EmailJS:** Client-side email triggering.
* **Firebase SDK:** Push notifications and service worker management.


* **API Client:** Axios (for communication with the Spring Boot backend)

---

## 📂 Folder Structure

```text
frontend/
├── public/
│   └── firebase-messaging-sw.js  # Service worker for background push
├── src/
│   ├── assets/                 # Images, icons, and global styles
│   ├── components/             # Reusable UI components
│   ├── context/                # Auth and Notification context
│   ├── hooks/                  # Custom React hooks
│   ├── services/               # API call logic (Axios)
│   └── App.jsx                 # Root component
├── .env                        # Environment variables (Ignored by Git)
└── package.json

```

---

## 🚀 Setup & Installation

### 1. Prerequisites

* Node.js (v18.0.0 or higher)
* npm or yarn

### 2. Clone and Install

```bash
git clone git@github.com:ranjith-2023/CourtAssist-Frontend.git
cd CourtAssist-Frontend
npm install

```

### 3. Environment Configuration

Create a `.env` file in the root directory and add your credentials:

```env
VITE_APP_API_KEY=your_firebase_key
VITE_APP_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_APP_PROJECT_ID=your_project_id
VITE_APP_MESSAGING_SENDER_ID=your_sender_id
VITE_APP_APP_ID=your_app_id
VITE_BACKEND_URL=http://localhost:8080/api/v1

```

### 4. Running the App

```bash
# Start development server
npm run dev

```

---

## 🔔 Notification Setup

### Background Push Notifications

The application uses a Service Worker located at `public/firebase-messaging-sw.js`.

> **Note:** For production, ensure that your service worker is registered over HTTPS, as browsers do not allow notification permissions on insecure origins (except localhost).

### Email Alerts

We use **EmailJS** to handle automated client-side communication. Ensure your `Service ID` and `Template ID` are configured in the dashboard components.

---

## 🤝 Contributing

1. Fork the project.
2. Create your Feature Branch (`git checkout -b feature/UI-Improvement`).
3. Commit your changes (`git commit -m 'Add new dashboard widget'`).
4. Push to the branch (`git push origin feature/UI-Improvement`).
5. Open a Pull Request.

---

## 👤 Contact

**Ranjith** - [GitHub](https://www.google.com/search?q=https://github.com/ranjith-2023)

**Project Link:** [Court Assist Frontend](https://www.google.com/search?q=https://github.com/ranjith-2023/CourtAssist-Frontend)

---
