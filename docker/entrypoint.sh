# docker/entrypoint.sh
#!/bin/sh
set -e

# Run migrations
yarn migration:run

# Seed database if needed
if [ "$NODE_ENV" = "development" ]; then
    yarn seed
fi

# Start application
exec "$@"