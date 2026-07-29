# API reference

Interactive Swagger UI is served at `GET /api-docs` when the server is running. This document summarizes the surface area; all routes are prefixed with `/api/v1`.

All responses share this envelope:

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Success",
  "data": { "...": "..." },
  "meta": { "...": "optional" }
}
```

Authenticated routes accept either a `Bearer` access token or the `accessToken` httpOnly cookie set on login.

## Auth — `/auth`

| Method | Path                   | Auth           | Description                                    |
| ------ | ---------------------- | -------------- | ---------------------------------------------- |
| POST   | `/signup`              | —              | Create an account, sends a verification email  |
| POST   | `/login`               | —              | Log in, returns access token + sets cookies    |
| POST   | `/refresh`             | refresh cookie | Rotate access/refresh tokens                   |
| POST   | `/logout`              | required       | Invalidate all sessions (bumps `tokenVersion`) |
| GET    | `/me`                  | required       | Current user profile                           |
| POST   | `/forgot-password`     | —              | Send password reset email                      |
| POST   | `/reset-password`      | —              | Reset password with emailed token              |
| POST   | `/verify-email`        | —              | Verify email with emailed token                |
| POST   | `/resend-verification` | required       | Resend verification email                      |
| POST   | `/change-password`     | required       | Change password (invalidates other sessions)   |

## Users — `/users`

| Method | Path         | Description                                           |
| ------ | ------------ | ----------------------------------------------------- |
| PATCH  | `/me`        | Update name / preferences                             |
| POST   | `/me/avatar` | Upload avatar (multipart `avatar`)                    |
| DELETE | `/me`        | Delete account (requires password)                    |
| GET    | `/search?q=` | Search users by name/email (for collaborator invites) |

## Notes — `/notes`

| Method               | Path                                          | Description                                                              |
| -------------------- | --------------------------------------------- | ------------------------------------------------------------------------ |
| GET                  | `/shared/:token`                              | Public — fetch a note via its share link                                 |
| POST                 | `/`                                           | Create a note                                                            |
| GET                  | `/?filter=&folder=&tag=&search=&page=&limit=` | List notes accessible to the user                                        |
| GET                  | `/:id`                                        | Get a note (returns the caller's effective role)                         |
| PATCH                | `/:id`                                        | Update title/content/tags/folder — snapshots a version on content change |
| DELETE               | `/:id`                                        | Move to trash                                                            |
| POST                 | `/:id/restore`                                | Restore from trash                                                       |
| DELETE               | `/:id/permanent`                              | Permanently delete                                                       |
| POST                 | `/:id/duplicate`                              | Duplicate a note                                                         |
| POST                 | `/:id/pin` \| `/favorite` \| `/archive`       | Toggle flags                                                             |
| POST                 | `/:id/collaborators`                          | Add a collaborator by email                                              |
| DELETE               | `/:id/collaborators/:collaboratorId`          | Remove a collaborator                                                    |
| PUT                  | `/:id/share-link`                             | Enable/disable/configure the public share link                           |
| POST                 | `/:id/invitations`                            | Invite by email (existing or new user)                                   |
| GET                  | `/:id/invitations`                            | List pending invitations                                                 |
| GET                  | `/:id/versions`                               | List version history                                                     |
| POST                 | `/:id/versions/:versionNumber/restore`        | Restore a version                                                        |
| `/:id/comments/*`    | See Comments                                  |
| `/:id/attachments/*` | See Attachments                               |
| `/:id/ai/*`          | See AI                                        |

## Comments — `/notes/:id/comments`

`GET /`, `POST /`, `POST /:commentId/resolve`, `DELETE /:commentId`.

## Attachments — `/notes/:id/attachments`

`GET /`, `POST /` (multipart `file`, ≤15MB), `DELETE /:attachmentId`.

## AI — `/notes/:id/ai`

All endpoints operate on the note's plain-text content and return `{ result }`. Rate-limited to 10 requests/minute per IP.

`POST /summarize`, `/fix-grammar`, `/rewrite` (`{ style }`), `/translate` (`{ targetLanguage }`), `/generate-title`, `/generate-tags`, `/meeting-notes`, `/action-items`.

## Folders — `/folders`

`GET /?workspace=`, `POST /`, `PATCH /:id`, `DELETE /:id`.

## Workspaces — `/workspaces`

`GET /` — list workspaces the user owns or belongs to (a default workspace is created automatically on signup).

## Notifications — `/notifications`

`GET /`, `PATCH /:id/read`, `PATCH /read-all`, `DELETE /:id`.

## Invitations — `/invitations`

`POST /:token/accept`, `POST /:token/decline`.

## Admin — `/admin` (requires `role: admin`)

| Method | Path                 | Description                              |
| ------ | -------------------- | ---------------------------------------- |
| GET    | `/users`             | Paginated user list with search          |
| PATCH  | `/users/:id/suspend` | Suspend/unsuspend a user                 |
| DELETE | `/users/:id`         | Delete a user and their notes            |
| GET    | `/notes`             | Paginated note list with search          |
| DELETE | `/notes/:id`         | Force-delete a note                      |
| GET    | `/analytics`         | Totals + 30-day signup/notes time series |
| GET    | `/logs`              | Paginated activity audit log             |

## Socket.IO events

See [ARCHITECTURE.md](ARCHITECTURE.md#real-time-collaboration) and `server/src/constants/socketEvents.ts` for the authoritative event contract (`join-room`, `leave-room`, `typing-start/stop`, `cursor-update`, `note-patch`, `save-note` → `note-saved`, `presence-sync`, `user-online/offline`, `comment-added`, `comment-resolved`, `notification`).
