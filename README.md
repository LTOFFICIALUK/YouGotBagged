# YouGotBagged - Unclaimed Fees Dashboard

A modern, beautiful dashboard for tracking and managing unclaimed fees from your Bags tokens. Built with Next.js, TypeScript, and Tailwind CSS.

## Features

- 🎨 **Modern UI**: Beautiful glass-morphism design with smooth animations
- 📊 **Real-time Data**: Live tracking of unclaimed fees from the Bags API
- 💰 **Fee Analytics**: Total unclaimed value and token statistics
- 🔄 **Auto-refresh**: Manual refresh functionality to get latest data
- 📱 **Responsive**: Works perfectly on desktop and mobile devices
- ⚡ **Fast**: Built with Next.js for optimal performance
- 🎯 **Focused**: Only shows tokens with unclaimed fees

## Tech Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS with custom design system
- **API**: Bags SDK for Solana token fee management
- **Icons**: Lucide React
- **Animations**: Tailwind CSS Animate

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Bags API key (already configured)

### Local Development

1. **Clone the repository:**
```bash
git clone <repository-url>
cd YouGotBagged-Repo
```

2. **Install dependencies:**
```bash
npm install
# or
yarn install
```

3. **Set up environment variables (optional for local development):**
Create a `.env.local` file in the root directory:
```bash
# Bags API Configuration
BAGS_API_KEY=bags_prod_hpcZlGVqjTEOFwgq7sRue9ob19oOEGDP2GEFg2biBE4

# Next.js Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

4. **Run the development server:**
```bash
npm run dev
# or
yarn dev
```

5. **Open your browser:**
Navigate to [http://localhost:3000](http://localhost:3000) to see the result.

### Vercel Deployment

1. **Push your code to GitHub**

2. **Connect to Vercel:**
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Vercel will automatically detect it's a Next.js project

3. **Set environment variables in Vercel:**
   - In your Vercel project dashboard, go to Settings → Environment Variables
   - Add the following variable:
     - **Name:** `BAGS_API_KEY`
     - **Value:** `bags_prod_hpcZlGVqjTEOFwgq7sRue9ob19oOEGDP2GEFg2biBE4`
     - **Environment:** Production, Preview, Development

4. **Deploy:**
   - Vercel will automatically deploy your app
   - Your app will be available at your Vercel URL

### Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `BAGS_API_KEY` | Your Bags API key for accessing token data | Yes | Hardcoded fallback |
| `NEXT_PUBLIC_APP_URL` | Your app's URL (auto-detected by Vercel) | No | Auto-detected |

## Project Structure

```
YouGotBagged-Repo/
├── app/
│   ├── api/
│   │   └── bags/
│   │       └── route.ts     # API route for Bags API proxy
│   ├── globals.css          # Global styles with custom design tokens
│   ├── layout.tsx           # Root layout component
│   └── page.tsx             # Main dashboard page
├── components/
│   ├── ApiDebug.tsx         # API connection status component
│   ├── Header.tsx           # Dashboard header component
│   ├── Hero.tsx             # Profile/wallet section component
│   └── TokenCard.tsx        # Individual token card component
├── lib/
│   ├── bags-api.ts          # Client-side API utilities
│   └── utils.ts             # Common utility functions
├── public/
│   ├── logo.png             # Main logo image
│   └── Logo-X.png           # X/Twitter logo for Hero section
├── tailwind.config.ts       # Tailwind configuration
├── package.json             # Dependencies and scripts
└── README.md               # Project documentation
```

## API Configuration

The dashboard is pre-configured with the Bags API key and endpoints:

- **API Key**: `bags_prod_hpcZlGVqjTEOFwgq7sRue9ob19oOEGDP2GEFg2biBE4`
- **Base URL**: `https://public-api-v2.bags.fm/api/v1`

## Features Explained

### Dashboard Overview
- **Total Unclaimed**: Shows the total value of all unclaimed fees
- **Tokens with Fees**: Count of tokens that have unclaimed fees
- **Last Updated**: Timestamp of the last data refresh

### Token Cards
Each token card displays:
- Token name and symbol
- Token address (truncated)
- Unclaimed amount and total fees
- Claim progress bar
- Last claimed timestamp
- Direct link to view on Bags.fm

### Color Scheme
The dashboard uses a dark theme with the custom background color `#101114` and a carefully selected color palette for optimal readability and modern aesthetics.

## Customization

### Colors
The color scheme is defined in `app/globals.css` and `tailwind.config.ts`. You can modify the CSS custom properties to change the theme:

```css
:root {
  --background: #101114;
  --foreground: #ffffff;
  --primary: #3b82f6;
  /* ... other colors */
}
```

### Styling
The dashboard uses custom utility classes for glass effects and animations:
- `.glass-effect`: Glass-morphism background
- `.card-hover`: Hover animations for cards
- `.animate-fade-in`: Fade-in animation
- `.animate-slide-in`: Slide-in animation

## API Integration

The dashboard uses a Next.js API route (`/api/bags`) to proxy requests to the Bags API, solving CORS issues and providing better error handling.

### API Route Endpoints

- **`GET /api/bags?action=test`**: Test Bags API connectivity
- **`GET /api/bags?action=unclaimed-fees`**: Get all tokens with unclaimed fees
- **`GET /api/bags?action=total-value`**: Get total unclaimed fees value

### How It Works

1. **Client-side** makes requests to our API route
2. **API route** proxies requests to Bags API with proper authentication
3. **Server-side** handles CORS, rate limiting, and error handling
4. **Response** is returned to the client with proper formatting

### Benefits

- ✅ **No CORS issues** - All external API calls happen server-side
- ✅ **Rate limiting protection** - Server-side calls prevent hitting limits
- ✅ **Better error handling** - Centralized error management
- ✅ **Environment variable support** - Secure API key management
- ✅ **Vercel compatibility** - Works seamlessly on serverless functions

The dashboard integrates with the Bags API to:
- Fetch all token positions
- Filter for unclaimed fees
- Get detailed token information
- Calculate total unclaimed values

## Building for Production

```bash
npm run build
npm start
```

## Troubleshooting

### Common Issues

#### 1. **API Connection Issues**
If you see "API Error" in the status indicator:
- Check that your `BAGS_API_KEY` is correct
- Verify the API key has proper permissions
- Check the browser console for detailed error messages

#### 2. **No Data Displayed**
If the dashboard shows no tokens:
- The API might be returning empty results (no unclaimed fees)
- Check the API status indicator for connection issues
- Verify the Bags API endpoints are working

#### 3. **CORS Errors (Development)**
If you see CORS errors in the console:
- The app now uses API routes to avoid CORS issues
- Make sure you're running the latest version
- Check that the API route is working correctly

#### 4. **Vercel Deployment Issues**
If the app doesn't work on Vercel:
- Ensure environment variables are set in Vercel dashboard
- Check Vercel function logs for API errors
- Verify the API route is being called correctly

### Debug Mode

The dashboard includes a debug component that shows:
- Real-time API connection status
- Detailed error messages
- API endpoint testing results

To see debug information, check the top-right corner of the dashboard.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support with the Bags API, visit the [official documentation](https://bags.mintlify.app).

---

Built with ❤️ for the Bags community 