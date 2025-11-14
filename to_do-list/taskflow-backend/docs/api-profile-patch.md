# PATCH /auth/profile

Update the authenticated user's profile information and preferences.

## Description
Allows users to update their name, email, password, and UI preferences (theme, defaultView). Preferences are safely merged to avoid overwriting unrelated settings.

## Request
- **Method:** PATCH
- **Endpoint:** `/auth/profile`
- **Authentication:** Required (JWT Bearer token)

### Request Body
| Field        | Type     | Required | Description                                  |
|--------------|----------|----------|----------------------------------------------|
| name         | string   | No       | User's display name                          |
| email        | string   | No       | User's email address                         |
| password     | string   | No       | New password                                 |
| preferences  | object   | No       | UI preferences (see below)                   |

#### Preferences Object
| Key         | Type   | Allowed Values                | Description                |
|-------------|--------|------------------------------|----------------------------|
| theme       | string | light, dark, sunset, forest, ocean | UI theme                  |
| defaultView | string | list, kanban, calendar       | Default dashboard view     |

### Example Request
```http
PATCH /auth/profile
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Jane Doe",
  "preferences": {
    "theme": "dark",
    "defaultView": "kanban"
  }
}
```

## Response
- **Success:** 200 OK
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
- **Error:** 400 Bad Request
```json
{
  "message": "Invalid updates"
}
```

## Error Responses
| Status | Message              | Description                       |
|--------|----------------------|-----------------------------------|
| 400    | Invalid updates      | One or more fields not allowed    |
| 400    | <error.message>      | Validation or save error          |
| 401    | Please authenticate  | Missing or invalid auth token     |

## Example Usage
```js
fetch('/auth/profile', {
  method: 'PATCH',
  headers: {
    'Authorization': 'Bearer <token>',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ preferences: { theme: 'ocean' } })
})
.then(res => res.json())
.then(data => console.log(data));
```

## Notes
- Only allowed fields are updated; others are ignored.
- Preferences are merged, not replaced.
- Requires authentication.
