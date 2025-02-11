#!/bin/bash

# Database Credentials
DB_USER="glowante_user"
DB_PASS="Glowante@!23"
DB_NAME="glowante_local_db"
DB_HOST="localhost"
DB_PORT="5432"

# Export Password for Authentication
export PGPASSWORD="$DB_PASS"

echo "Starting Database Setup..."

# Step 1: Ensure PostgreSQL is Running
if ! pg_isready -h $DB_HOST -p $DB_PORT -U postgres; then
    echo "Error: PostgreSQL is not running. Please start it first."
    exit 1
fi

# Step 2: Check if user exists
USER_EXISTS=$(psql -U postgres -tAc "SELECT 1 FROM pg_roles WHERE rolname='$DB_USER'")
if [ "$USER_EXISTS" != "1" ]; then
  echo "Creating user $DB_USER..."
  psql -U postgres -c "CREATE ROLE $DB_USER WITH LOGIN PASSWORD '$DB_PASS';"
  psql -U postgres -c "ALTER ROLE $DB_USER CREATEDB;"
else
  echo "User $DB_USER already exists."
fi

# Step 3: Check if database exists
DB_EXISTS=$(psql -U postgres -tAc "SELECT 1 FROM pg_database WHERE datname='$DB_NAME'")
if [ "$DB_EXISTS" != "1" ]; then
  echo "Creating database $DB_NAME..."
  psql -U postgres -c "CREATE DATABASE $DB_NAME OWNER $DB_USER;"
else
  echo "Database $DB_NAME already exists."
fi

# Step 4: Define the table creation SQL
TABLE_CREATION_SQL="
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    email VARCHAR(255) UNIQUE,
    password VARCHAR(255),
    phone_number VARCHAR(15) UNIQUE,
    profile_picture_url TEXT,
    otp VARCHAR(6),
    otp_expiry TIMESTAMP,
    is_verified BOOLEAN DEFAULT FALSE,
    status VARCHAR(20) DEFAULT 'Active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS roles (
    role_id SERIAL PRIMARY KEY,
    role_name VARCHAR(50) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS user_roles (
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    role_id INT REFERENCES roles(role_id) ON DELETE CASCADE,
    PRIMARY KEY (user_id, role_id)
);

CREATE TABLE IF NOT EXISTS services (
    id SERIAL PRIMARY KEY,
    service_name VARCHAR(255) NOT NULL,
    description VARCHAR(255),
    status VARCHAR(20) DEFAULT 'Active'
);

CREATE TABLE IF NOT EXISTS salons (
    id SERIAL PRIMARY KEY,
    salon_name VARCHAR(255) NOT NULL,
    address VARCHAR(255) NOT NULL,
    phone_no VARCHAR(15),
    email VARCHAR(255),
    status VARCHAR(20) DEFAULT 'Active',
    salon_owner_id INT REFERENCES users(id) ON DELETE SET NULL,
    opening_time VARCHAR(255),
    closing_time VARCHAR(255),
    salon_description VARCHAR(255),
    salon_picture_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS subservices (
    id SERIAL PRIMARY KEY,
    service_id INT REFERENCES services(id) ON DELETE CASCADE,
    subservice_name VARCHAR(255) NOT NULL,
    subservice_description VARCHAR(255),
    status VARCHAR(20) DEFAULT 'Active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS salon_services (
    id SERIAL PRIMARY KEY,
    salon_id INT REFERENCES salons(id) ON DELETE CASCADE,
    service_id INT REFERENCES services(id) ON DELETE CASCADE,
    subservice_id INT REFERENCES subservices(id) ON DELETE CASCADE,
    price VARCHAR(10),
    duration VARCHAR(100),
    description VARCHAR(255),
    status VARCHAR(20) DEFAULT 'Active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
"

# Step 5: Create Tables in Database
echo "Creating tables in $DB_NAME..."
psql -U $DB_USER -d $DB_NAME -c "$TABLE_CREATION_SQL"
if [ $? -eq 0 ]; then
    echo "Tables created successfully in $DB_NAME."
else
    echo "Error creating tables."
    exit 1
fi

echo "Database and table setup completed successfully! 🚀"