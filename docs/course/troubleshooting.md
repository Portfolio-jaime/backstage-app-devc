# 🔧 Troubleshooting Guide

## 🚨 Common Issues & Solutions

### Database Issues

#### Issue: Entities disappear after restart
**Symptoms:**
- Registered repositories/entities are gone after `docker-compose down`
- Empty catalog after container restart
- "No entities found" message

**Root Cause:** Using SQLite in-memory database

**Solution:**
```bash
# 1. Check current database configuration
grep -A 10 "database:" backstage/app-config.yaml

# 2. Verify PostgreSQL is running
docker ps | grep postgres

# 3. Check PostgreSQL logs
docker logs backstage-postgres

# 4. Connect to PostgreSQL to verify data
docker exec -it backstage-postgres psql -U backstage -d backstage -c "SELECT COUNT(*) FROM entities;"
```

**Prevention:**
- Always use persistent database (PostgreSQL/MySQL) for production
- Use named Docker volumes for data persistence
- Regular database backups

#### Issue: Database connection errors
**Symptoms:**
```
Error: connect ECONNREFUSED 127.0.0.1:5432
Error: password authentication failed for user "backstage"
```

**Solution:**
```bash
# 1. Verify PostgreSQL container is healthy
docker-compose ps postgres

# 2. Check environment variables
docker exec backstage-app env | grep POSTGRES

# 3. Test database connection manually
docker exec -it backstage-postgres psql -U backstage -d backstage -c "SELECT 1;"

# 4. Reset database if corrupted
docker-compose down -v
docker-compose up postgres -d
# Wait for healthy status, then start backstage
docker-compose up backstage-app -d
```

### Authentication Issues

#### Issue: GitHub OAuth not working
**Symptoms:**
- "Sign in with GitHub" button missing
- OAuth redirect errors
- "Unauthorized" after GitHub login

**Debug Steps:**
```bash
# 1. Check GitHub OAuth app configuration
curl -H "Authorization: token YOUR_GITHUB_TOKEN" \
  https://api.github.com/user

# 2. Verify environment variables
docker exec backstage-app env | grep AUTH_GITHUB

# 3. Check Backstage logs for auth errors
docker logs backstage-app | grep -i "auth\|oauth\|github"

# 4. Verify OAuth app URLs in GitHub settings
# - Homepage URL: http://localhost:3000
# - Authorization callback URL: http://localhost:7007/api/auth/github/handler/frame
```

**Common Solutions:**
```yaml
# app-config.yaml - verify auth configuration
auth:
  environment: development  # Important for localhost
  providers:
    github:
      development:
        clientId: ${AUTH_GITHUB_CLIENT_ID}
        clientSecret: ${AUTH_GITHUB_CLIENT_SECRET}
        signIn:
          resolvers:
            - resolver: emailMatchingUserEntityName
```

#### Issue: Session expired errors
**Symptoms:**
- Frequent logout prompts
- "Session expired" messages
- API calls returning 401

**Solution:**
```bash
# 1. Check backend secret is properly set
docker exec backstage-app env | grep BACKEND_SECRET

# 2. Generate new backend secret if missing
cd Docker && ./generate-secrets.sh

# 3. Restart services to apply changes
docker-compose restart backstage-app
```

### Plugin Integration Issues

#### Issue: GitHub repositories not appearing
**Symptoms:**
- Empty catalog despite GitHub integration
- "No components found" message
- GitHub API rate limit errors

**Debug Steps:**
```bash
# 1. Verify GitHub token permissions
curl -H "Authorization: token YOUR_TOKEN" \
  -H "Accept: application/vnd.github.v3+json" \
  https://api.github.com/user/repos

# 2. Check rate limit status
curl -H "Authorization: token YOUR_TOKEN" \
  https://api.github.com/rate_limit

# 3. Test entity discovery
curl http://localhost:7007/api/catalog/entities | jq

# 4. Force refresh locations
curl -X POST http://localhost:7007/api/catalog/locations/123/refresh
```

**Solutions:**
```yaml
# app-config.yaml - Add entity providers
catalog:
  providers:
    github:
      providerId:
        organization: 'your-org'
        catalogPath: '/catalog-info.yaml'
        filters:
          branch: 'main'
          repository: '.*'
        schedule:
          frequency: { minutes: 30 }
          timeout: { minutes: 3 }
```

### Performance Issues

#### Issue: Slow catalog loading
**Symptoms:**
- Long page load times
- Timeout errors
- High CPU/memory usage

**Debug Commands:**
```bash
# 1. Check container resource usage
docker stats

# 2. Analyze database query performance
docker exec -it backstage-postgres psql -U backstage -d backstage
# Enable query logging
SET log_statement = 'all';
SET log_min_duration_statement = 100;

# 3. Check for large entity counts
SELECT kind, COUNT(*) FROM entities GROUP BY kind;

# 4. Monitor API response times
curl -w "@curl-format.txt" -o /dev/null -s http://localhost:7007/api/catalog/entities
```

**Optimization:**
```yaml
# app-config.yaml - Database tuning
backend:
  database:
    client: pg
    connection:
      # Connection pooling
      pool:
        min: 5
        max: 20
        acquireTimeoutMillis: 60000
        createTimeoutMillis: 30000
        destroyTimeoutMillis: 5000
        idleTimeoutMillis: 30000
        reapIntervalMillis: 1000
        createRetryIntervalMillis: 200
```

### Docker & Container Issues

#### Issue: Port already in use
**Symptoms:**
```
Error starting userland proxy: listen tcp4 0.0.0.0:3000: bind: address already in use
```

