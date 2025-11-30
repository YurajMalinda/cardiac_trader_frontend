# Cardiac Trader - Frontend

A modern React-based frontend application for the Cardiac Trader stock trading game. Built with React 19, TypeScript, Vite, Ant Design, and Tailwind CSS.

**University of Bedfordshire (UOB) - Computer Science (CS) - Data Structures and Algorithms (DSA) Module Project**

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- Backend API running on http://localhost:8080

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run linter
npm run lint
```

The application will be available at http://localhost:5173

## 📁 Project Structure

```
cardiac_trader_frontend/
├── public/                 # Static assets
├── src/
│   ├── assets/            # Images and static files
│   ├── components/         # React components
│   │   ├── Header.tsx
│   │   ├── MarketPanel.tsx
│   │   ├── PortfolioPanel.tsx
│   │   ├── RoundResultModal.tsx
│   │   ├── ToolsPanel.tsx
│   │   └── TradingPanel.tsx
│   ├── config/            # Configuration files
│   ├── context/           # React Context providers
│   │   ├── AuthContext.tsx
│   │   └── GameContext.tsx
│   ├── pages/            # Page components
│   │   ├── Game.tsx
│   │   ├── Login.tsx
│   │   ├── Profile.tsx
│   │   ├── ResetPassword.tsx
│   │   └── VerifyEmail.tsx
│   ├── services/         # API service layer
│   │   └── api.ts
│   ├── types/           # TypeScript type definitions
│   │   └── index.ts
│   ├── utils/           # Utility functions
│   │   └── constants.ts
│   ├── App.tsx          # Main app component
│   ├── main.tsx         # Application entry point
│   └── index.css        # Global styles
├── index.html           # HTML template
├── package.json         # Dependencies and scripts
├── tsconfig.json        # TypeScript configuration
├── vite.config.ts       # Vite configuration
└── eslint.config.js     # ESLint configuration
```

## 🎨 Features

### Pages

- **Login/Register**: User authentication with email verification
- **Game**: Main trading interface with market, portfolio, and trading panels
- **Profile**: User profile management and settings
- **Password Reset**: Forgot password and reset functionality
- **Email Verification**: Email verification page

### Components

- **Header**: Navigation bar with user menu
- **MarketPanel**: Display available stocks with heart puzzle images
- **TradingPanel**: Buy/sell stock interface
- **PortfolioPanel**: View current holdings and portfolio value
- **ToolsPanel**: Access to hints and time boost tools
- **RoundResultModal**: Display round results and game completion

### Context Providers

- **AuthContext**: Manages user authentication state
- **GameContext**: Manages game session and round state

## 🛠️ Technology Stack

- **React 19.1.1**: UI library
- **TypeScript 5.9.3**: Type safety
- **Vite 7.1.7**: Build tool and dev server
- **Ant Design 5.27.6**: UI component library
- **Tailwind CSS 4.1.16**: Utility-first CSS framework
- **React Router DOM 7.9.5**: Client-side routing
- **Axios 1.13.1**: HTTP client
- **React Toastify 11.0.5**: Toast notifications

## ⚙️ Configuration

### API Base URL

Edit `src/utils/constants.ts` to change the API base URL:

```typescript
export const API_BASE_URL = "http://localhost:8080/api";
```

### Environment Variables

Create a `.env` file in the root directory (optional):

```env
VITE_API_BASE_URL=http://localhost:8080/api
```

## 🔐 Authentication

The application uses JWT-based authentication with httpOnly cookies for security:

- Tokens are automatically refreshed when expired
- Failed requests are queued during token refresh
- Automatic redirect to login on authentication failure

## 🎮 Game Flow

1. **Login/Register**: User authenticates
2. **Select Difficulty**: Choose Easy, Medium, or Hard
3. **Start Game**: Create a new game session
4. **Start Round**: Begin a trading round
5. **Trade Stocks**: Buy/sell stocks based on heart puzzle images
6. **Use Tools**: Unlock and use hints or time boosts
7. **Complete Round**: View results and proceed to next round
8. **Game Complete**: View final results after 3 rounds

## 📱 Responsive Design

The application is fully responsive and works on:

- Desktop (1920px+)
- Laptop (1024px - 1919px)
- Tablet (768px - 1023px)
- Mobile (320px - 767px)

## 🎨 Styling

- **Theme**: Dark theme with blue accent colors
- **Components**: Custom Ant Design theme configuration
- **Responsive**: Tailwind CSS utility classes
- **Animations**: CSS animations for smooth transitions

## 🔧 Development

### Code Structure

- **Components**: Reusable UI components
- **Pages**: Route-level components
- **Context**: Global state management
- **Services**: API communication layer
- **Types**: TypeScript type definitions
- **Utils**: Helper functions and constants

### Best Practices

- TypeScript for type safety
- Functional components with hooks
- Context API for state management
- Axios interceptors for error handling
- Protected routes for authenticated pages

## 🐛 Troubleshooting

### Common Issues

1. **API Connection Errors**

   - Verify backend is running on http://localhost:8080
   - Check API_BASE_URL in `src/utils/constants.ts`
   - Verify CORS settings in backend

2. **Authentication Issues**

   - Clear browser cookies and localStorage
   - Check browser console for errors
   - Verify JWT token is being set correctly

3. **Build Errors**

   - Delete `node_modules` and `package-lock.json`
   - Run `npm install` again
   - Check Node.js version (requires 18+)

4. **TypeScript Errors**
   - Run `npm run lint` to check for issues
   - Ensure all types are properly imported
   - Check `tsconfig.json` configuration

## 📦 Build & Deploy

### Development Build

```bash
npm run dev
```

### Production Build

```bash
npm run build
```

Output will be in the `dist/` directory.

### Preview Production Build

```bash
npm run preview
```

## 📝 Scripts

- `npm run dev`: Start development server
- `npm run build`: Build for production
- `npm run preview`: Preview production build
- `npm run lint`: Run ESLint

## 🔗 Related Documentation

- [Backend README](../cardiac-trader-backend/README.md)
- [Main README](../README.md)

## 📄 License

This project is licensed under the MIT License.

Copyright (c) 2025 Yuraj Malinda

See the [LICENSE](./LICENSE) file for details.

## 🎓 Academic Information

This project was developed as part of the **Data Structures and Algorithms (DSA)** module in the **Computer Science (CS)** program at the **University of Bedfordshire (UOB)**.

This frontend component demonstrates:

- React and TypeScript development
- Component-based architecture
- State management with React Context API
- RESTful API integration
- Responsive UI design
