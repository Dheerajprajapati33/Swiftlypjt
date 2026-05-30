const express = require('express');
require('dotenv').config();
const cors = require('cors');
const fs = require('fs');
const path = require('path');
// nodemailer
const nodemailer = require('nodemailer');
// AI keys
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();

//to run on localhost port 5000
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const DB_FILE = path.join(__dirname, 'database.json');

// ADD DEFAULT_SERVICES
const DEFAULT_SERVICES = [
  {
    _id: '1',
    name: 'Premium Home Cleaning',
    category: 'Cleaning',
    providerName: 'John Cleaning Services Ltd.',
    providerEmail: 'john@cleaning.com',
    description: 'Complete home dusting, kitchen deep scrub, floor sanitization, bathroom disinfection. Eco-friendly cleaning agents used.',
    price: '$80/hr',
    providerAvatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=100',
    contact: '555-0101'
  },
  {
    _id: '2',
    name: 'Electrical Leakage Repair',
    category: 'Electrical',
    providerName: 'Mike Sparks & Wiring',
    providerEmail: 'mike@sparks.com',
    description: 'Diagnose short circuits, broken switches, socket installations, safety breaker audits and rewiring.',
    price: '$95/hr',
    providerAvatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=100',
    contact: '555-0102'
  },
  {
    _id: '3',
    name: 'Emergency Pipeline Repair',
    category: 'Plumbing',
    providerName: 'Alex Pipemasters Ltd.',
    providerEmail: 'alex@pipe.com',
    description: 'Clogged drains clearing, kitchen pipe leakage repairs, bathroom faucet installations, and sink replacements.',
    price: '$75/hr',
    providerAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=100',
    contact: '555-0103'
  },
  {
    _id: '4',
    name: 'Pest Control & Spraying',
    category: 'Sanitization',
    providerName: 'EcoShield Pest Solvers',
    providerEmail: 'ecoshield@pest.com',
    description: 'Targeted organic spray sanitization for bedbugs, roaches, termites, and rodents. 100% safe for pets and kids.',
    price: '$120/flat',
    providerAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=100',
    contact: '555-0104'
  }
];

// Initialize database
if (!fs.existsSync(DB_FILE)) {
  fs.writeFileSync(DB_FILE, JSON.stringify({ users: [], bookings: [], services: DEFAULT_SERVICES }, null, 2));
} 
else {
  try {
    const data = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
    if (!data.services) {
      data.services = DEFAULT_SERVICES;
      fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
    }
  } catch (e) {
    fs.writeFileSync(DB_FILE, JSON.stringify({ users: [], bookings: [], services: DEFAULT_SERVICES }, null, 2));
  }
}

function readDB() {
  try {
    const data = fs.readFileSync(DB_FILE, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    return { users: [], bookings: [], services: DEFAULT_SERVICES };
  }
}

function writeDB(data) {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}

// SMTP Transporter setup ( test email)
let transporter = null;
let testAccountInfo = null;

async function setupMail() {

  // Check if custom SMTP credentials are provided in environment variables
  if (process.env.SMTP_USER && process.env.SMTP_PASS) {
    try {
      console.log("Setting up mail transporter via custom SMTP credentials...");
      transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || "smtp.gmail.com",
        port: parseInt(process.env.SMTP_PORT || "587"),
        secure: process.env.SMTP_SECURE === "true", // true for 465, false for others
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });
      console.log(`SMTP configured. Custom SMTP user: ${process.env.SMTP_USER}`);
      return;
    } catch (e) {
      console.warn("Failed to initialize custom SMTP transporter. Falling back to Ethereal Email...", e.message);
    }
  }

  try {
    console.log("Setting up mail transporter via Ethereal Email...");
    let testAccount = await nodemailer.createTestAccount();
    testAccountInfo = testAccount;
    transporter = nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
    console.log(`SMTP configured. Ethereal Email user: ${testAccount.user}`);
  } catch (error) {
    console.warn("Unable to connect to Ethereal SMTP. Fallback will log booking details to console.", error.message);
  }
}

setupMail();

// Register Endpoint
app.post('/api/auth/register', (req, res) => {
  const { name, email, profileUrl, role, password } = req.body;

  //for validation
  if (!name || !email || !password || !role) {
    return res.status(400).json({ message: 'Name, email, role, and password are required' });
  }

  const db = readDB();
  const userExists = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());

  if (userExists) {
    return res.status(400).json({ message: 'User already exists' });
  }

  const newUser = {
    id: Date.now().toString(),
    name,
    email: email.toLowerCase(),
    profileUrl: profileUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
    role: role, // customer or service_provider
    password 
  };

  db.users.push(newUser);
  writeDB(db);

  // Return user without password
  const { password: _, ...userWithoutPassword } = newUser;
  res.status(201).json(userWithoutPassword);
});

