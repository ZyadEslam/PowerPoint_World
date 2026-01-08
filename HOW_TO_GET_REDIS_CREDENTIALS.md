# How to Get Redis Credentials - Detailed Guide

This guide provides step-by-step instructions for obtaining Redis credentials from different providers.

## 📋 Table of Contents

1. [Vercel KV (Recommended for Vercel Deployments)](#vercel-kv-recommended-for-vercel-deployments)
2. [Redis Labs (Redis Cloud)](#redis-labs-redis-cloud)
3. [Upstash Redis](#upstash-redis)
4. [AWS ElastiCache](#aws-elasticache)
5. [DigitalOcean Managed Redis](#digitalocean-managed-redis)
6. [Self-Hosted Redis](#self-hosted-redis)

---

## 🟢 Vercel KV (Recommended for Vercel Deployments)

Vercel KV is the easiest option if you're deploying on Vercel.

### Step 1: Navigate to Vercel Dashboard

1. Go to **[Vercel Dashboard](https://vercel.com/dashboard)**
2. Sign in to your account
3. Click on **your project** (or create a new one)

### Step 2: Create KV Database

1. In your project dashboard, click on the **Storage** tab in the left sidebar
2. Click **Create Database** button
3. Select **KV** from the database options
4. Choose a plan:
   - **Free tier** - Good for development (256 MB storage)
   - **Pro tier** - For production (starts at $0.20/GB)
5. Select a **region** closest to your users
6. Give it a **name** (e.g., "my-project-cache")
7. Click **Create**

### Step 3: Get Your Credentials

1. After creation, click on your **KV database** name
2. You'll see tabs at the top: **Overview**, **.env.local**, **Settings**, etc.
3. Click on the **`.env.local`** tab
4. You'll see these environment variables:

```env
KV_REST_API_URL=https://your-database-name-abc123.vercel-storage.com
KV_REST_API_TOKEN=Axxx...long-token-string...xxx
KV_REST_API_READ_ONLY_TOKEN=Axxx...read-only-token...xxx
```

### Step 4: Copy to Your Project

**Option A: Copy Manually**

- Copy `KV_REST_API_URL` and `KV_REST_API_TOKEN`
- Add them to your `.env.local` file:

```env
KV_REST_API_URL=https://your-database-name-abc123.vercel-storage.com
KV_REST_API_TOKEN=Axxx...long-token-string...xxx
```

**Option B: Use Vercel CLI**

```bash
# Install Vercel CLI if you haven't
npm i -g vercel

# Login to Vercel
vercel login

# Pull environment variables (this will download all env vars including KV)
vercel env pull .env.local
```

### Step 5: Add to Vercel Project Environment Variables

1. Go to your project → **Settings** → **Environment Variables**
2. For each variable (`KV_REST_API_URL`, `KV_REST_API_TOKEN`):
   - Click **Add New**
   - Enter the variable name
   - Paste the value
   - Select environments: **Production**, **Preview**, **Development**
   - Click **Save**

**✅ You're done!** Your app will automatically use these credentials.

---

## 🔵 Redis Labs (Redis Cloud)

Redis Labs is a popular managed Redis provider.

### Step 1: Create Account

1. Go to **[Redis Cloud](https://redis.com/try-free/)**
2. Click **Start Free** or **Sign Up**
3. Create an account (email verification required)

### Step 2: Create a Database

1. After logging in, you'll see the **Redis Cloud Dashboard**
2. Click **New Database** or **Create Database**
3. Choose a plan:
   - **Free** - 30 MB storage (good for testing)
   - **Fixed** - Starts at $5/month
   - **Flexible** - Pay-as-you-go
4. Configure your database:
   - **Database Name**: Give it a name (e.g., "my-project-cache")
   - **Region**: Choose closest to your users
   - **Memory**: Select storage size
5. Click **Activate** or **Create Database**

### Step 3: Get Connection String

1. Wait for the database to be created (usually 1-2 minutes)
2. Click on your **database name** to open details
3. You'll see connection details:
   - **Public endpoint**: `redis-12345.c123.us-east-1-1.ec2.cloud.redislabs.com:12345`
   - **Default user**: Usually `default`
   - **Password**: Click **Show** to reveal

### Step 4: Format Your REDIS_URL

The connection string format is:

```
redis://username:password@host:port
```

Example:

```env
REDIS_URL=redis://default:your-password-here@redis-12345.c123.us-east-1-1.ec2.cloud.redislabs.com:12345
```

### Step 5: Add to Your Project

1. Add to `.env.local`:

```env
REDIS_URL=redis://default:your-password-here@redis-12345.c123.us-east-1-1.ec2.cloud.redislabs.com:12345
```

2. **Important**: If you want to use a custom variable name (like `espesyal_REDIS_URL`), you'll need to update `lib/redis.ts`:
   - Open `lib/redis.ts`
   - Find line 5 and 50
   - Change `espesyal_REDIS_URL` to your custom name

**✅ Done!** Your app will connect to Redis Labs.

---

## 🟣 Upstash Redis

Upstash offers serverless Redis with a generous free tier.

### Step 1: Create Account

1. Go to **[Upstash Console](https://console.upstash.com/)**
2. Click **Sign Up** (you can use GitHub, Google, or email)
3. Verify your email if needed

### Step 2: Create Redis Database

1. After logging in, click **Create Database**
2. Fill in the form:
   - **Name**: Your database name
   - **Type**: Choose **Regional** (recommended) or **Global**
   - **Region**: Select closest to your users
   - **Primary Region**: Same as region
   - **Plan**:
     - **Free** - 10,000 commands/day, 256 MB storage
     - **Pay as you go** - $0.20 per 100K commands
3. Click **Create**

### Step 3: Get Credentials

1. After creation, click on your **database name**
2. You'll see the **Details** page with:
   - **UPSTASH_REDIS_REST_URL**: `https://your-db-name.upstash.io`
   - **UPSTASH_REDIS_REST_TOKEN**: Long token string

### Step 4: Choose Connection Method

**Option A: REST API (Recommended for Serverless)**
Upstash provides REST API which works well with serverless functions:

```env
UPSTASH_REDIS_REST_URL=https://your-db-name.upstash.io
UPSTASH_REDIS_REST_TOKEN=your-token-here
```

**Note**: You'll need to install `@upstash/redis` package and update `lib/redis.ts` to use Upstash client.

**Option B: Redis Protocol**
If you want to use standard Redis connection:

1. Click **Redis CLI** tab in Upstash dashboard
2. You'll see connection details:
   - **Host**: `your-db-name.upstash.io`
   - **Port**: `6379` (or shown port)
   - **Password**: Click to reveal

Format as:

```env
REDIS_URL=redis://default:your-password@your-db-name.upstash.io:6379
```

### Step 5: Add to Your Project

Add to `.env.local`:

```env
REDIS_URL=redis://default:your-password@your-db-name.upstash.io:6379
```

**✅ Done!**

---

## 🟠 AWS ElastiCache

If you're using AWS infrastructure.

### Step 1: Access AWS Console

1. Go to **[AWS Console](https://console.aws.amazon.com/)**
2. Sign in to your AWS account
3. Search for **ElastiCache** in the services search bar

### Step 2: Create Redis Cluster

1. Click **Create Redis cluster**
2. Configure:
   - **Name**: Your cluster name
   - **Engine**: Redis
   - **Version**: Latest stable
   - **Node type**: Choose based on needs (t3.micro for testing)
   - **Number of replicas**: 0 for testing, 1+ for production
   - **Subnet group**: Create or select existing
   - **Security group**: Configure to allow access from your app
3. Click **Create**

### Step 3: Get Connection Details

1. Wait for cluster creation (5-10 minutes)
2. Click on your **cluster name**
3. In the **Details** tab, find:
   - **Primary endpoint**: `your-cluster.xxxxx.cache.amazonaws.com:6379`
   - **Port**: Usually `6379`
   - **Auth token**: If enabled (check **Security** tab)

### Step 4: Format Connection String

If **no auth token**:

```env
REDIS_URL=redis://your-cluster.xxxxx.cache.amazonaws.com:6379
```

If **auth token enabled**:

```env
REDIS_URL=redis://:your-auth-token@your-cluster.xxxxx.cache.amazonaws.com:6379
```

### Step 5: Configure Security

**Important**: Make sure your security group allows inbound connections:

1. Go to **EC2** → **Security Groups**
2. Find your ElastiCache security group
3. Add inbound rule:
   - **Type**: Custom TCP
   - **Port**: 6379
   - **Source**: Your application's IP or security group

**✅ Done!**

---

## 🔵 DigitalOcean Managed Redis

If you're using DigitalOcean.

### Step 1: Access DigitalOcean

1. Go to **[DigitalOcean Dashboard](https://cloud.digitalocean.com/)**
2. Sign in to your account
3. Click **Databases** in the left sidebar

### Step 2: Create Database

1. Click **Create Database**
2. Select **Redis**
3. Choose configuration:
   - **Datacenter region**: Closest to your users
   - **Database plan**:
     - **Basic** - Starts at $15/month
     - **Professional** - For production
4. Give it a **name**
5. Click **Create Database Cluster**

### Step 3: Get Connection Details

1. Wait for creation (2-3 minutes)
2. Click on your **database name**
3. Go to **Connection Details** tab
4. You'll see:
   - **Host**: `your-db-name.db.ondigitalocean.com`
   - **Port**: `25061` (usually)
   - **Username**: `default`
   - **Password**: Click **Show** to reveal
   - **SSL Mode**: **required**

### Step 4: Format Connection String

**Important**: DigitalOcean Redis requires SSL/TLS. Format:

```env
REDIS_URL=rediss://default:your-password@your-db-name.db.ondigitalocean.com:25061
```

Note: `rediss://` (with double 's') indicates SSL connection.

### Step 5: Update Code (if needed)

If your Redis client doesn't support SSL by default, you may need to update `lib/redis.ts`:

```typescript
redisClient = createClient({
  url: redisUrl,
  socket: {
    tls: true,
    rejectUnauthorized: false, // Only for development
  },
});
```

**✅ Done!**

---

## 🖥️ Self-Hosted Redis

If you're running Redis on your own server.

### Step 1: Install Redis

**On Ubuntu/Debian:**

```bash
sudo apt update
sudo apt install redis-server
sudo systemctl start redis-server
sudo systemctl enable redis-server
```

**On macOS:**

```bash
brew install redis
brew services start redis
```

**On Windows:**
Use WSL or Docker (recommended).

### Step 2: Configure Redis

1. Edit Redis config file:

```bash
sudo nano /etc/redis/redis.conf
```

2. Set password (optional but recommended):

```
requirepass your-strong-password-here
```

3. Bind to network interface (if accessing remotely):

```
bind 0.0.0.0
```

4. Restart Redis:

```bash
sudo systemctl restart redis-server
```

### Step 3: Get Connection Details

- **Host**: Your server's IP address or domain
- **Port**: `6379` (default)
- **Password**: The password you set (if any)

### Step 4: Format Connection String

**Without password:**

```env
REDIS_URL=redis://your-server-ip:6379
```

**With password:**

```env
REDIS_URL=redis://:your-password@your-server-ip:6379
```

**With username and password:**

```env
REDIS_URL=redis://username:password@your-server-ip:6379
```

### Step 5: Firewall Configuration

Make sure port 6379 is open:

```bash
# Ubuntu/Debian
sudo ufw allow 6379/tcp

# Or for specific IP only (more secure)
sudo ufw allow from your-app-ip to any port 6379
```

**✅ Done!**

---

## 🔍 Troubleshooting

### Issue: Connection Refused

**Solutions:**

1. Check if Redis is running: `redis-cli ping` (should return `PONG`)
2. Verify firewall allows connections
3. Check Redis bind address (should be `0.0.0.0` for remote access)
4. Verify port number is correct

### Issue: Authentication Failed

**Solutions:**

1. Double-check password in connection string
2. Verify username is correct
3. Check if Redis requires AUTH command
4. For Vercel KV, ensure you're using `KV_REST_API_TOKEN`, not password

### Issue: SSL/TLS Errors

**Solutions:**

1. Use `rediss://` instead of `redis://` for SSL connections
2. Update Redis client configuration to support TLS
3. For DigitalOcean, ensure SSL is enabled

### Issue: Vercel KV Not Working

**Solutions:**

1. Verify `KV_REST_API_URL` starts with `https://`
2. Check `KV_REST_API_TOKEN` is correct (not the read-only token)
3. Ensure variables are added to Vercel project environment variables
4. Check `.env.local` file exists and has correct values

---

## 📝 Quick Reference

### Connection String Formats

**Standard Redis:**

```
redis://username:password@host:port
redis://password@host:port
redis://host:port
```

**Redis with SSL:**

```
rediss://username:password@host:port
```

**Vercel KV (REST API):**

```
KV_REST_API_URL=https://your-db.vercel-storage.com
KV_REST_API_TOKEN=your-token
```

### Environment Variable Names

Your code supports these variable names (in order of priority):

1. `KV_REST_API_URL` + `KV_REST_API_TOKEN` (Vercel KV)
2. `espesyal_REDIS_URL` (custom name - change in `lib/redis.ts`)
3. `REDIS_URL` (standard name)

---

## ✅ Verification

After setting up, test your connection:

1. **Check environment variable is loaded:**

```bash
# In your project root
node -e "require('dotenv').config({ path: '.env.local' }); console.log(process.env.REDIS_URL || 'Not found')"
```

2. **Test Redis connection in your app:**
   The app will automatically test the connection when it starts. Check your logs for connection errors.

---

**Last Updated:** 2025-01-27








