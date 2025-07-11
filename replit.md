# Stock Tracker Application

## Overview

This is a full-stack stock tracking application built with React, Express, and in-memory storage. The application provides real-time stock market monitoring with live data from Alpha Vantage API, including stock search, watchlist management, price alerts, portfolio tracking, and WebSocket-powered real-time updates.

## Recent Changes (July 11, 2025)

✓ Completed full-stack stock exchange monitoring application
✓ Integrated Alpha Vantage API for real-time stock data
✓ Added fallback mock data generation for API rate limits
✓ Fixed React component imports and TypeScript errors
✓ Implemented user-id headers for proper session management
✓ Added realistic market index data with fallback values
✓ Fixed stock search and watchlist add/remove functionality

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for client-side routing
- **State Management**: TanStack Query (React Query) for server state management
- **UI Components**: Radix UI primitives with custom shadcn/ui components
- **Styling**: Tailwind CSS with CSS variables for theming
- **Build Tool**: Vite for fast development and optimized builds

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript with ES modules
- **API Pattern**: RESTful endpoints with real-time WebSocket support
- **Database ORM**: Drizzle ORM for type-safe database operations
- **Session Management**: Express sessions with PostgreSQL store

### Database Design
- **Primary Database**: PostgreSQL
- **Connection**: Neon serverless PostgreSQL
- **Schema Management**: Drizzle migrations
- **Tables**:
  - `stocks`: Stock data with price and metadata
  - `watchlists`: User watchlist entries
  - `alerts`: Price and volume alerts
  - `portfolios`: Portfolio holdings
  - `market_indices`: Market index data

## Key Components

### Stock Management
- Real-time stock data fetching from Alpha Vantage API
- Stock search functionality with caching
- Price tracking and historical data simulation
- Market indices monitoring (S&P 500, NASDAQ, etc.)

### User Features
- **Watchlists**: Add/remove stocks to personal watchlist
- **Alerts**: Set price-based and volume-based alerts
- **Portfolio**: Track stock holdings with cost basis
- **Real-time Updates**: WebSocket connections for live price updates

### UI Components
- **Dashboard**: Main interface with market summary, watchlist, and charts
- **Stock Chart**: Interactive price charts with multiple timeframes
- **Search**: Autocomplete stock search with instant results
- **Responsive Design**: Mobile-first approach with adaptive layouts

## Data Flow

1. **Stock Data**: External API (Alpha Vantage) → Backend processing → Database storage → WebSocket broadcasting → Frontend updates
2. **User Actions**: Frontend forms → API validation → Database operations → Real-time notifications
3. **Real-time Updates**: WebSocket server manages client subscriptions and broadcasts stock price changes
4. **State Management**: TanStack Query handles caching, synchronization, and optimistic updates

## External Dependencies

### APIs
- **Alpha Vantage**: Primary stock data provider
- **WebSocket**: Real-time price updates and notifications

### Key Libraries
- **UI**: Radix UI primitives, Lucide React icons, Recharts for visualizations
- **Database**: Drizzle ORM, Neon PostgreSQL adapter
- **Utilities**: Zod for validation, date-fns for date handling, clsx for styling

### Development Tools
- **Vite**: Build tool with hot module replacement
- **TypeScript**: Type safety across the stack
- **ESLint/Prettier**: Code formatting and linting

## Deployment Strategy

### Build Process
- **Frontend**: Vite builds optimized static assets
- **Backend**: esbuild bundles server code for production
- **Database**: Drizzle migrations handle schema changes

### Environment Configuration
- **Development**: Hot reload with Vite dev server
- **Production**: Static file serving with Express
- **Database**: Environment-based connection strings

### Key Environment Variables
- `DATABASE_URL`: PostgreSQL connection string
- `ALPHA_VANTAGE_API_KEY`: Stock data API key
- `NODE_ENV`: Environment mode (development/production)

### Session Management
- PostgreSQL-backed sessions using connect-pg-simple
- Anonymous user support with default user IDs
- Session persistence across browser restarts

The application follows a monorepo structure with shared TypeScript types and schemas, enabling type safety across the frontend and backend while maintaining clear separation of concerns.