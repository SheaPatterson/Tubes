#api-standards
- - -
inclusion: filematch
fileMatchPattern: "**/{api,routes,endpoints,controllers}/**/*.{ts,js,py}"
---
# API Standards: [PROJECT_NAME]
## REST Conventions
- Plural nouns: `/users`, `/products`
- Methods: GET (read), POST (create), PUT (update), DELETE (delete)
- Status: 200 (success), 201 (created), 400 (client error), 500 (server error)
## Response Format
```typescript
// Success
{ "data": {}, "meta": { "timestamp": "ISO 8601", "requestId": "uuid" }}
// Error
{ "error": { "code": "ERROR_CODE", "message": "...", "details": {} }, "meta": {...}}
