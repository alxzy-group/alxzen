#!/bin/bash
# ==============================================================================
# alxzen Panel — Automated Installer Script
# Supported OS: Ubuntu 22.04 / 24.04, Debian 12 / 13
# ==============================================================================

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m'

print_header() {
    echo -e "\n${BLUE}${BOLD}╔══════════════════════════════════════════════╗${NC}"
    echo -e "${BLUE}${BOLD}║        alxzen Panel — Auto Installer         ║${NC}"
    echo -e "${BLUE}${BOLD}╚══════════════════════════════════════════════╝${NC}\n"
}

print_step() { echo -e "\n${CYAN}${BOLD}[STEP]${NC} $1"; }
print_ok()   { echo -e "  ${GREEN}✓${NC} $1"; }
print_err()  { echo -e "  ${RED}✗${NC} $1"; exit 1; }

# Must be run as root
if [ "$EUID" -ne 0 ]; then
  print_err "Please run this script as root."
fi

print_header

# Detect OS
OS=""
if [ -f /etc/os-release ]; then
    . /etc/os-release
    OS=$ID
    VERSION_ID=$VERSION_ID
else
    print_err "Unsupported OS."
fi

if [[ "$OS" != "ubuntu" && "$OS" != "debian" ]]; then
    print_err "Only Ubuntu and Debian are supported by this installer."
fi

print_step "Updating System Packages & Installing Dependencies"
apt-get update -y
apt-get install -y software-properties-common curl apt-transport-https ca-certificates gnupg tar unzip git wget

print_step "Adding PHP 8.3 & Redis Repositories"
if [ "$OS" == "ubuntu" ]; then
    LC_ALL=C.UTF-8 add-apt-repository -y ppa:ondrej/php
elif [ "$OS" == "debian" ]; then
    curl -sSL https://packages.sury.org/php/apt.gpg | gpg --dearmor -o /usr/share/keyrings/php-sury.gpg
    echo "deb [signed-by=/usr/share/keyrings/php-sury.gpg] https://packages.sury.org/php/ $(lsb_release -sc) main" > /etc/apt/sources.list.d/php.list
fi

curl -fsSL https://packages.redis.io/gpg | sudo gpg --dearmor -o /usr/share/keyrings/redis-archive-keyring.gpg --yes
echo "deb [signed-by=/usr/share/keyrings/redis-archive-keyring.gpg] https://packages.redis.io/deb $(lsb_release -cs) main" | sudo tee /etc/apt/sources.list.d/redis.list

print_step "Installing PHP 8.3, MariaDB, Redis, Nginx"
apt-get update -y
apt-get install -y php8.3 php8.3-{common,cli,gd,mysql,mbstring,bcmath,xml,fpm,curl,zip} mariadb-server nginx redis-server

print_step "Installing Composer & Node.js 22"
curl -sS https://getcomposer.org/installer | sudo php -- --install-dir=/usr/local/bin --filename=composer
curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
apt-get install -y nodejs
corepack enable

print_step "Configuring Database"
DB_PASS=$(tr -dc A-Za-z0-9 </dev/urandom | head -c 24)
mysql -u root -e "CREATE USER IF NOT EXISTS 'pterodactyl'@'127.0.0.1' IDENTIFIED BY '$DB_PASS';"
mysql -u root -e "CREATE DATABASE IF NOT EXISTS panel;"
mysql -u root -e "GRANT ALL PRIVILEGES ON panel.* TO 'pterodactyl'@'127.0.0.1' WITH GRANT OPTION;"
mysql -u root -e "FLUSH PRIVILEGES;"
print_ok "Database configured with user 'pterodactyl' and a random password."

print_step "Downloading Alxzen Panel"
mkdir -p /var/www/pterodactyl
cd /var/www/pterodactyl
curl -L https://github.com/alxzy-group/alxzen/releases/latest/download/panel.tar.gz | tar -xzv

print_step "Setting up Environment (.env)"
cp .env.example .env
sed -i "s|^APP_URL=.*|APP_URL=http://$(curl -s ifconfig.me)|" .env
sed -i "s|^DB_PASSWORD=.*|DB_PASSWORD=$DB_PASS|" .env
sed -i "s|^CACHE_DRIVER=.*|CACHE_DRIVER=redis|" .env
sed -i "s|^SESSION_DRIVER=.*|SESSION_DRIVER=redis|" .env
sed -i "s|^QUEUE_CONNECTION=.*|QUEUE_CONNECTION=redis|" .env

print_step "Installing Composer Dependencies"
composer install --no-dev --optimize-autoloader

print_step "Generating App Key"
php artisan key:generate --force

print_step "Running Migrations"
php artisan migrate --force

print_step "Setting Permissions"
chown -R www-data:www-data /var/www/pterodactyl/*
chown -R www-data:www-data /var/www/pterodactyl/.[!.]*
chmod -R 755 storage/* bootstrap/cache/

print_step "Setting up Cron Job & Queue Worker"
(crontab -l 2>/dev/null; echo "* * * * * php /var/www/pterodactyl/artisan schedule:run >> /dev/null 2>&1") | crontab -
cat <<EOF > /etc/systemd/system/pteroq.service
[Unit]
Description=Pterodactyl Queue Worker
After=redis-server.service

[Service]
User=www-data
Group=www-data
Restart=always
ExecStart=/usr/bin/php /var/www/pterodactyl/artisan queue:work --queue=high,standard,low --sleep=3 --tries=3
StartLimitInterval=180
StartLimitBurst=30
RestartSec=5s

[Install]
WantedBy=multi-user.target
EOF
systemctl enable --now pteroq.service

echo -e "\n${GREEN}${BOLD}╔══════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}${BOLD}║      ✓  Alxzen Panel Install Complete!      ║${NC}"
echo -e "${GREEN}${BOLD}╚══════════════════════════════════════════════╝${NC}\n"
echo -e "  Please configure Nginx for your domain manually according to Pterodactyl docs."
echo -e "  To create your first admin account, run:"
echo -e "  ${CYAN}cd /var/www/pterodactyl && php artisan p:user:make${NC}\n"
