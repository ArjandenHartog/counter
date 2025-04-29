# Counter App

A Next.js application for tracking counters with SQLite database.

## Setup and Deployment

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Local Development
1. Clone the repository
```bash
git clone <repository-url>
cd counter
```

2. Install dependencies
```bash
npm install
```

3. Start the development server
```bash
npm run dev
```

### Production Deployment

#### Building for Production
1. Build the application
```bash
npm run build
```

2. Start the production server
```bash
npm start
```

#### Quick Deployment with Script
Use the included deployment script to create a ready-to-deploy package:

```bash
./deploy.sh
```

This will create a timestamped archive containing everything needed to run the application.

#### Deploy as a Service (Linux)
1. Make sure you've built the application with `npm run build`
2. Edit the `counter.service` file if needed to match your environment
3. Run the install script
```bash
sudo ./install-service.sh
```

#### Using Existing Database
The app comes with a pre-initialized SQLite database in the `db` directory. The application will use this database automatically.

If you need to re-initialize the database:
```bash
npm run init-db
```

### Deploying to GitHub

1. Create a new GitHub repository
```bash
git init
git add .
git commit -m "Initial commit"
```

2. Connect to your GitHub repository
```bash
git remote add origin https://github.com/yourusername/counter.git
git branch -M main
git push -u origin main
```

3. From your GitHub repository, you can then clone and deploy to your web server

## Features
- Simple counter interface
- Team counters
- Historical logging
- Database backup on initialization

## Tech Stack
- Next.js
- TypeScript
- better-sqlite3
- Tailwind CSS
- shadcn/ui components

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Database Initialization

Before running the application for the first time, you should initialize the database:

```bash
npm run init-db
```

This will create the required database tables with the correct schema.
