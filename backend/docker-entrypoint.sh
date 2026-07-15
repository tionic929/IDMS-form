#!/bin/bash
set -e

echo "Starting Backend Entrypoint..."

# If SQLite is selected, ensure the database file exists
if [ "$DB_CONNECTION" = "sqlite" ]; then
    DB_PATH=${DB_DATABASE:-/var/www/database/database.sqlite}
    if [ ! -f "$DB_PATH" ]; then
        echo "Creating SQLite database file at $DB_PATH..."
        mkdir -p "$(dirname "$DB_PATH")"
        touch "$DB_PATH"
        chown www-data:www-data "$DB_PATH"
        chmod 664 "$DB_PATH"
    fi
fi

# Install dependencies if vendor folder doesn't exist
if [ ! -d "vendor" ]; then
    echo "Running composer install..."
    composer install --no-interaction --prefer-dist --optimize-autoloader --no-dev
fi

# Run migrations
echo "Running migrations..."
php artisan migrate --force || true

# Clear and cache configurations
echo "Caching configurations..."
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Ensure storage folder has correct permissions
chmod -R 775 storage bootstrap/cache
chown -R www-data:www-data storage bootstrap/cache

exec "$@"
