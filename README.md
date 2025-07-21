# 💰 Financial Management System

A full-stack web application designed to help users manage their **budget**, **track expenses**, and **monitor transactions** in a simple, visual, and efficient way.

---

## 🚀 Features

- 📊 **Dashboard Overview** – Visualize income, spending, and savings trends
- 🧾 **Transaction Management** – Add, view, and filter transactions
- 💡 **Budget Allocation** – Set and track budget categories
- 🔒 **Authentication** – Secure login/register with protected routes
- 📈 **Expense Charts** – Monthly analysis through interactive graphs

---

## 🛠️ Tech Stack

### Frontend
- ⚛️ React.js (with Hooks)
- 🌀 Tailwind CSS
- 🔀 React Router
- 🌐 Axios

### Backend
- 🟢 Node.js
- ⚙️ Express.js
- 🍃 MongoDB (Mongoose)

---

## 📁 Project Structure

```bash
Financial-Management-System/
│
├── server/                  # Backend logic (Node, Express, MongoDB)
├── src/                     # Frontend React components
├── public/                  # Public assets
├── .gitignore
├── package.json
├── tailwind.config.js
└── vite.config.ts


---

## 🖥️ Getting Started

### Prerequisites
- Node.js and npm installed
- MongoDB running locally or via Atlas

### Backend Setup

```bash
cd server
npm install
npm run dev
---

## 🖥️ Frontend Setup

```bash
cd ..
npm install
npm run dev

Visit http://localhost:5173 in your browser 🚀

🔐 Environment Variables
Create a .env file in the server/ folder with:

## 🔐 Environment Variables

Create a `.env` file in the `server/` folder with the following content:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string