**Solution:**
```bash
# 1. Find process using the port
lsof -i :3000
netstat -tulpn | grep :3000

# 2. Kill conflicting process
kill -9 PID

# 3. Use different ports if needed
# Edit docker-compose.yml
ports:
  - "3001:3000"  # Use port 3001 instead
```

#### Issue: Container build failures
**Symptoms:**
- Build errors during `docker-compose up`
- Node.js version conflicts
- Package installation failures

**Debug Steps:**
```bash
# 1. Clean Docker environment
docker-compose down --volumes --remove-orphans
docker system prune -f

# 2. Rebuild without cache
docker-compose build --no-cache

# 3. Check Node.js version in Dockerfile
docker run --rm node:20-alpine node --version

# 4. Verify package.json integrity
cd backstage && npm ls
```

### Configuration Issues

#### Issue: Environment variables not loaded
**Symptoms:**
- Configuration errors
- `${VARIABLE_NAME}` appearing in config
- "Cannot resolve config" errors

**Debug:**
```bash
# 1. Check .env file exists and is readable
ls -la Docker/.env
cat Docker/.env

# 2. Verify environment variables in container
docker exec backstage-app env | sort

# 3. Test configuration parsing
docker exec backstage-app node -e "console.log(process.env.GITHUB_TOKEN)"
```

## 🔍 Debug Tools & Commands

### Container Debugging

```bash
# Access container shell
docker exec -it backstage-app sh

# Check container logs with timestamps
docker logs -t backstage-app

# Follow logs in real-time
docker logs -f backstage-app

# Check container resource usage
docker stats backstage-app

# Inspect container configuration
docker inspect backstage-app
```

### Database Debugging

```bash
# Connect to PostgreSQL
docker exec -it backstage-postgres psql -U backstage -d backstage

# Useful SQL queries
SELECT kind, COUNT(*) FROM entities GROUP BY kind;
SELECT * FROM locations WHERE id = 'your-location-id';
SELECT * FROM refresh_state ORDER BY last_discovery_at DESC LIMIT 10;

# Check table sizes
SELECT 
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
FROM pg_tables 
WHERE schemaname = 'public' 
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

### API Debugging

```bash
# Test API endpoints
curl -H "Accept: application/json" http://localhost:7007/api/catalog/entities

# Check API health
curl http://localhost:7007/healthcheck

# Test authentication
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:7007/api/catalog/entities

# Debug with verbose output
curl -v -H "Accept: application/json" http://localhost:7007/api/catalog/entities
```

### Network Debugging

```bash
# Test connectivity between containers
docker exec backstage-app ping postgres
docker exec backstage-app nslookup postgres

# Check port accessibility
docker exec backstage-app nc -zv postgres 5432
docker exec backstage-app nc -zv localhost 7007

# Verify Docker network
docker network ls
docker network inspect backstage-app_default
```

## 📊 Monitoring & Health Checks

### Health Check Endpoints

```bash
# Backend health
curl http://localhost:7007/healthcheck

# Database connectivity  
curl http://localhost:7007/api/catalog/entities?limit=1

# Authentication status
curl http://localhost:7007/api/auth/github/refresh
```

### Performance Monitoring

```bash
# Monitor response times
while true; do
  curl -w "%{time_total}s - %{http_code}\n" \
    -o /dev/null -s http://localhost:7007/api/catalog/entities
  sleep 5
done

# Check memory usage trends
docker stats --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.MemPerc}}"
```

### Log Analysis

```bash
# Search for specific errors
docker logs backstage-app 2>&1 | grep -i error

# Count error types  
docker logs backstage-app 2>&1 | grep -i error | sort | uniq -c

# Monitor new logs
docker logs -f backstage-app | grep -E "(ERROR|WARN|FATAL)"
```

## 🆘 Emergency Procedures

### Complete Environment Reset

```bash
#!/bin/bash
echo "🚨 Emergency Reset - This will delete ALL data!"
read -p "Are you sure? (type 'yes' to continue): " confirm

if [ "$confirm" = "yes" ]; then
  echo "Stopping all services..."
  docker-compose down --volumes --remove-orphans
  
  echo "Removing all images..."
  docker-compose down --rmi all
  
  echo "Cleaning up Docker system..."
  docker system prune -a -f --volumes
  
  echo "Rebuilding from scratch..."
  docker-compose build --no-cache
  docker-compose up -d
  
  echo "✅ Reset complete. Wait 2-3 minutes for full startup."
else
  echo "❌ Reset cancelled."
fi
```

### Backup & Restore Data

```bash
# Backup PostgreSQL data
docker exec backstage-postgres pg_dump -U backstage backstage > backup-$(date +%Y%m%d).sql

# Restore from backup
docker exec -i backstage-postgres psql -U backstage -d backstage < backup-20240820.sql
```

## 📞 Getting Help

### Log Analysis Template

When reporting issues, include:

```bash
# System Information
echo "=== System Info ==="
docker --version
docker-compose --version
uname -a

# Container Status
echo "=== Container Status ==="
docker-compose ps

# Recent Logs
echo "=== Recent Logs ==="
docker logs --tail 50 backstage-app

# Configuration Check
echo "=== Configuration ==="
grep -v "SECRET\|TOKEN\|PASSWORD" Docker/.env
```

### Support Channels

- **Course Instructor**: jaime.andres.henao.arbelaez@ba.com
- **GitHub Issues**: [backstage-course/issues](https://github.com/jaime-henao/backstage-course/issues)
- **Backstage Community**: [Discord](https://discord.gg/backstage-687207715902193673)

---

**Next**: [GitHub Integration Guide](./github-integration.md)