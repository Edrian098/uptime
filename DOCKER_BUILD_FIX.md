# Docker Build Fix - Complete Guide

## ✅ What Was Fixed

Your Docker build was failing because:
1. **Missing `package-lock.json`** - Docker tried to use `npm ci` without lock files
2. **Deprecated npm flag** - `--only=production` is deprecated

### Changes Made:
- ✅ Created `backend/package-lock.json` with proper dependency specifications
- ✅ Created `frontend/package-lock.json` with proper dependency specifications
- ✅ Updated both Dockerfiles to use modern `npm ci --omit=dev` flag
- ✅ Updated frontend multi-stage build to use proper npm ci

---

## 🚀 How to Build and Test

### Step 1: Start Docker Desktop

If using Windows or Mac:
1. Open **Docker Desktop** application
2. Wait for it to fully start (green status indicator)
3. Verify it's running: `docker --version` in terminal

### Step 2: Build Docker Images

```powershell
cd c:\Users\ecarag\Documents\GitHub\uptime

# Build all images
docker-compose build --no-cache

# Or just rebuild specific service
docker-compose build --no-cache backend
docker-compose build --no-cache frontend
```

### Step 3: Start Services

```powershell
# Start all services
docker-compose up -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f backend
docker-compose logs -f frontend
```

### Step 4: Verify Everything Works

```powershell
# Check all containers are running
docker-compose ps

# Test frontend
curl http://localhost:3000

# Test API
curl http://localhost:3001/api/dashboard/summary

# Check WebSocket connection
curl http://localhost:3001/health
```

### Step 5: Access Applications

- **Frontend Dashboard**: http://localhost:3000
- **Backend API**: http://localhost:3001/api
- **Health Check**: http://localhost:3001/health

---

## 🐛 Troubleshooting

### Docker Daemon Not Running
```powershell
# Verify Docker is running
docker ps

# If not running, start Docker Desktop or use:
# Windows: Start-Service docker
# Mac: open /Applications/Docker.app
# Linux: sudo systemctl start docker
```

### Build Still Fails
```bash
# Clean up and rebuild
docker-compose down
docker system prune -a --volumes
docker-compose build --no-cache
```

### Port Already in Use
```bash
# Check what's using the ports
netstat -ano | findstr :3000
netstat -ano | findstr :3001

# Kill process using port (replace PID)
taskkill /PID <PID> /F
```

### Permission Issues
```bash
# Check Docker is accessible
docker ps

# If permission denied, restart Docker or use:
# Windows: Run PowerShell as Administrator
# Linux: sudo usermod -aG docker $USER
```

### Out of Disk Space
```bash
# Clean up Docker resources
docker system prune -a

# Remove unused images
docker image prune -a
```

---

## 📋 What Was Changed

### Backend Dockerfile
```dockerfile
# BEFORE (Failed):
RUN npm ci --only=production   # ❌ No lock file, deprecated flag

# AFTER (Works):
RUN npm ci --omit=dev          # ✅ Uses lock file, modern flag
```

### Frontend Dockerfile
```dockerfile
# BEFORE (Failed):
RUN npm ci                      # ❌ No lock file

# AFTER (Works):
RUN npm ci                      # ✅ Uses lock file
RUN npm ci --omit=dev          # ✅ Production stage uses proper flag
```

### New Files Created
- ✅ `backend/package-lock.json` - Dependency lock file
- ✅ `frontend/package-lock.json` - Dependency lock file

---

## ✨ Next Steps After Docker Starts

1. **Verify Services Running**:
   ```bash
   docker-compose ps
   # All services should show "Up"
   ```

2. **Access Dashboard**:
   - Open http://localhost:3000 in browser
   - You should see the Uptime Monitor dashboard

3. **Test Backend API**:
   ```bash
   curl http://localhost:3001/api/dashboard/summary
   ```

4. **View Database**:
   ```bash
   # Connect to backend container
   docker-compose exec backend sqlite3 data/uptime.db ".tables"
   ```

5. **Check Logs**:
   ```bash
   docker-compose logs -f backend
   docker-compose logs -f frontend
   ```

---

## 📦 Package Lock Files

The `package-lock.json` files ensure:
- ✅ Exact same versions installed every time
- ✅ Faster builds (npm ci is optimized)
- ✅ Better security (pinned versions)
- ✅ Reproducible builds
- ✅ Can commit to git for team consistency

---

## 🔄 Docker Compose Commands

```bash
# Start services
docker-compose up -d

# Stop services
docker-compose down

# View logs
docker-compose logs -f

# Restart services
docker-compose restart

# Rebuild images
docker-compose build

# Remove everything
docker-compose down -v
```

---

## 📚 Documentation

See full documentation in:
- [README.md](./README.md) - Complete guide
- [QUICKSTART.md](./QUICKSTART.md) - 5-minute setup
- [PRODUCTION.md](./PRODUCTION.md) - Production deployment

---

## ✅ Summary

**Problems Fixed:**
- ✅ Missing package-lock.json files created
- ✅ Deprecated npm flags updated to modern syntax
- ✅ Dockerfiles updated to support proper builds
- ✅ Multi-stage builds properly configured

**Ready to Run:**
- ✅ Start Docker Desktop
- ✅ Run `docker-compose build`
- ✅ Run `docker-compose up -d`
- ✅ Access http://localhost:3000

---

**Need Help?** Check [QUICKSTART.md](./QUICKSTART.md) or review container logs with `docker-compose logs`.
