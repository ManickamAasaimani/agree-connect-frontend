# Agri Connect Hub — Frontend (Angular 17)

<video controls src="agri_Project-1.mp4" title="Title"></video>

## Requirements
- Node.js 18+
- Angular CLI: `npm install -g @angular/cli`
- Backend running at http://localhost:8080

## Quick Start
```bash
npm install
ng serve
```
App runs at: http://localhost:4200

## Default Admin Login
- **Email:** admin@gmail.com
- **Password:** 12345

## Features
- 🌾 Crop marketplace with live market prices
- 🚜 Vehicle hire & booking
- 👷 Manpower listing & hire
- 📦 Order management
- 💬 Real-time chat
- 🆔 KYC Verification (Aadhaar + OTP, simulated for demo)
- 🌑 Terra Dark theme

## KYC Module (Dashboard)
- Non-verified users see a yellow banner on Dashboard
- Enter 12-digit Aadhaar → Click "Send OTP"
- OTP is displayed on screen (simulated, not real SMS)
- Enter OTP → Click "Verify"
- On success: green "KYC Verified" badge shown
