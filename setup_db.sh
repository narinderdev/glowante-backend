#!/bin/bash

# Usage: ./setup_database.sh [environment]
# Example: ./setup_database.sh dev

# ✅ 1️⃣ Ensure Environment is Provided
if [ -z "$1" ]; then
    echo "❌ Error: No environment specified. Please use one of the following:"
    echo "Usage: $0 [dev|staging|uat|prod]"
    exit 1
fi

ENVIRONMENT=$1

# ✅ 2️⃣ Define Database Credentials Per Environment
case $ENVIRONMENT in
  dev)
    DB_USER="dev_glowante_user"
    DB_PASS="Dev@Glowante@!23"
    DB_NAME="dev_db"
    ;;
  staging)
    DB_USER="staging_glowante_user"
    DB_PASS="Staging@Glowante@!23"
    DB_NAME="staging_db"
    ;;
  uat)
    DB_USER="uat_glowante_user"
    DB_PASS="Uat@Glowante@!23"
    DB_NAME="uat_db"
    ;;
  prod)
    DB_USER="prod_glowante_user"
    DB_PASS="Prod@Glowante@!23"
    DB_NAME="prod_db"
    ;;
  *)
    echo "❌ Error: Invalid environment '$ENVIRONMENT'. Please use dev, staging, uat, or prod."
    exit 1
    ;;
esac

# ✅ 3️⃣ Export Password for Current User
export PGPASSWORD="$DB_PASS"
DB_HOST="localhost"
DB_PORT="5432"

echo "🚀 Starting Database Setup for '$ENVIRONMENT' Environment..."

# ✅ 4️⃣ Check if PostgreSQL is Running
if ! pg_isready -h $DB_HOST -p $DB_PORT -U postgres; then
    echo "❌ Error: PostgreSQL is not running on $DB_HOST:$DB_PORT. Please start it first."
    exit 1
fi

# ✅ 5️⃣ Ensure Postgres Superuser Credentials Work
if ! PGPASSWORD="Glowante@!23" psql -U postgres -h $DB_HOST -c "\q"; then
    echo "❌ Error: Cannot authenticate as 'postgres'. Please check your PostgreSQL password."
    exit 1
fi

# ✅ 6️⃣ Check if User Exists
USER_EXISTS=$(PGPASSWORD="Glowante@!23" psql -U postgres -h $DB_HOST -tAc "SELECT 1 FROM pg_roles WHERE rolname='$DB_USER'")
if [ "$USER_EXISTS" != "1" ]; then
  echo "🔹 Creating user $DB_USER..."
  PGPASSWORD="Glowante@!23" psql -U postgres -h $DB_HOST -c "CREATE ROLE $DB_USER WITH LOGIN PASSWORD '$DB_PASS';"
  PGPASSWORD="Glowante@!23" psql -U postgres -h $DB_HOST -c "ALTER ROLE $DB_USER CREATEDB;"
else
  echo "✅ User $DB_USER already exists."
fi

# ✅ 7️⃣ Check if Database Exists
DB_EXISTS=$(PGPASSWORD="Glowante@!23" psql -U postgres -h $DB_HOST -tAc "SELECT 1 FROM pg_database WHERE datname='$DB_NAME'")
if [ "$DB_EXISTS" != "1" ]; then
  echo "🔹 Creating database $DB_NAME..."
  PGPASSWORD="Glowante@!23" psql -U postgres -h $DB_HOST -c "CREATE DATABASE $DB_NAME OWNER $DB_USER;"
else
  echo "✅ Database $DB_NAME already exists."
fi

