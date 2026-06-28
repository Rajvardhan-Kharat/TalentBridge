# TalentBridge

A full-stack application built with React (Vite) on the frontend and Node.js/Express on the backend.

## Prerequisites

- Node.js installed
- MongoDB installed and running locally (or provide a MongoDB URI)
- API keys for Gemini, Groq, Cloudinary, and Adzuna

## Setup Instructions

1. **Clone the repository**

2. **Install dependencies**

   For the client:
   ```bash
   cd client
   npm install
   ```

   For the server:
   ```bash
   cd server
   npm install
   ```

3. **Environment Configuration**

   Navigate to the `server` directory and copy the `.env.example` file to create your own `.env` file:
   ```bash
   cd server
   cp .env.example .env
   ```
   Open the newly created `.env` file and replace the placeholder values (e.g., `YOUR_GEMINI_API_KEY_HERE`) with your actual API keys.

4. **Run the application**

   Start the backend server:
   ```bash
   cd server
   npm run dev
   ```

   Start the frontend client:
   ```bash
   cd client
   npm run dev
   ```

## API Keys Required

You will need to obtain keys for the following services to run all features:
- **JWT Secret**: A random string for token generation.
- **Gemini**: Primary AI capabilities.
- **Groq**: Fallback AI capabilities.
- **Cloudinary**: For image/file uploads.
- **Adzuna**: For job listings.

Please do not commit your real API keys to version control.
