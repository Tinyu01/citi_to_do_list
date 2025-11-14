# Developer Guide: Updating User Profile via TaskFlow API

## Getting Started
- **Base URL:** `http://localhost:5000`
- **Authentication:** All profile updates require a valid JWT Bearer token in the `Authorization` header.

## Common Operations
### 1. Update Theme Preference
```js
fetch('http://localhost:5000/auth/profile', {
  method: 'PATCH',
  headers: {
    'Authorization': 'Bearer <token>',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ preferences: { theme: 'dark' } })
})
.then(res => res.json())
.then(data => console.log(data));
```

### 2. Change Default Dashboard View
```js
fetch('http://localhost:5000/auth/profile', {
  method: 'PATCH',
  headers: {
    'Authorization': 'Bearer <token>',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ preferences: { defaultView: 'kanban' } })
})
.then(res => res.json())
```

### 3. Update Name or Email
```js
fetch('http://localhost:5000/auth/profile', {
  method: 'PATCH',
  headers: {
    'Authorization': 'Bearer <token>',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ name: 'Jane Doe', email: 'jane@example.com' })
})
.then(res => res.json())
```

## Error Handling
- **400 Bad Request:** Invalid field or value
- **401 Unauthorized:** Missing or invalid token
- **Validation errors:** Returned in the `message` field

## Best Practices
- Always validate user input before sending requests
- Only send allowed fields (`name`, `email`, `password`, `preferences`)
- Preferences are merged, not replaced—send only what you want to change
- Handle error responses gracefully in your UI

## Troubleshooting
- If you get `401 Unauthorized`, check your token and login status
- For `400 Bad Request`, review your request body for typos or unsupported fields
- If changes don’t appear, refresh your dashboard or re-login

## Example Response
```json
{
  "message": "Profile updated successfully",
  "user": {
    "id": "...",
    "username": "janedoe",
    "email": "jane@example.com",
    "name": "Jane Doe",
    "preferences": {
      "theme": "dark",
      "defaultView": "kanban"
    },
    "categories": [ ... ]
  }
}
```
