Swiftly Native 🚀

Swiftly Native is a React Native based Home Service Booking Application where users can register/login, browse services, book services, manage providers, and receive booking confirmation emails using Nodemailer.

Built using:

React Native
React Navigation
Axios
Nodemailer
📱 Features
User Authentication
Register/Login
Forgot Password
Logout
Dashboard
User Profile
Services Listing
Provider Services
Service Booking
COD/Card Payment
Booking Confirmation Email
Responsive UI
React Native Web Support
📂 Project Structure
Swiftly-Native/
│
├── src/
│   ├── api/
│   ├── assets/
│   ├── components/
│   ├── context/
│   ├── navigation/
│   ├── screens/
│   ├── styles/
│   └── utils/
│
├── server/
│
├── App.js
├── package.json
└── README.md
⚙️ Frontend Setup
1️⃣ Clone Repository
git clone YOUR_GITHUB_REPOSITORY_LINK
2️⃣ Move Into Project
cd Swiftly-Native
3️⃣ Install Frontend Dependencies
npm install
4️⃣ Install Required Packages
npm install @react-navigation/native
npm install @react-navigation/native-stack
npm install @react-navigation/bottom-tabs
npm install @react-navigation/drawer
npm install react-native-safe-area-context
npm install react-native-screens
npm install react-native-gesture-handler
npm install react-native-reanimated
npm install react-native-vector-icons
npm install axios
npm install @react-native-async-storage/async-storage
▶️ Run Frontend
Start Metro Server
npx react-native start
Run Android
npx react-native run-android
Run Web
npm run web


⚙️ Backend Setup
Move To Server Folder
cd server
Install Backend Dependencies
npm install
Install Backend Packages
npm install express mongoose cors dotenv bcryptjs jsonwebtoken nodemailer multer
Start Backend Server
npm start


🍃 MongoDB Setup

Create .env file inside server/

PORT=5000

MONGO_URI=YOUR_MONGODB_CONNECTION

JWT_SECRET=YOUR_SECRET_KEY

EMAIL=YOUR_EMAIL@gmail.com

EMAIL_PASSWORD=YOUR_APP_PASSWORD
✉️ Nodemailer Setup

Enable:

2-Step Verification
App Password

Use generated App Password inside .env

🔐 Test Login
Email: admin@gmail.com
Password: 123456
📋 Booking Flow
Landing
→ Register
→ Login
→ Dashboard
→ Services
→ Booking Form
→ Payment Option
→ Booking Success
→ Email Confirmation


🛠️ Tech Stack
Frontend
React Native
React Navigation
Axios
AsyncStorage
MongoDB
Nodemailer
🚀 Future Improvements
Razorpay Integration
Firebase Authentication
Push Notifications
Live Tracking
Redux Toolkit
Dark Mode
Real-time Chat
Admin Analytics
👨‍💻 Developer

