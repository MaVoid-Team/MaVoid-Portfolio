# Deployment Guide

## Prerequisites
- VPS with Docker and Docker Compose installed
- nginx installed on host system
- Domain name pointed to your VPS IP

## Deployment Steps

### 1. Setup Environment Variables

Create a `.env` file in the project root:

```bash
cp .env.example .env
```

Edit `.env` with your actual Firebase credentials and admin passkey.

### 2. Build and Run with Docker Compose

```bash
# Build the Docker image
docker-compose build

# Start the container
docker-compose up -d

# Check logs
docker-compose logs -f
```

The application will be accessible at `http://localhost:3001` on your VPS.

### 3. Configure nginx on Host

Copy the nginx configuration to your VPS:

```bash
sudo cp nginx-host.conf /etc/nginx/sites-available/mavoid-portfolio
```

Edit the file and replace `portfolio.yourdomain.com` with your actual domain:

```bash
sudo nano /etc/nginx/sites-available/mavoid-portfolio
```

Enable the site:

```bash
sudo ln -s /etc/nginx/sites-available/mavoid-portfolio /etc/nginx/sites-enabled/
```

Test nginx configuration:

```bash
sudo nginx -t
```

Reload nginx:

```bash
sudo systemctl reload nginx
```

### 4. Setup SSL with Let's Encrypt (Optional but Recommended)

Install certbot:

```bash
sudo apt install certbot python3-certbot-nginx
```

Obtain SSL certificate:

```bash
sudo certbot --nginx -d portfolio.yourdomain.com
```

Certbot will automatically configure SSL in your nginx file. Alternatively, uncomment the HTTPS section in `nginx-host.conf`.

### 5. Container Management

```bash
# Stop the container
docker-compose down

# Restart the container
docker-compose restart

# View logs
docker-compose logs -f

# Rebuild after code changes
docker-compose up -d --build
```

## Port Configuration

- **Container internal port**: 80 (nginx inside container)
- **Host exposed port**: 3001 (configurable in docker-compose.yml)
- **nginx proxy**: Routes traffic from your domain to localhost:3001

If port 3001 is already in use, change it in `docker-compose.yml`:

```yaml
ports:
  - "3002:80"  # Change 3002 to any available port
```

Then update `nginx-host.conf` accordingly:

```nginx
proxy_pass http://localhost:3002;
```

## Updating the Application

```bash
# Pull latest changes
git pull

# Rebuild and restart
docker-compose up -d --build
```

## Troubleshooting

### Container not starting
```bash
docker-compose logs
```

### nginx errors
```bash
sudo nginx -t
sudo tail -f /var/log/nginx/mavoid-portfolio_error.log
```

### Port already in use
```bash
# Check what's using the port
sudo lsof -i :3001

# Change port in docker-compose.yml
```

## Security Notes

1. Never commit `.env` file to version control
2. Use strong admin passkey
3. Enable SSL/HTTPS in production
4. Keep Docker and nginx updated
5. Consider setting up a firewall (ufw)

```bash
sudo ufw allow 22    # SSH
sudo ufw allow 80    # HTTP
sudo ufw allow 443   # HTTPS
sudo ufw enable
```
