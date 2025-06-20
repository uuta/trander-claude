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

## 📋 Problem-Solving Approach

### Solution Prioritization
When encountering issues, present solutions in this order:
1. **Quick Fix**: Immediate solution for local development
2. **Proper Solution**: Production-ready approach
3. **Alternative**: Different architectural approach if applicable

Always explain trade-offs and let the user choose based on their needs.

### When to Use Each Approach
- **Quick Fix**: User needs immediate progress, prototyping
- **Proper Solution**: Production deployment, long-term maintenance
- **Alternative**: When constraints make standard solutions impractical

## 🎯 Task Management

### When to Use TodoWrite
- Complex multi-step implementations
- Debugging sessions with multiple investigation paths
- Any task requiring more than 3 discrete steps
- When user requests visibility into progress

### Task Structure
- Break down complex tasks into specific, actionable items
- Mark tasks as "in_progress" before starting work
- Update status immediately upon completion
- Use priority levels: high (blocking issues), medium (features), low (optimizations)