// Login Endpoint
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  const db = readDB();
  const user = db.users.find(
    u => u.email.toLowerCase() === email.toLowerCase() && u.password === password
  );

  if (!user) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  const { password: _, ...userWithoutPassword } = user;
  res.json(userWithoutPassword);
});

// Dynamic Services endpoint: Get all services
app.get('/api/services', (req, res) => {
  const db = readDB();
  res.json(db.services || []);
});

// Setup/Update Service Profile (for Service Providers)
app.post('/api/services/setup', (req, res) => {
  const { providerEmail, providerName, providerAvatar, name, description, price, contact } = req.body;

  if (!providerEmail || !providerName || !name || !description || !price || !contact) {
    return res.status(400).json({ message: 'All service details (name, description, price, contact) are required.' });
  }

  const db = readDB();
  if (!db.services) {
    db.services = [];
  }

  // Find if provider already configured a service
  const existingServiceIndex = db.services.findIndex(
    s => s.providerEmail.toLowerCase() === providerEmail.toLowerCase()
  );

  const updatedService = {
    _id: existingServiceIndex !== -1 ? db.services[existingServiceIndex]._id : Date.now().toString(),
    name,
    category: name.includes('Clean') ? 'Cleaning' : name.includes('Electrical') || name.includes('Wiring') ? 'Electrical' : name.includes('Plumb') ? 'Plumbing' : 'General',
    providerName,
    providerEmail: providerEmail.toLowerCase(),
    description,
    price,
    providerAvatar: providerAvatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150',
    contact,
  };

  if (existingServiceIndex !== -1) {
    db.services[existingServiceIndex] = updatedService;
  } else {
    db.services.push(updatedService);
  }

  writeDB(db);
  res.json({ success: true, service: updatedService });
});

// Get Bookings for a Customer
app.get('/api/bookings', (req, res) => {
  const { email } = req.query;
  if (!email) {
    return res.status(400).json({ message: 'Email parameter is required' });
  }

  const db = readDB();
  const userBookings = db.bookings.filter(b => b.userEmail.toLowerCase() === email.toLowerCase());
  res.json(userBookings);
});

// Get Bookings for a Service Provider
app.get('/api/bookings/provider', (req, res) => {
  const { email } = req.query;
  if (!email) {
    return res.status(400).json({ message: 'Email parameter is required' });
  }

  const db = readDB();
  const providerBookings = db.bookings.filter(
    b => b.providerEmail && b.providerEmail.toLowerCase() === email.toLowerCase()
  );
  res.json(providerBookings);
});

// Update Booking Status Endpoint
app.patch('/api/bookings/:id/status', (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!status) {
    return res.status(400).json({ message: 'Status is required' });
  }

  const db = readDB();
  const bookingIndex = db.bookings.findIndex(b => b.id === id);

  if (bookingIndex === -1) {
    return res.status(404).json({ message: 'Booking not found' });
  }

  db.bookings[bookingIndex].status = status;
  writeDB(db);

  res.json({ success: true, booking: db.bookings[bookingIndex] });
});

