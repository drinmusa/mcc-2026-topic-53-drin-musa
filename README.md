# 📱 Full Stack Monorepo (Expo + Express + TypeScript)

This repository contains a full-stack application with:

- 📱 Mobile app built with **Expo (React Native)**
- 🖥️ Backend API built with **Node.js + Express + TypeScript**
- 🗄️ Database layer using **Knex + Objection.js**

---

## 📁 Project Structure

---

## 🚀 Tech Stack

### Mobile

- Expo
- React Native
- Axios
- TypeScript

### Backend

- Node.js
- Express
- TypeScript
- Knex
- Objection.js
- PostgreSQL

---

## ⚙️ Getting Started

### 1. Clone the repo

```bash
git clone https://github.com/drinmusa/mcc-2026-topic-53-drin-musa.git

cd mobile-photo-backup

Mobile Setup
cd mobile
npm install
cp .env.example .env
set env values (if testing on physical device use your IP instead of localhost)
npm start


Server Setup
cd server
npm install
cp .env.example .env
npm run migrate (Execute migrations)
npm run seed (Execute seeders)
npm run start
```
