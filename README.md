# Expense Tracker

> **Note:** This application was built with AI assistance using Claude (Anthropic). The entire codebase, from database schema to UI components, was collaboratively designed and implemented through an AI-assisted development process.

A full-stack expense tracking application built with Next.js 14, PostgreSQL (Neon), and NextAuth.js.

# To-DO:
https://www.youtube.com/watch?v=F8yTXeJAJ-c


## Features

- 🔐 **Authentication** - Secure login/signup with NextAuth.js
- 💰 **Transactions** - Track income, expenses, and transfers
- 🏦 **Accounts** - Multiple payment methods with auto-balance tracking
- 📊 **Categories** - Organize transactions with custom categories
- 💸 **Budgets** - Set one-time or recurring budgets with progress tracking
- 📈 **Reports** - Visual analytics with charts and trends
- 📥 **Import** - Bulk import from CSV/Excel files
- 🌙 **Dark Mode** - Toggle between light and dark themes
- ✏️ **Edit/Delete** - Full CRUD operations on transactions
- 📄 **Pagination** - Browse transactions with page navigation


## Screenshots

### Dashboard
![Dashboard](./public/example.png)

*Main dashboard showing account balances, recent transactions, and financial summary*

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Database:** PostgreSQL (Neon)
- **Authentication:** NextAuth.js
- **Styling:** Tailwind CSS + shadcn/ui
- **Language:** TypeScript
- **Charts:** Recharts
- **File Parsing:** PapaParse, SheetJS

## Prerequisites

- Node.js 18+ 
- npm or yarn
- A Neon account (free tier available)

## Local Setup

### 1. Clone the repository
```bash
git clone <your-repo-url>
cd expense-tracker
```

### 2. Install dependencies
```bash
npm install
```

