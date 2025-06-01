# LLM Guidelines

## 🚫 What NOT to do

### Git Operations
- **NEVER** manipulate git (commit, push, pull, branch operations)
- **NEVER** create commits or modify git history
- **NEVER** push to remote repositories
- User handles all git operations manually

### File Security
- **NEVER** hardcode API keys in source code
- **NEVER** commit `.env` files with real credentials
- Always use environment variables: `import.meta.env.VITE_API_KEY`
- **NEVER** delete .env files

### Deployment
- **NEVER** deploy to production automatically
- **NEVER** modify Netlify settings directly
- User handles deployment manually

