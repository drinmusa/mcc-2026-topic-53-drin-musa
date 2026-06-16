#!/bin/bash

# Configuration
DB_HOST="localhost"
DB_PORT="5432"

# Ask for input
read -p "Enter PostgreSQL database name: " DB_NAME
read -p "Enter PostgreSQL username: " DB_USER
read -s -p "Enter PostgreSQL password: " DB_PASS
echo ""

# Validate input
if [ -z "$DB_NAME" ] || [ -z "$DB_USER" ] || [ -z "$DB_PASS" ]; then
  echo "Error: Database name, username, and password are required."
  exit 1
fi

# Export password so psql doesn’t prompt
export PGPASSWORD="$DB_PASS"

# SQL commands
DROP_DB="DROP DATABASE IF EXISTS \"$DB_NAME\";"
CREATE_DB="CREATE DATABASE \"$DB_NAME\";"

# Execute
psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d postgres -c "$DROP_DB" -c "$CREATE_DB"

if [ $? -eq 0 ]; then
  echo "✅ Database '$DB_NAME' has been successfully dropped and recreated."
else
  echo "❌ Error: Unable to reset the database '$DB_NAME'."
fi

# Cleanup
unset PGPASSWORD