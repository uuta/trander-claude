# LLM Guidelines

## 🚫 What NOT to do

### Git Operations
- **NEVER** manipulate git (commit, push, pull, branch operations)
- **NEVER** create commits or modify git history
- **NEVER** push to remote repositories
- User handles all git operations manually

### File Security
- **NEVER** implement without my permission
- **NEVER** hardcode API keys in source code
- **NEVER** commit `.env` files with real credentials
- Always use environment variables: `import.meta.env.VITE_API_KEY`
- **NEVER** delete .env files
- **NEVER** log or expose API keys in console/error messages
- **NEVER** include sensitive data in git commits
- Validate API keys exist before making requests
- Use secure HTTPS endpoints only
- Implement proper error handling without exposing internal details
- **NEVER** store user location data permanently without consent
- Use secure storage methods for user preferences (localStorage is acceptable for non-sensitive data)
- Implement rate limiting awareness in API calls
- **NEVER** expose internal API structure or implementation details to users

### Deployment
- **NEVER** deploy to production automatically
- **NEVER** modify Netlify settings directly
- User handles deployment manually

