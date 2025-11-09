
# MERN Assignment Portal

![Project Banner](https://placehold.co/1200x600/222831/FFFFFF/png?text=MERN%20Assignment%20Portal)

<p align="center">
  <img alt="React" src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" />
  <img alt="Node.js" src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" />
  <img alt="Express" src="https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white" />
  <img alt="MongoDB" src="https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white" />
  <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" />
  <img alt="Vercel" src="https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white" />
</p>

A comprehensive, production-quality MERN stack application designed to streamline the academic assignment workflow. It provides a secure, role-based platform for Administrators, Monitors, and Students to manage the entire lifecycle of an assignment, from creation and submission to collection and archival.

---

## ✨ Live Demo

[**<< Deploy your own to see it live! >>**](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2F<Your-GitHub-Username>%2F<Your-Repo-Name>)

*(Replace the placeholder URL above with your own repository link to enable one-click deployment.)*

---

## 🚀 Features

### General
- **Secure JWT Authentication**: Secure login and session management using JSON Web Tokens.
- **Role-Based Access Control (RBAC)**: Distinct dashboards and permissions for Admins, Monitors, and Students.
- **Responsive Design**: A modern, dark-themed UI that works flawlessly on desktop and mobile devices.
- **Real-time Notifications**: A non-blocking notification system for user feedback.
- **Code Splitting**: Lazy loading of pages for optimized initial load times.
- **Centralized Data Fetching**: Efficient and predictable state management with **Redux Toolkit Query (RTK Query)**.

### 🛡️ Administrator Features
- **User Management Dashboard**: View, filter, and manage all users.
- **Account Approval System**: New user registrations require admin approval before they can log in.
- **Role Management**: Easily assign or change user roles (Student, Monitor).
- **Platform Statistics**: Get a high-level overview of total users, pending approvals, assignments, and submissions.
- **Danger Zone**: Secure, high-impact actions like resetting the portal by deleting all assignments and submissions.

### 📈 Monitor Features
- **Assignment CRUD**: Create, read, update, and delete assignments using a rich text editor.
- **File Attachments**: Add optional attachments (e.g., rubrics, templates) to assignments.
- **Submission Tracking**: View a detailed list of all submissions for each assignment.
- **Deadline Reminders**: Send email reminders to students who have not yet submitted.
- **Email & Purge**: A powerful one-click action to zip all submissions, email them to a specified address, and then permanently delete the assignment and its data from the portal.

### 🎓 Student Features
- **Assignment Dashboard**: View all available assignments with clear descriptions and deadlines.
- **Real-time Countdown**: A live countdown timer for each assignment deadline.
- **Secure File Upload**: A dedicated submission portal for each assignment.
- **Strict Validation**: Enforces `.pdf` file type and a specific Chinese character naming convention.
- **Submission History**: View a complete history of all your past submissions.

---

## 🛠️ Technology Stack

| Area      | Technology / Library                                       |
|-----------|------------------------------------------------------------|
| **Frontend**  | React, TypeScript, React Router, Redux Toolkit Query, TailwindCSS, Vite |
| **Backend**   | Node.js, Express.js, TypeScript, Mongoose (MongoDB)        |
| **Database**  | MongoDB Atlas                                              |
| **Authentication** | JSON Web Token (JWT), bcrypt.js                            |
| **File Handling** | Multer (for uploads), Archiver (for zipping)             |
| **Emailing**  | Nodemailer                                                 |
| **Validation**| Joi                                                        |
| **Deployment**| Vercel                                                     |

---

## 🏁 Getting Started

Follow these instructions to get the project running on your local machine for development and testing.

### Prerequisites
- Node.js (v18 or later)
- npm or yarn
- A free [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) account

### Backend Setup

1.  **Navigate to the backend directory:**
    ```bash
    cd backend
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Create an environment file:**
    Create a new file named `.env` in the `backend` directory. Copy the contents of `.env.example` (or the template below) into it and fill in your details.

    ```env
    # --- MongoDB ---
    # Get this from your MongoDB Atlas dashboard
    MONGO_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/<database>?retryWrites=true&w=majority

    # --- JWT Secrets ---
    # Use a long, random string for security
    JWT_SECRET=your_super_strong_jwt_secret_key
    JWT_EXPIRES=90d

    # --- Admin User for Seeding (First-time setup) ---
    ADMIN_EMAIL=admin@example.com
    ADMIN_PASSWORD=your_secure_admin_password

    # --- Nodemailer (for sending emails) ---
    # Example using Gmail, but any SMTP service works
    EMAIL_HOST=smtp.gmail.com
    EMAIL_PORT=587
    EMAIL_USER=your_email@gmail.com
    EMAIL_PASS=your_gmail_app_password 
    EMAIL_FROM="Assignment Portal <your_email@gmail.com>"
    EMAIL_TO=the_email_where_submissions_should_be_sent@example.com
    ```
    > **Important:** For MongoDB Atlas, ensure you have **whitelisted your IP address** under `Network Access` to allow your local machine to connect.

4.  **Seed the first Admin user (One-time command):**
    This command reads the `ADMIN_EMAIL` and `ADMIN_PASSWORD` from your `.env` file and creates the first admin account.
    ```bash
    npm run seed:admin
    ```

5.  **Start the backend server:**
    ```bash
    npm run dev
    ```
    Your backend API is now running at `http://localhost:4000`.

### Frontend Setup

1.  **Open a new terminal window.**
2.  **Navigate to the project's root directory** (the one containing `frontend` and `backend`).
3.  **Install dependencies:**
    ```bash
    npm install
    ```
4.  **Start the frontend server:**
    ```bash
    npm run dev
    ```
    Your React application will open in your browser at `http://localhost:5173`.

You can now log in with the admin credentials you created in the seeding step!

---

## ☁️ Deployment

This project is pre-configured for a seamless deployment to **Vercel**.

1.  **Push to GitHub:** Create a repository on GitHub and push your project code.
2.  **Import to Vercel:** Log in to Vercel, click "Add New... -> Project", and select your GitHub repository.
3.  **Configure Environment Variables:** This is the most important step. In your Vercel project's settings, go to **Environment Variables**. Add all the variables from your local `backend/.env` file.
4.  **Deploy:** Trigger a deployment. Vercel will automatically detect the monorepo setup, build the backend and frontend, and configure the serverless functions and rewrites for you.

---

## 📜 License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.
