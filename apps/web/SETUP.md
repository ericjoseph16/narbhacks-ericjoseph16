# SkillDrill Authentication Setup Guide

## Environment Variables

Create a `.env.local` file in the `apps/web` directory with the following variables:

```bash
# Clerk Authentication (Required)
# Get these from: https://dashboard.clerk.com/
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_publishable_key_here
CLERK_SECRET_KEY=sk_test_your_secret_key_here

# Optional Clerk URLs (Clerk will auto-detect these)
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard

# Convex Backend (Optional for now)
# Get this from: https://dashboard.convex.dev/
NEXT_PUBLIC_CONVEX_URL=https://your-deployment-name.convex.cloud

# Google Gemini (Optional for future AI features)
# Get this from: https://makersuite.google.com/app/apikey
GOOGLE_GEMINI_API_KEY=your_gemini_api_key_here
```

## Setup Steps

### 1. Clerk Setup (Required)
1. Go to [Clerk Dashboard](https://dashboard.clerk.com/)
2. Create a new application
3. Copy your Publishable Key and Secret Key
4. Add them to your `.env.local` file
5. **Important**: Without these keys, Clerk runs in "keyless mode" which has limitations

### 2. Convex Setup (Optional for now)
1. Go to [Convex Dashboard](https://dashboard.convex.dev/)
2. Create a new project
3. Copy your deployment URL
4. Add it to your `.env.local` file

### 3. Google Gemini Setup (Optional for future features)
1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create an API key
3. Add it to your `.env.local` file

## Testing the Authentication

1. Start the development server:
   ```bash
   cd apps/web
   pnpm run dev
   ```

2. Visit `http://localhost:3002` (or whatever port is shown)
3. You should see the landing page with Sign In/Sign Up buttons
4. Click "Sign Up" to create an account
5. After signing up, you'll be redirected to `/dashboard`
6. Try accessing `/dashboard` directly - it should be protected
7. Try signing out and accessing `/dashboard` - you should be redirected to `/sign-in`

## Routes Overview

- `/` - Landing page (public)
- `/sign-in` - Sign in page (public)
- `/sign-up` - Sign up page (public)
- `/dashboard` - Protected dashboard (requires authentication)
- `/test-auth` - Test page showing user info (protected)

## Features Implemented

✅ Clean sign-in and sign-up pages using Clerk components
✅ Protected dashboard route with authentication check
✅ Automatic redirects for unauthenticated users
✅ Clean header with user info and sign out button
✅ Responsive design with Tailwind CSS
✅ Middleware for route protection
✅ Proper error handling and type safety

## Troubleshooting

### "Clerk is in keyless mode"
- This means you haven't set up your Clerk keys
- Follow the Clerk setup steps above
- Add your keys to `.env.local`
- Restart the development server

### "currentUser is not a function"
- Fixed! We're now using the correct `auth()` function from `@clerk/nextjs/server`
- This works with Clerk v6.23.0

### "auth is not a function"
- Make sure you're importing from `@clerk/nextjs/server`
- Check that your Clerk version is compatible

### Port 3000 is in use
- The app will automatically use the next available port (3002, 3003, etc.)
- Check the terminal output for the correct URL 