### 3. Set up Neon Database
- Go to Neon Console
- Create a new project
- Copy your connection string (it looks like: postgresql://user:password@host/database)

### 4. Run Database Migrations
Connect to your Neon database and run the SQL migrations in order:
```sql
-- Run these in your Neon SQL Editor:
-- 1. lib/db/migrations/001_create_users_table.sql
-- 2. lib/db/migrations/002_create_payment_methods_table.sql
-- 3. lib/db/migrations/003_create_categories_table.sql
-- 4. lib/db/migrations/004_create_transactions_table.sql
-- 5. lib/db/migrations/005_create_budgets_table.sql (if exists)
```

Or create these tables manually:
<details>
<summary>Click to see full database schema</summary>


```sql
-- Users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Payment methods (Accounts)
CREATE TABLE IF NOT EXISTS payment_methods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
  user_id UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL,
  icon VARCHAR(10),
  initial_balance DECIMAL(15, 2) DEFAULT 0,
  current_balance DECIMAL(15, 2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Categories
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
  user_id UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  icon VARCHAR(10),
  type VARCHAR(50) NOT NULL CHECK (type IN ('income', 'expense')),
  parent_id UUID REFERENCES categories (id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Transactions
CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
  user_id UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL CHECK (type IN ('income', 'expense', 'transfer')),
  amount DECIMAL(15, 2) NOT NULL,
  description TEXT,
  transaction_date DATE NOT NULL,
  category_id UUID REFERENCES categories (id) ON DELETE SET NULL,
  payment_method_id UUID NOT NULL REFERENCES payment_methods (id) ON DELETE CASCADE,
  to_account_id UUID REFERENCES payment_methods (id) ON DELETE SET NULL,
  is_deleted BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Budgets
CREATE TABLE IF NOT EXISTS budgets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
  user_id UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  amount DECIMAL(15, 2) NOT NULL,
  period_type VARCHAR(50) NOT NULL CHECK (
    period_type IN ('one_time', 'monthly', 'weekly', 'yearly')
  ),
  start_date DATE NOT NULL,
  end_date DATE,
  category_id UUID REFERENCES categories (id) ON DELETE SET NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_transactions_user ON transactions (user_id);

CREATE INDEX idx_transactions_date ON transactions (transaction_date);

CREATE INDEX idx_payment_methods_user ON payment_methods (user_id);

CREATE INDEX idx_categories_user ON categories (user_id);

CREATE INDEX idx_budgets_user ON budgets (user_id);

-- Triggers for balance updates
CREATE OR REPLACE FUNCTION update_account_balance () RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
    IF NEW.type = 'income' THEN
    UPDATE payment_methods
    SET current_balance = current_balance + NEW.amount
    WHERE id = NEW.payment_method_id;
    ELSIF NEW.type = 'expense' THEN
    UPDATE payment_methods
    SET current_balance = current_balance - NEW.amount
    WHERE id = NEW.payment_method_id;
    ELSIF NEW.type = 'transfer' THEN
    UPDATE payment_methods
    SET current_balance = current_balance - NEW.amount
    WHERE id = NEW.payment_method_id;
    UPDATE payment_methods
    SET current_balance = current_balance + NEW.amount
    WHERE id = NEW.to_account_id;
    END IF;
    ELSIF TG_OP = 'UPDATE' THEN
    -- Revert old transaction
    IF OLD.type = 'income' THEN
    UPDATE payment_methods
    SET current_balance = current_balance - OLD.amount
    WHERE id = OLD.payment_method_id;
    ELSIF OLD.type = 'expense' THEN
    UPDATE payment_methods
    SET current_balance = current_balance + OLD.amount
    WHERE id = OLD.payment_method_id;
    ELSIF OLD.type = 'transfer' THEN
    UPDATE payment_methods
    SET current_balance = current_balance + OLD.amount
    WHERE id = OLD.payment_method_id;
    UPDATE payment_methods
    SET current_balance = current_balance - OLD.amount
    WHERE id = OLD.to_account_id;
    END IF;
    -- Apply new transaction
    IF NEW.type = 'income' THEN
    UPDATE payment_methods
    SET current_balance = current_balance + NEW.amount
    WHERE id = NEW.payment_method_id;
    ELSIF NEW.type = 'expense' THEN
    UPDATE payment_methods
    SET current_balance = current_balance - NEW.amount
    WHERE id = NEW.payment_method_id;
    ELSIF NEW.type = 'transfer' THEN
    UPDATE payment_methods
    SET current_balance = current_balance - NEW.amount
    WHERE id = NEW.payment_method_id;
    UPDATE payment_methods
    SET current_balance = current_balance + NEW.amount
    WHERE id = NEW.to_account_id;
    END IF;
    ELSIF TG_OP = 'DELETE' THEN
    IF OLD.type = 'income' THEN
    UPDATE payment_methods
    SET current_balance = current_balance - OLD.amount
    WHERE id = OLD.payment_method_id;
    ELSIF OLD.type = 'expense' THEN
    UPDATE payment_methods
    SET current_balance = current_balance + OLD.amount
    WHERE id = OLD.payment_method_id;
    ELSIF OLD.type = 'transfer' THEN
    UPDATE payment_methods
    SET current_balance = current_balance + OLD.amount
    WHERE id = OLD.payment_method_id;
    UPDATE payment_methods
    SET current_balance = current_balance - OLD.amount
    WHERE id = OLD.to_account_id;
    END IF;
    END IF;
    RETURN NEW;
    END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_account_balance
AFTER INSERT
OR
UPDATE
OR DELETE ON transactions FOR EACH ROW
EXECUTE FUNCTION update_account_balance ();
```
</details>

### 5. Configure Environment Variables

Create a `.env.local` file in the root directory:
```env
# Database
DATABASE_URL="postgresql://user:password@host/database?sslmode=require"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-random-secret-key-here"

# Generate a secret with: openssl rand -base64 32
```
Environment Variables Explained:

- DATABASE_URL: Your Neon PostgreSQL connection string
- NEXTAUTH_URL: The base URL of your application
- NEXTAUTH_SECRET: A random secret key for JWT encryption

### 6. Run the development server
```bash
npm run dev
```
Open http://localhost:3000 in your browser.

### 7. Create your first account

- Go to /register
- Create an account
- Login and start tracking expenses!

## Deployment to Vercel
### 1. Push your code to GitHub
```bash
git add .
git commit -m "Initial commit"
git push origin main
```

### 2. Deploy to Vercel

- Go to Vercel
- Click "New Project"
- Import your GitHub repository or import manually
- Configure Environment Variables:

```env
DATABASE_URL=your-neon-connection-string
NEXTAUTH_URL=https://your-app.vercel.app
NEXTAUTH_SECRET=your-random-secret-key
```
- Click "Deploy"

### 3. Update NEXTAUTH_URL after deployment
After your first deployment:
- Go to your Vercel project settings
- Navigate to "Environment Variables"
- Update NEXTAUTH_URL to your actual Vercel URL: https://your-app.vercel.app
- Redeploy the application

## Sample Data Templates
Download sample CSV/Excel templates from your deployed app:

- Navigate to `/transactions`
- Click "Import"
- Download CSV or Excel template

Sample Template Format:
```csv
date,type,amount,description,category,account
2025-10-01,expense,50.00,Grocery shopping,Food & Dining,Cash
2025-10-02,income,2000.00,Monthly salary,Salary,Bank Account
2025-10-03,expense,120.00,Electric bill,Utilities,Credit Card
```

# Project Structure
```
├── app/
│   ├── (auth)/              # Authentication pages
│   ├── (dashboard)/         # Protected dashboard pages
│   ├── api/                 # API routes
│   └── layout.tsx           # Root layout
├── components/
│   ├── ui/                  # shadcn/ui components
│   ├── transactions/        # Transaction components
│   ├── budgets/            # Budget components
│   └── reports/            # Report components
├── lib/
│   ├── auth/               # NextAuth configuration
│   ├── db/                 # Database queries
│   └── validations/        # Zod schemas
└── public/
    └── samples/            # Sample import templates
```

# API Routes

- `POST /api/auth/register` - User registration
- `POST /api/auth/signin` - User login
- `GET /api/v1/transactions` - List transactions
- `POST /api/v1/transactions` - Create transaction
- `PUT /api/v1/transactions/[id]` - Update transaction
- `DELETE /api/v1/transactions/[id]` - Delete transaction
- `POST /api/v1/transactions/import` - Bulk import
- `GET /api/v1/budgets` - List budgets
- `POST /api/v1/budgets` - Create budget
- `PUT /api/v1/budgets/[id]` - Update budget
- `DELETE /api/v1/budgets/[id]` - Delete budget

# Troubleshooting
## Database Connection Issues
If you see "Connection refused" or timeout errors:
1. Check your DATABASE_URL is correct
2. Ensure ?sslmode=require is at the end of your connection string
3. Verify your Neon project is active (free tier may suspend after inactivity)

## Authentication Issues
If login/signup doesn't work:
1. Verify NEXTAUTH_SECRET is set
2. Check NEXTAUTH_URL matches your actual URL
3. Clear cookies and try again

## Build Errors
If deployment fails:

- Run `npm run build` locally to check for errors
- Ensure all environment variables are set in Vercel
- Check TypeScript errors: `npm run type-check`

## Credits

This project was developed with AI assistance using [Claude](https://claude.ai) by Anthropic. The application architecture, database design, API endpoints, and UI components were collaboratively created through AI-powered development.


## License
MIT

# Support
For issues and questions, please open an issue on GitHub.
