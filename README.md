# [![alxzen Logo](https://cdn.pterodactyl.io/logos/new/pterodactyl_logo.png)](https://github.com/alxzy-group/alxzen)

![GitHub Workflow Status](https://img.shields.io/github/actions/workflow/status/pterodactyl/panel/ci.yaml?label=Tests&style=for-the-badge)
![Theme Version](https://img.shields.io/badge/Theme-alxzen_v2.0-6c5ce7?style=for-the-badge)
![Protect Version](https://img.shields.io/badge/Protect-v3.0-success?style=for-the-badge)
![Discord](https://img.shields.io/discord/122900397965705216?label=Discord&logo=Discord&logoColor=white&style=for-the-badge)

# alxzen Panel

**alxzen** is a highly customized distribution of the Pterodactyl® game server management panel. Built with a focus on automation, aesthetic dominance, and system integrity. This version features the **alxzen Dark Purple** interface and an integrated **Expiration Management** system to streamline hosting operations.

Stop settling for generic. Make your platform stand out with a first-class citizen UI and automated billing-ready features.

![alxzen Preview](https://cdn.pterodactyl.io/site-assets/pterodactyl_v1_demo.gif)

## Key Enhancements

* **Alxzen Dark Purple UI**: A completely overhauled administrative and user interface using deep blacks and electric purples.
* **Expiration Manager**: Direct administrative control over server life-cycles with automated daily checks.
* **Auto-Suspension System**: Native integration with the Pterodactyl suspension engine for expired instances.
* **Hardcoded Branding**: Permanent brand integrity for **alxzen** and **alxzy/alan** across the system.
* **Root Protection v3.0**: Enhanced middleware restrictions ensuring core settings remain exclusive to the primary administrator.

---

## Installation & Update

To transform your panel into **alxzen**, execute the following sequence within your panel's root directory (typically `/var/www/pterodactyl`).

```bash
# 1. Backup & Preparation
cp .env /root/.env.backup.$(date +%F)
rm -rf *

# 2. Deployment
curl -L [https://github.com/pterodactyl/panel/releases/latest/download/panel.tar.gz](https://github.com/pterodactyl/panel/releases/latest/download/panel.tar.gz) | tar -xzv
curl -L [https://github.com/alxzy-group/alxzen/releases/latest/download/panel.tar.gz](https://github.com/alxzy-group/alxzen/releases/latest/download/panel.tar.gz) | tar -xzv
cp /root/.env.backup.$(date +%F) .env

# 3. Optimization
composer install --no-dev --optimize-autoloader
yarn install
yarn build:production

# 4. Finalization
php artisan view:clear && php artisan config:clear
php artisan migrate --seed --force
chown -R www-data:www-data /var/www/pterodactyl
php artisan queue:restart
```