// Book service Endpoint
app.post('/api/bookings/book', async (req, res) => {
  const { userEmail, userName, serviceName, providerEmail, date, time, paymentMethod } = req.body;

  if (!userEmail || !serviceName || !date || !time || !paymentMethod) {
    return res.status(400).json({ message: 'Missing booking details' });
  }

  const db = readDB();
  const newBooking = {
    id: Date.now().toString(),
    userEmail: userEmail.toLowerCase(),
    userName,
    serviceName,
    providerEmail: providerEmail ? providerEmail.toLowerCase() : 'unknown@provider.com',
    date,
    time,
    paymentMethod,
    status: 'processing', // Default status
    createdAt: new Date().toISOString()
  };

  db.bookings.push(newBooking);
  writeDB(db);

  // Send Confirmation Email using Nodemailer
  let emailSent = false;
  let previewUrl = null;

  if (transporter) {
    try {
      const mailOptions = {
        from: '"Swiftly Home Services" <no-reply@swiftly.com>',
        to: userEmail,
        subject: `Booking Confirmed: ${serviceName} - Swiftly`,
        text: `Hello ${userName || 'Valued Customer'},\n\nYour service booking for "${serviceName}" has been successfully scheduled!\n\nBooking Details:\n- Date: ${date}\n- Time: ${time}\n- Payment Option: ${paymentMethod === 'cod' ? 'Cash on Delivery (COD)' : 'Card Payment'}\n- Status: Processing\n\nThank you for choosing Swiftly!\n\nBest regards,\nSwiftly Team`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 12px; background-color: #ffffff;">
            <h2 style="color: #6C63FF; text-align: center;">Booking Confirmed!</h2>
            <p>Hello <strong>${userName || 'Valued Customer'}</strong>,</p>
            <p>Your service booking with <strong>Swiftly</strong> has been successfully scheduled. Here are your booking details:</p>
            

            <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
              <tr style="background-color: #f8f9fa;">
                <td style="padding: 10px; border: 1px solid #ddd;"><strong>Service</strong></td>
                <td style="padding: 10px; border: 1px solid #ddd;">${serviceName}</td>
              </tr>
              <tr>
                <td style="padding: 10px; border: 1px solid #ddd;"><strong>Date</strong></td>
                <td style="padding: 10px; border: 1px solid #ddd;">${date}</td>
              </tr>
              <tr style="background-color: #f8f9fa;">
                <td style="padding: 10px; border: 1px solid #ddd;"><strong>Time</strong></td>
                <td style="padding: 10px; border: 1px solid #ddd;">${time}</td>
              </tr>
              <tr>
                <td style="padding: 10px; border: 1px solid #ddd;"><strong>Payment Method</strong></td>
                <td style="padding: 10px; border: 1px solid #ddd;">${paymentMethod === 'cod' ? 'Cash on Delivery (COD)' : 'Card Payment'}</td>
              </tr>
              <tr style="background-color: #f8f9fa;">
                <td style="padding: 10px; border: 1px solid #ddd;"><strong>Status</strong></td>
                <td style="padding: 10px; border: 1px solid #ddd;"><span style="color: #FFA500; font-weight: bold;">Processing</span></td>
              </tr>
            </table>

            
            <p style="text-align: center; margin-top: 30px;">
              <span style="background-color: #6C63FF; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold;">Booking ID: #${newBooking.id}</span>
            </p>
            <hr style="border: 0; border-top: 1px solid #ddd; margin: 30px 0;">
            <p style="font-size: 12px; color: #888; text-align: center;">This is an automated email confirmation from Swiftly Home Services. Please do not reply directly to this email.</p>
          </div>
        `
      };

      const info = await transporter.sendMail(mailOptions);
      previewUrl = nodemailer.getTestMessageUrl(info);
      console.log(`Booking email successfully sent to ${userEmail}.`);
      console.log(`Preview Email URL: ${previewUrl}`);
      emailSent = true;
    } catch (mailError) {
      console.error("Nodemailer failed to send email:", mailError.message);
    }
  } else {
    console.log("No SMTP Transporter configured. Booking logged to console:\n", newBooking);
  }

  res.status(201).json({
    success: true,
    booking: newBooking,
    emailSent,
    previewUrl
  });
});

app.post('/api/ai/diagnose', async (req, res) => {
  const { query } = req.body;

  if (!query || !query.trim()) {
    return res.status(400).json({ message: 'Query is required for AI diagnosis.' });
  }

  // API key
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey.trim() === '' || apiKey.startsWith('your_')) {
    return res.status(200).json({
      success: false,
      errorType: 'MISSING_API_KEY',
      message: 'Gemini API Key is not configured on the backend server. Please get a free API Key from Google AI Studio (https://aistudio.google.com/) and configure GEMINI_API_KEY in your server/.env file to enable the AI assistant!'
    });
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      generationConfig: { responseMimeType: 'application/json' }
    });

    const prompt = `You are a helpful, professional AI diagnostic helper for a home services mobile application called "Swiftly".
Your job is to analyze the customer's household issue and output a structured JSON response identifying the problem, estimating its urgency, matching it to one of the app's service categories, and providing DIY safety action steps.

Here are the service categories available in the app:
1. "Cleaning" (for dusting, bathroom/kitchen deep cleaning, home sanitation)
2. "Electrical" (for wiring, short circuits, breaker audits, socket repairs)
3. "Plumbing" (for pipes, clogged drains, leaking faucets, sink replacements)
4. "Sanitization" (for pest control, termite spraying, roach/rodent removal)
5. "General" (for any issue that doesn't fit the above categories)

You must return a valid JSON object matching the following structure and no other text:
{
  "diagnosis": "A concise, professional explanation of what the issue likely is and what causes it.",
  "urgency": "Low" or "Medium" or "High" or "Emergency",
  "recommendedCategory": "Cleaning" or "Electrical" or "Plumbing" or "Sanitization" or "General",
  "actions": [
    "Safety or DIY step 1",
    "Safety or DIY step 2",
    "Safety or DIY step 3"
  ],
  "bookingSuggestionText": "A 1-sentence prompt recommending why hiring an expert in this category is best."
}

User's described issue:
"${query}"`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    
    let parsedResponse;
    try {
      parsedResponse = JSON.parse(responseText);
    } catch (parseError) {
      console.error("Failed to parse Gemini response as JSON:", responseText);
      return res.status(500).json({ success: false, message: 'AI returned an invalid response format. Please try again.' });
    }

    res.json({
      success: true,
      ...parsedResponse
    });

  } catch (error) {
    console.error("Gemini API call failed:", error);
    res.status(500).json({
      success: false,
      message: 'Could not connect to Gemini API. Check your API key or network connection.'
    });
  }
});

app.listen(PORT, () => {
  console.log(`Swiftly backend server is running on port ${PORT}`);
});
