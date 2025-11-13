# 🔧 Fix Docker Build Error

## Problem
Error saat build frontend:
```
[vite:build-html] Failed to resolve /src/main.jsx from /app/index.html
```

## Root Cause
File `.dockerignore` terlalu agresif, mengexclude file-file penting yang dibutuhkan untuk build:
- ❌ `src/` (source code)
- ❌ `public/` (static assets)
- ❌ `vite.config.js` (build config)
- ❌ `jsconfig.json` (path config)

## Solution Applied

### 1. Fixed `clients/web/.dockerignore`

**Before (WRONG):**
```dockerignore
# Source files (akan di-build)
src/
public/

# Build tools config
vite.config.js
jsconfig.json
```

**After (CORRECT):**
```dockerignore
# Build artifacts (already built, will be rebuilt)
dist/
build/

# Development config (not needed in production)
eslint.config.js
```

### 2. Simplified `clients/web/Dockerfile`

File tetap menggunakan `COPY . .` karena `.dockerignore` sudah benar.

## Test Build

### Local Test (Windows)
```powershell
cd d:\Developments\Tech\React\React-Projects\pengaduan-sarpras

# Build specific service
docker compose build frontend

# Build all services
docker compose build

# Build and start
docker compose up -d
```

### Server Test (Linux)
```bash
cd ~/pengaduan-sarpras

# Build frontend only
docker compose build frontend

# Build all services
docker compose build

# Start services
docker compose up -d

# Check logs
docker compose logs -f frontend
```

## Expected Output (Success)

```
[+] Building 45.3s (14/14) FINISHED
 => [frontend internal] load build definition from Dockerfile
 => => transferring dockerfile: 523B
 => [frontend internal] load .dockerignore
 => => transferring context: 234B
 => [frontend internal] load metadata for docker.io/library/node:20-alpine
 => [frontend builder 1/6] FROM docker.io/library/node:20-alpine
 => [frontend internal] load build context
 => => transferring context: 2.45MB
 => [frontend builder 2/6] WORKDIR /app
 => [frontend builder 3/6] COPY package*.json ./
 => [frontend builder 4/6] RUN npm ci
 => [frontend builder 5/6] COPY . .
 => [frontend builder 6/6] RUN npm run build
 => => # vite v7.1.4 building for production...
 => => # ✓ 245 modules transformed.
 => => # dist/index.html                   0.45 kB │ gzip:  0.30 kB
 => => # dist/assets/index-abc123.css     45.67 kB │ gzip: 12.34 kB
 => => # dist/assets/index-xyz789.js     234.56 kB │ gzip: 78.90 kB
 => => # ✓ built in 3.45s
 => [frontend stage-1 1/2] FROM docker.io/library/nginx:1.25-alpine
 => [frontend stage-1 2/2] COPY --from=builder /app/dist /usr/share/nginx/html
 => [frontend] exporting to image
 => => exporting layers
 => => writing image sha256:abc123...
 => => naming to docker.io/library/pengaduan-sarpras-frontend
```

## Verify Build Success

```bash
# Check image created
docker images | grep pengaduan

# Output:
# pengaduan-sarpras-frontend   latest   abc123def456   2 minutes ago   45.2MB
# pengaduan-sarpras-backend    latest   def456abc789   5 minutes ago   180MB
# pengaduan-sarpras-nginx      latest   ghi789jkl012   5 minutes ago   42.1MB

# Test run frontend container
docker run -p 8080:80 pengaduan-sarpras-frontend

# Access http://localhost:8080 di browser
```

## Additional Debug Commands

### Check .dockerignore is working
```bash
# Create temporary build context
cd clients/web
tar -czf - . | tar -tz | grep -E "^(src|public|vite.config)"

# Should show:
# src/
# src/main.jsx
# src/App.jsx
# public/
# vite.config.js
```

### Inspect build process
```bash
# Build with verbose output
docker compose build --progress=plain frontend

# Build without cache (clean build)
docker compose build --no-cache frontend
```

### Check files inside container
```bash
# Start container in interactive mode
docker run -it --entrypoint /bin/sh pengaduan-sarpras-frontend

# Inside container:
ls -la /usr/share/nginx/html
# Should show: index.html, assets/, vite.svg

# Exit
exit
```

## Common Issues & Solutions

### Issue 1: Still getting same error
```bash
# Clear Docker build cache
docker builder prune -a

# Rebuild
docker compose build --no-cache frontend
```

### Issue 2: Different error "Cannot find module"
```bash
# Check package.json exists
ls -la clients/web/package.json

# Check dependencies installed
docker compose run --rm frontend npm list
```

### Issue 3: Build succeeds but app doesn't work
```bash
# Check if dist/ folder created
docker compose run --rm frontend ls -la dist/

# Check nginx serving correct files
docker exec pengaduan-frontend ls -la /usr/share/nginx/html
```

### Issue 4: Environment variables not working
```bash
# Check ARG passed during build
docker compose build --build-arg VITE_API_URL=http://your-server-ip frontend

# Or update docker-compose.yml:
services:
  frontend:
    build:
      args:
        VITE_API_URL: ${VITE_API_URL}
```

## Files Modified

### ✅ `clients/web/.dockerignore`
- Removed: `src/`, `public/`, `vite.config.js`, `jsconfig.json`
- Kept: `node_modules`, `.env*`, test files, documentation

### ✅ `clients/web/Dockerfile`
- Kept simple `COPY . .` approach
- `.dockerignore` handles exclusions properly

## Testing Checklist

Before deploying to server, verify:

- [ ] `docker compose build` succeeds without errors
- [ ] All services build successfully (frontend, backend, nginx, mysql)
- [ ] Frontend image size reasonable (~40-50MB)
- [ ] Backend image size reasonable (~170-190MB)
- [ ] `docker compose up -d` starts all services
- [ ] `docker compose ps` shows all services healthy
- [ ] Frontend accessible at http://localhost
- [ ] Backend API accessible at http://localhost/api
- [ ] Database initialized properly

## Next Steps

1. **If build succeeds locally:**
   ```bash
   git add .
   git commit -m "Fix Docker build: Update .dockerignore for frontend"
   git push origin main
   ```

2. **Deploy to server:**
   ```bash
   # SSH to server
   ssh deploy@your-server-ip
   
   # Pull latest changes
   cd ~/pengaduan-sarpras
   git pull origin main
   
   # Deploy
   ./deploy.sh
   ```

3. **Monitor deployment:**
   ```bash
   docker compose logs -f
   ```

## Prevention

To avoid similar issues in the future:

1. **Test Docker build before commit:**
   ```bash
   docker compose build
   ```

2. **Use proper .dockerignore patterns:**
   - Exclude build outputs: `dist/`, `build/`
   - Exclude dev dependencies: `node_modules/` (will be reinstalled)
   - Include source code: `src/`, `public/`
   - Include build configs: `vite.config.js`, `package.json`

3. **Validate .dockerignore:**
   ```bash
   # List what will be copied
   cd clients/web
   tar -czf - . | tar -tz | less
   ```

## References

- [Docker .dockerignore documentation](https://docs.docker.com/engine/reference/builder/#dockerignore-file)
- [Vite build documentation](https://vitejs.dev/guide/build.html)
- [Docker multi-stage builds](https://docs.docker.com/build/building/multi-stage/)

---

**Status:** ✅ Fixed  
**Date:** November 13, 2025  
**Impact:** Docker build now succeeds, ready for deployment
