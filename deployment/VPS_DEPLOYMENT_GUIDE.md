# دليل الاستضافة والنشر الإنتاجي (VPS Production Deployment Guide)
## مشروع: LIBYA APPS — منصة التطبيقات الليبية

يوثق هذا الدليل خطوات النشر الفعلي للمنصة على خادم **Ubuntu 24.04 LTS VPS** مع فصل كامل بين تطبيق الواجهة الأمامية (**Next.js App Router**) والخلفية البرمجية ولوحة التحكم (**Laravel 11 REST API + Filament v3 + MySQL 8.0**).

---

### 1. هيكل النطاقات والمسارات (Domain & Directory Architecture)

- **الموقع العام (Next.js SSR Frontend):** `https://libyaapps.example` -> `/var/www/libyaapps-frontend` (يعمل عبر PM2 / Systemd على المنفذ الداخلي `3000`)
- **واجهة البرمجة الخلفية (Laravel API v1):** `https://api.libyaapps.example/api/v1` -> `/var/www/libyaapps-backend/public`
- **لوحة الإدارة (Filament Admin RTL):** `https://api.libyaapps.example/admin` -> `/var/www/libyaapps-backend/public`

---

### 2. إعداد قاعدة البيانات MySQL 8.0

```sql
CREATE DATABASE libya_apps_prod CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'libyaapps_user'@'localhost' IDENTIFIED WITH caching_sha2_password BY 'STRONG_GENERATED_SECRET_PASSWORD';
GRANT ALL PRIVILEGES ON libya_apps_prod.* TO 'libyaapps_user'@'localhost';
FLUSH PRIVILEGES;
```

---

### 3. إعداد وتشغيل Laravel 11 + Filament v3

```bash
cd /var/www/libyaapps-backend
cp .env.example .env
composer install --no-dev --optimize-autoloader
php artisan key:generate
php artisan migrate --force
php artisan storage:link
php artisan filament:optimize
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

#### إنشاء حساب المدير العام الأول بأمان (بدون كلمات مرور مدمجة في الكود):
```bash
php artisan make:filament-user
# أو عبر الأمر المخصص مع إسناد صلاحية Super Administrator:
php artisan libyaapps:create-super-admin
```

---

### 4. إعداد Nginx لكل من API/Filament و Next.js

#### أ. ملف إعداد `api.libyaapps.example` (Laravel + Filament)
```nginx
server {
    listen 443 ssl http2;
    server_name api.libyaapps.example;
    root /var/www/libyaapps-backend/public;

    index index.php;
    charset utf-8;
    client_max_body_size 20M;

    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    location ~ \.php$ {
        fastcgi_pass unix:/var/run/php/php8.3-fpm.sock;
        fastcgi_param SCRIPT_FILENAME $realpath_root$fastcgi_script_name;
        include fastcgi_params;
    }

    location ~ /\.(?!well-known).* {
        deny all;
    }
}
```

#### ب. ملف إعداد `libyaapps.example` (Next.js App Router SSR)
```nginx
server {
    listen 443 ssl http2;
    server_name libyaapps.example;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

---

### 5. إعداد Supervisor لتشغيل Laravel Queue Workers و Next.js

```ini
[program:libyaapps-queue]
process_name=%(program_name)s_%(process_num)02d
command=php /var/www/libyaapps-backend/artisan queue:work database --sleep=3 --tries=3 --max-time=3600
autostart=true
autorestart=true
user=www-data
numprocs=2
redirect_stderr=true
stdout_logfile=/var/www/libyaapps-backend/storage/logs/queue-worker.log
```

#### جدولة المهام (Laravel Scheduler) في `/etc/crontab`:
```cron
* * * * * www-data cd /var/www/libyaapps-backend && php artisan schedule:run >> /dev/null 2>&1
```

#### النسخ الاحتياطي اليومي لقاعدة البيانات MySQL:
```cron
0 3 * * * root mysqldump --single-transaction -u libyaapps_user -p'...' libya_apps_prod | gzip > /var/backups/mysql/libya_apps_$(date +\%F).sql.gz
```
