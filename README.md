# x3dh-messenger 🛡️

x3dh-messenger is a secure web-based chat application built with Node.js, Express, and MySQL. It features user authentication using JWT and bcrypt, real-time-ish messaging, and a clean, responsive UI. Designed with the X3DH cryptographic protocol in mind, it allows users to register, manage contacts, and exchange encrypted messages securely.

## Features ✨
* **Secure Authentication:** User registration and login utilizing `bcryptjs` for password hashing and `jsonwebtoken` (JWT) for secure session management.
* **Database Integration:** Relational data storage using MySQL (`mysql2`).
* **Cryptographic Protocol Integration:** Frontend setup for generating X3DH security keys.
* **Responsive UI:** Clean HTML/CSS interface for chatting, logging in, and user registration.
* **RESTful API:** Express.js backend handling user management and message routing.

## Tech Stack 🛠️
* **Backend:** Node.js, Express.js
* **Database:** MySQL
* **Security:** bcryptjs, jsonwebtoken (JWT), dotenv
* **Frontend:** HTML5, CSS3, Vanilla JavaScript

## Prerequisites 📋
Before you begin, ensure you have the following installed on your machine:
* [Node.js](https://nodejs.org/) (v18 or higher recommended)
* [MySQL Server](https://dev.mysql.com/downloads/mysql/)

## Installation & Setup 🚀

**1. Clone the repository**
bash
git clone https://github.com/mohammadmaazqureshi3-oss/x3dh-Messenge.git
cd x3dh-Messenge


**2. Install dependencies**
bash
npm install


**3. Database Setup**
Log into your MySQL instance and run the following SQL commands to create the database and required tables:

sql
CREATE DATABASE x3dh_messenger;
USE x3dh_messenger;

CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  identity_key TEXT,
  signed_prekey TEXT,
  signed_prekey_signature TEXT
);

CREATE TABLE messages (
  id INT AUTO_INCREMENT PRIMARY KEY,
  sender_id INT NOT NULL,
  recipient_id INT NOT NULL,
  ciphertext TEXT NOT NULL,
  ephemeral_key TEXT,
  FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (recipient_id) REFERENCES users(id) ON DELETE CASCADE
);


**4. Environment Variables**
Create a `.env` file in the root directory of your project and add the following variables. Update the database credentials to match your local MySQL setup:

env
DB_HOST=127.0.0.1
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=x3dh_messenger
JWT_SECRET=supersecret_keys_2025


**5. Start the Server**
\`\`\`bash
node server.js
\`\`\`
*The server will start running at `http://localhost:3000`.*

## Usage 💡
1. Navigate to `http://localhost:3000/register.html` to create a new account and generate your security keys.
2. Go to `http://localhost:3000/login.html` to log in.
3. Once logged in, you will be redirected to the chat interface where you can select users and send secure messages!

## License 📄
This project is licensed under the ISC License.
