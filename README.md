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

   For the **backend (server)**:
   Navigate to the `server` directory and copy the `.env.example` file to create your own `.env` file:
   ```bash
   cd server
   cp .env.example .env
   ```
   Open the newly created `.env` file and replace the placeholder values with your actual API keys.

   For the **frontend (client)**:
   Navigate to the `client` directory and copy the `.env.example` file to create your own `.env` file:
   ```bash
   cd client
   cp .env.example .env
   ```
   Open the `.env` file and replace the values with your actual client IDs.

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

### OAuth Configuration (Google & LinkedIn)

To enable Google and LinkedIn Sign-In/Up, you must configure developer applications and obtain Client IDs and Secrets.

#### Google Setup
1. Go to the [Google Cloud Console](https://console.cloud.google.com/).
2. Create a new project.
3. Navigate to **APIs & Services > Credentials**.
4. Create an **OAuth 2.0 Client ID** (Web application).
5. Add `http://localhost:5173` to the Authorized JavaScript origins.
6. Add `http://localhost:5173` to the Authorized redirect URIs.
7. Copy your Client ID to both `server/.env` (`GOOGLE_CLIENT_ID`) and `client/.env` (`VITE_GOOGLE_CLIENT_ID`).

#### LinkedIn Setup
1. Go to the [LinkedIn Developer Portal](https://developer.linkedin.com/).
2. Create an App.
3. Under the **Auth** tab, copy your Client ID and Client Secret.
4. Add `http://localhost:5173/auth/linkedin/callback` to your Authorized redirect URLs.
5. Under the **Products** tab, request access to **Sign In with LinkedIn using OpenID Connect**.
6. Add your Client ID to `client/.env` (`VITE_LINKEDIN_CLIENT_ID`) and `server/.env` (`LINKEDIN_CLIENT_ID`).
7. Add your Client Secret to `server/.env` (`LINKEDIN_CLIENT_SECRET`).

Please do not commit your real API keys to version control.
