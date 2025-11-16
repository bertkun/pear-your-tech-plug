# PEAR Backend - PostgreSQL Setup

## Prerequisites
- PostgreSQL installed locally or access to a PostgreSQL database
- Node.js installed

## Environment Variables

Create a `.env` file in the `backend` directory with the following:

```env
# Database Configuration
DB_USER=postgres
DB_HOST=localhost
DB_NAME=pear_db
DB_PASSWORD=your_password
DB_PORT=5432

# API Key for Gemini AI (optional)
API_KEY=your_gemini_api_key

# Server Port
PORT=3001
```

## Database Setup

1. **Create Database**:
   ```bash
   psql -U postgres
   CREATE DATABASE pear_db;
   \q
   ```

2. **Run Initialization Script**:
   ```bash
   psql -U postgres -d pear_db -f init.sql
   ```

   Or let the server auto-create tables on first run.

3. **Install Dependencies**:
   ```bash
   npm install
   ```

4. **Start Server**:
   ```bash
   npm start
   ```

## Database Schema

### phones table
- `id` - Serial primary key
- `name` - Phone model name
- `image_url` - Product image URL
- `retail_price` - Retail price
- `wholesale_price` - Wholesale price
- `stock` - Available stock
- `description` - Product description
- `created_at` - Creation timestamp
- `updated_at` - Last update timestamp

### orders table
- `id` - Serial primary key
- `customer_name` - Customer name
- `customer_email` - Customer email
- `customer_phone` - Customer phone number
- `phone_id` - Reference to phones table
- `quantity` - Order quantity
- `total_price` - Total order price
- `status` - Order status (Order Placed, Processing, Packaged, Shipped, Delivered)
- `created_at` - Creation timestamp
- `updated_at` - Last update timestamp

## Migration from JSON to PostgreSQL

The backend now uses PostgreSQL instead of the JSON file (`db.json`). All data is stored in the PostgreSQL database with proper relational structure.
