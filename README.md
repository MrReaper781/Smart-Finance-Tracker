# Smart Finance Tracker

A comprehensive personal finance management application built with Next.js, TypeScript, and MongoDB. Track your income, expenses, budgets, and financial goals with a beautiful, responsive interface.

## Features

- **Transaction Management**: Add, edit, and categorize income and expenses
- **Budget Tracking**: Create budgets and monitor spending against limits
- **Financial Goals**: Set and track progress towards financial objectives
- **Analytics Dashboard**: Visual insights into spending patterns and trends
- **User Authentication**: Secure login and registration system
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Dark Mode Support**: Toggle between light and dark themes

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS, Radix UI components
- **Database**: MongoDB with Mongoose
- **Authentication**: NextAuth.js
- **Icons**: Lucide React
- **Charts**: Recharts (for analytics)

## Getting Started

### Prerequisites

- Node.js 18+ 
- MongoDB (local or cloud instance)
- npm, yarn, pnpm, or bun

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd smart-finance-tracker
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. **Set up environment variables**
   
   Create a `.env.local` file in the root directory:
   ```env
   # Database
   MONGODB_URI=mongodb://localhost:27017/smart-finance-tracker
   
   # NextAuth.js
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=your-secret-key-here-change-this-in-production

    # SMTP (Nodemailer)
    SMTP_HOST=your-smtp-host
    SMTP_PORT=587
    SMTP_SECURE=false
    SMTP_USER=your-smtp-username
    SMTP_PASS=your-smtp-password
    SMTP_FROM="Smart Finance Tracker <no-reply@example.com>"

    # Error email alerts (optional)
    ADMIN_EMAIL=admin@example.com
    ERROR_EMAIL_ENABLED=true
   ```

4. **Set up MongoDB**
   
   - **Local MongoDB**: Install and start MongoDB locally
   - **MongoDB Atlas**: Create a free cluster and get your connection string
   
   Update the `MONGODB_URI` in your `.env.local` file with your MongoDB connection string.

5. **Run the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

   Optional toggles:
   ```env
   # Feature toggles for transactional emails
   SIGNUP_EMAIL_ENABLED=true
   BUDGET_EMAIL_ENABLED=true
   ```

6. **Open your browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000) to see the application.

## Project Structure

```
src/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   │   ├── auth/          # Authentication endpoints
│   │   ├── transactions/  # Transaction CRUD operations
│   │   ├── budgets/       # Budget management
│   │   └── goals/         # Financial goals
│   ├── auth/              # Authentication pages
│   ├── dashboard/         # Main application pages
│   └── globals.css        # Global styles
├── components/            # Reusable components
│   ├── ui/               # UI component library
│   ├── dashboard/        # Dashboard-specific components
│   └── providers/        # Context providers
├── lib/                  # Utility functions
├── models/               # Database models
└── config/               # Configuration files
```

## Usage

### 1. Create an Account
- Visit the homepage and click "Get Started"
- Fill in your details to create a new account
- Sign in with your credentials

### 2. Add Transactions
- Navigate to the Transactions page
- Click "Add Transaction" to record income or expenses
- Categorize your transactions for better tracking

### 3. Set Up Budgets
- Go to the Budgets page
- Create budgets for different spending categories
- Set spending limits and alert thresholds

### 4. Create Financial Goals
- Visit the Goals page
- Set up savings goals, debt payments, or purchase targets
- Track your progress and add contributions

### 5. View Analytics
- Check the Analytics page for spending insights
- Monitor budget performance and goal progress
- View trends over time

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/[...nextauth]` - NextAuth.js endpoints

### Transactions
- `GET /api/transactions` - Get user transactions
- `POST /api/transactions` - Create new transaction
- `PUT /api/transactions/[id]` - Update transaction
- `DELETE /api/transactions/[id]` - Delete transaction

### Budgets
- `GET /api/budgets` - Get user budgets
- `POST /api/budgets` - Create new budget
- `PUT /api/budgets/[id]` - Update budget
- `DELETE /api/budgets/[id]` - Delete budget

### Goals
- `GET /api/goals` - Get user goals
- `POST /api/goals` - Create new goal
- `PUT /api/goals/[id]` - Update goal
- `DELETE /api/goals/[id]` - Delete goal
- `POST /api/goals/[id]/contribute` - Add contribution to goal

## Database Models

### User
- Personal information and preferences
- Authentication data
- Account settings

### Transaction
- Income and expense records
- Categories and tags
- Recurring transaction support

### Budget
- Spending limits by category
- Period-based tracking
- Alert configurations

### Goal
- Financial objectives
- Progress tracking
- Milestone achievements

---

Built using Next.js and modern web technologies.
