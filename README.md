# Financial Management System

A simple web app to help you manage your personal or business finances. You can track budgets, record expenses, and see your financial stats in one place.

---

## Main Features

- **Sign Up & Login:** Secure registration and login using JWT tokens.
- **Dashboard:** See your budgets, expenses, and recent transactions at a glance.
- **Budgets:** Create, update, or delete budgets for different categories and time periods.
- **Expenses:** Add, edit, or delete your expenses. Filter by category or date.
- **Reports:** Get summaries of your financial activity.
- **Profile:** Update your user info and password.
- **Modern UI:** Built with React and Tailwind CSS for a clean, responsive look.

---

## Tech Stack

- **Frontend:** React, React Router, Tailwind CSS, Framer Motion, React Hook Form, Yup, Recharts
- **Backend:** Node.js, Express, MongoDB, JWT, bcryptjs, dotenv

---

## Project Structure

```
Financial-Management-System/
├── server/         # Backend (API, database, authentication)
├── src/            # Frontend (React app)
├── index.html      # Main HTML file
├── package.json    # Frontend dependencies
└── README.md       # This file
```

---

## Getting Started

### Prerequisites
- Node.js (v18 or newer)
- npm (or yarn)
- MongoDB (local or cloud)

### 1. Clone the repository
```bash
git clone <repo-url>
cd Financial-Management-System
```

### 2. Install dependencies
- **Frontend:**
  ```bash
  npm install
  ```
- **Backend:**
  ```bash
  cd server
  npm install
  ```

### 3. Set up environment variables
Create a `.env` file in the `server/` folder:
```
MONGO_URI=<your-mongodb-uri>
JWT_SECRET=<your-secret-key>
PORT=5000
```

### 4. Start the app
- **Backend:**
  ```bash
  cd server
  npm start
  ```
- **Frontend:** (in a new terminal)
  ```bash
  npm run dev
  ```

- Frontend: [http://localhost:5173](http://localhost:5173)
- Backend: [http://localhost:5000](http://localhost:5000)

---

## How to Use
- Register or log in.
- Create budgets for your categories (like Food, Rent, etc.).
- Add your expenses and assign them to budgets.
- Check your dashboard for stats and recent activity.
- View reports for summaries.
- Update your profile or password anytime.

---

## API Endpoints (Quick Reference)

### Auth
- `POST /api/auth/register` — Register
- `POST /api/auth/login` — Login

### Budgets (need login)
- `GET /api/budgets` — List budgets
- `POST /api/budgets` — Add budget
- `PUT /api/budgets/:id` — Update budget
- `DELETE /api/budgets/:id` — Delete budget

### Expenses (need login)
- `GET /api/expenses` — List expenses
- `POST /api/expenses` — Add expense
- `PUT /api/expenses/:id` — Update expense
- `DELETE /api/expenses/:id` — Delete expense

### Dashboard (need login)
- `GET /api/dashboard/stats` — Get dashboard stats

### Reports (need login)
- `GET /api/reports` — Get summary report

### User Profile (need login)
- `GET /api/users/me` — Get your profile
- `PUT /api/users/me` — Update your profile
- `PUT /api/users/me/password` — Change your password

---

## License
This project is for learning and personal use. Feel free to modify and use it as you like.





