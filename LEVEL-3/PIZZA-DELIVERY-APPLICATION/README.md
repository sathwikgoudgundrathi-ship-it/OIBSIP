# Level 3 - Pizza Delivery Application

A MERN-style pizza delivery application for the Oasis Infobyte Level 3 task.

## Features

- User and admin registration/login with JWT authentication
- Email verification and forgot password API structure
- Pizza builder with base, sauce, cheese and veggie choices
- Razorpay test-mode order creation placeholder
- MongoDB inventory models for bases, sauces, cheese and veggies
- Automatic stock deduction after order placement
- Low-stock email alert utility
- Admin order status updates: Order Received, In The Kitchen, Sent To Delivery
- User dashboard reflects latest order status

## Project Structure

- `backend`: Node.js, Express and MongoDB API
- `frontend`: React dashboard and pizza builder

## Run Locally

Create `.env` inside `backend` using `.env.example`, then run:

```bash
cd backend
npm install
npm run dev
```

In another terminal:

```bash
cd frontend
npm install
npm run dev
```

The frontend expects the API at `http://localhost:5000/api`.
