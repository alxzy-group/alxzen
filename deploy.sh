#!/bin/bash
# Jalankan: sudo bash /media/alxzy/1a308696-68bb-4117-80de-9eb02efba2c8/alxzen/deploy.sh

SRC="/media/alxzy/1a308696-68bb-4117-80de-9eb02efba2c8/alxzen"
DST="/var/www/pterodactyl"

echo "🔄 Deploying all files..."

# JS assets
cd "$DST/public/assets" && find . \( -name "*.js" -o -name "*.map" \) -type f -delete
rsync -a "$SRC/public/assets/" "$DST/public/assets/"
chown -R www-data:www-data "$DST/public/assets"

# Nginx setup for Multiplayer
if ! grep -q "location /socket.io/" /etc/nginx/sites-available/pterodactyl.conf; then
  echo "🔧 Adding /socket.io/ proxy to Nginx config..."
  sed -i '$ d' /etc/nginx/sites-available/pterodactyl.conf
  echo '
    # Proxy for Dunia Alxzy Multiplayer Server
    location /socket.io/ {
        proxy_pass http://127.0.0.1:3002;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "Upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}' >> /etc/nginx/sites-available/pterodactyl.conf
  systemctl restart nginx
fi

# PHP/Blade files
cp "$SRC/config/http.php" "$DST/config/http.php"
cp "$SRC/app/Enum/ResourceLimit.php" "$DST/app/Enum/ResourceLimit.php"
cp "$SRC/resources/views/templates/wrapper.blade.php" "$DST/resources/views/templates/wrapper.blade.php"
cp "$SRC/resources/views/admin/settings/advanced.blade.php" "$DST/resources/views/admin/settings/advanced.blade.php"
cp "$SRC/app/Http/ViewComposers/AssetComposer.php" "$DST/app/Http/ViewComposers/AssetComposer.php"
cp "$SRC/app/Http/Requests/Admin/Settings/AdvancedSettingsFormRequest.php" "$DST/app/Http/Requests/Admin/Settings/AdvancedSettingsFormRequest.php"
cp "$SRC/app/Http/Requests/Api/Application/ApplicationApiRequest.php" "$DST/app/Http/Requests/Api/Application/ApplicationApiRequest.php"

# Fix ownership
chown -R www-data:www-data "$DST/public/assets/" "$DST/storage/" "$DST/bootstrap/cache/"
chown www-data:www-data "$DST/config/http.php"
chown www-data:www-data "$DST/app/Enum/ResourceLimit.php"
chown www-data:www-data "$DST/resources/views/templates/wrapper.blade.php"
chown www-data:www-data "$DST/resources/views/admin/settings/advanced.blade.php"
chown www-data:www-data "$DST/app/Http/ViewComposers/AssetComposer.php"
chown www-data:www-data "$DST/app/Http/Requests/Admin/Settings/AdvancedSettingsFormRequest.php"
chown www-data:www-data "$DST/app/Http/Requests/Api/Application/ApplicationApiRequest.php"

# Clear & rebuild caches
cd "$DST"
php artisan view:clear
php artisan config:clear
php artisan cache:clear
php artisan route:clear
php artisan optimize

echo ""
echo "✅ DEPLOY SELESAI! Hard refresh browser (CTRL+SHIFT+R)"