# ✅ 8️⃣ Define Schema for Tables and Columns
declare -A TABLE_COLUMNS
TABLE_COLUMNS["users"]="id SERIAL PRIMARY KEY, first_name VARCHAR(100), last_name VARCHAR(100), email VARCHAR(255) UNIQUE, country_code VARCHAR(5) NOT NULL, phone_number VARCHAR(15) UNIQUE, profile_picture_url TEXT, otp VARCHAR(6), otp_expiry TIMESTAMP, is_verified BOOLEAN DEFAULT FALSE, status VARCHAR(20) DEFAULT 'Active', created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP"
TABLE_COLUMNS["roles"]="role_id SERIAL PRIMARY KEY, role_name VARCHAR(50) NOT NULL UNIQUE"
TABLE_COLUMNS["user_roles"]="user_id INT REFERENCES users(id) ON DELETE CASCADE, role_id INT REFERENCES roles(role_id) ON DELETE CASCADE, PRIMARY KEY (user_id, role_id)"
TABLE_COLUMNS["user_addresses"]="id SERIAL PRIMARY KEY, user_id INT REFERENCES users(id) ON DELETE CASCADE, city VARCHAR(100) NOT NULL, state VARCHAR(100) NOT NULL, zipcode VARCHAR(20) NOT NULL, status VARCHAR(20) DEFAULT 'Active', created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP"
TABLE_COLUMNS["services"]="id SERIAL PRIMARY KEY, service_name VARCHAR(255) NOT NULL, description VARCHAR(255), status VARCHAR(20) DEFAULT 'Active'"
TABLE_COLUMNS["salons"]="id SERIAL PRIMARY KEY, salon_name VARCHAR(255) NOT NULL, address VARCHAR(255) NOT NULL, phone_no VARCHAR(15), email VARCHAR(255), status VARCHAR(20) DEFAULT 'Active', salon_owner_id INT REFERENCES users(id) ON DELETE SET NULL, opening_time VARCHAR(255), closing_time VARCHAR(255), salon_description VARCHAR(255), salon_picture_url TEXT, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP"
TABLE_COLUMNS["subservices"]="id SERIAL PRIMARY KEY, service_id INT REFERENCES services(id) ON DELETE CASCADE, subservice_name VARCHAR(255) NOT NULL, subservice_description VARCHAR(255), status VARCHAR(20) DEFAULT 'Active', created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP"
TABLE_COLUMNS["salon_services"]="id SERIAL PRIMARY KEY, salon_id INT REFERENCES salons(id) ON DELETE CASCADE, service_id INT REFERENCES services(id) ON DELETE CASCADE, subservice_id INT REFERENCES subservices(id) ON DELETE CASCADE, price VARCHAR(10), duration VARCHAR(100), description VARCHAR(255), status VARCHAR(20) DEFAULT 'Active', created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP"

# ✅ 9️⃣ Check and Add Missing Columns for Tables Dynamically
check_and_add_column() {
    local table=$1
    local column=$2
    local column_type=$3

    # Check if column exists
    COLUMN_EXISTS=$(PGPASSWORD="$DB_PASS" psql -U $DB_USER -h $DB_HOST -d $DB_NAME -tAc "SELECT 1 FROM information_schema.columns WHERE table_name = '$table' AND column_name = '$column'")
    
    if [ "$COLUMN_EXISTS" != "1" ]; then
        echo "🔹 Adding column '$column' to table '$table'..."
        PGPASSWORD="$DB_PASS" psql -U $DB_USER -h $DB_HOST -d $DB_NAME -c "ALTER TABLE $table ADD COLUMN $column $column_type;"
    else
        echo "✅ Column '$column' already exists in table '$table'."
    fi
}

# ✅ 10️⃣ Iterate Over Tables and Columns
for table in "${!TABLE_COLUMNS[@]}"; do
    # Create table if it doesn't exist
    CREATE_TABLE_SQL="CREATE TABLE IF NOT EXISTS $table (${TABLE_COLUMNS[$table]});"
    echo "🔹 Creating table '$table' if not exists..."
    PGPASSWORD="$DB_PASS" psql -U $DB_USER -h $DB_HOST -d $DB_NAME -c "$CREATE_TABLE_SQL"
    
    # Check and add missing columns
    IFS=',' read -ra COLUMNS <<< "${TABLE_COLUMNS[$table]}"
    for column in "${COLUMNS[@]}"; do
        column_details=$(echo $column | sed 's/^ *//;s/ *$//')
        column_name=$(echo $column_details | cut -d' ' -f1)
        column_type=$(echo $column_details | cut -d' ' -f2-)
        check_and_add_column "$table" "$column_name" "$column_type"
    done
done

echo "🎉 Database and table setup completed successfully for '$ENVIRONMENT'! 🚀"