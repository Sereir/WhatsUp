# Documentation API WhatsUp

Cette documentation décrit l'ensemble des endpoints REST et des événements WebSocket de l'API WhatsUp.

## Table des Matières

- [Vue d'Ensemble](#vue-densemble)
- [Authentification](#authentification)
- [Endpoints REST](#endpoints-rest)
  - [Authentification](#authentification-1)
  - [Utilisateurs](#utilisateurs)
  - [Contacts](#contacts)
  - [Conversations](#conversations)
  - [Messages](#messages)
  - [Notifications](#notifications)
  - [Sessions](#sessions)
  - [Synchronisation](#synchronisation)
- [WebSocket Events](#websocket-events)
- [Codes d'Erreur](#codes-derreur)
- [Rate Limiting](#rate-limiting)
- [Exemples](#exemples)

---

## Vue d'Ensemble

**Base URL** : `http://localhost:3000` (développement) ou votre domaine en production

**Version API** : v1

**Format** : JSON

**Authentification** : JWT Bearer Token

---

## Authentification

La plupart des endpoints nécessitent une authentification via JWT.

### Obtenir un Token

**Endpoint** : `POST /api/auth/login`

**Headers** :
```
Content-Type: application/json
```

**Body** :
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Réponse** (200 OK) :
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "email": "user@example.com",
      "username": "johndoe",
      "avatar": "https://example.com/avatars/user.jpg"
    }
  },
  "message": "Login successful"
}
```

### Utiliser le Token

Incluez le token dans le header `Authorization` de toutes les requêtes authentifiées :

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## Endpoints REST

### Authentification

#### 📝 Inscription

**POST** `/api/auth/register`

Créer un nouveau compte utilisateur.

**Headers** :
```
Content-Type: application/json
```

**Body** :
```json
{
  "email": "user@example.com",
  "username": "johndoe",
  "password": "SecurePass123!"
}
```

**Validations** :
- `email` : Format email valide, unique
- `username` : 3-30 caractères, alphanumérique + underscore, unique
- `password` : Minimum 8 caractères

**Réponse** (201 Created) :
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "email": "user@example.com",
      "username": "johndoe",
      "avatar": null,
      "createdAt": "2025-11-27T10:00:00.000Z"
    }
  },
  "message": "User registered successfully"
}
```

**Erreurs** :
- `400 Bad Request` : Données invalides
- `409 Conflict` : Email ou username déjà utilisé

---

#### 🔐 Connexion

**POST** `/api/auth/login`

Se connecter avec email et mot de passe.

**Body** :
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

**Réponse** (200 OK) : Voir [Obtenir un Token](#obtenir-un-token)

**Erreurs** :
- `400 Bad Request` : Email ou mot de passe manquant
- `401 Unauthorized` : Identifiants incorrects
- `429 Too Many Requests` : Trop de tentatives (rate limit : 5/15min)

---

#### 🚪 Déconnexion

**POST** `/api/auth/logout`

Déconnecter l'utilisateur et invalider le token.

**Headers** :
```
Authorization: Bearer <token>
```

**Réponse** (200 OK) :
```json
{
  "success": true,
  "message": "Logout successful"
}
```

---

#### 👤 Profil Actuel

**GET** `/api/auth/me`

Récupérer les informations de l'utilisateur connecté.

**Headers** :
```
Authorization: Bearer <token>
```

**Réponse** (200 OK) :
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "email": "user@example.com",
      "username": "johndoe",
      "avatar": "https://example.com/avatars/user.jpg",
      "bio": "Hello, I'm John!",
      "status": "online",
      "createdAt": "2025-11-27T10:00:00.000Z"
    }
  }
}
```

**Erreurs** :
- `401 Unauthorized` : Token invalide ou expiré

---

### Utilisateurs

#### 👥 Liste des Utilisateurs

**GET** `/api/users`

Rechercher des utilisateurs (pagination).

**Headers** :
```
Authorization: Bearer <token>
```

**Query Parameters** :
- `search` (optionnel) : Recherche par username ou email
- `page` (optionnel, défaut: 1) : Numéro de page
- `limit` (optionnel, défaut: 20, max: 100) : Nombre de résultats par page

**Exemple** :
```
GET /api/users?search=john&page=1&limit=10
```

**Réponse** (200 OK) :
```json
{
  "success": true,
  "data": {
    "users": [
      {
        "id": "507f1f77bcf86cd799439011",
        "username": "johndoe",
        "avatar": "https://example.com/avatars/user.jpg",
        "status": "online"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 1,
      "pages": 1
    }
  }
}
```

---

#### 🔍 Détails d'un Utilisateur

**GET** `/api/users/:id`

Récupérer les informations publiques d'un utilisateur.

**Headers** :
```
Authorization: Bearer <token>
```

**Réponse** (200 OK) :
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "username": "johndoe",
      "avatar": "https://example.com/avatars/user.jpg",
      "bio": "Hello, I'm John!",
      "status": "online"
    }
  }
}
```

**Erreurs** :
- `404 Not Found` : Utilisateur introuvable

---

#### ✏️ Mettre à Jour le Profil

**PATCH** `/api/users/profile`

Mettre à jour les informations de profil de l'utilisateur connecté.

**Headers** :
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Body** :
```json
{
  "username": "newusername",
  "bio": "New bio text",
  "status": "busy"
}
```

**Champs modifiables** :
- `username` : 3-30 caractères
- `bio` : 0-150 caractères
- `status` : `online`, `away`, `busy`, `dnd` (do not disturb)

**Réponse** (200 OK) :
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "username": "newusername",
      "bio": "New bio text",
      "status": "busy"
    }
  },
  "message": "Profile updated successfully"
}
```

**Erreurs** :
- `400 Bad Request` : Données invalides
- `409 Conflict` : Username déjà utilisé

---

#### 📷 Mettre à Jour l'Avatar

**POST** `/api/users/avatar`

Télécharger une nouvelle photo de profil.

**Headers** :
```
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Body (form-data)** :
- `avatar` : Fichier image (JPG, PNG, GIF, WebP)

**Limitations** :
- Taille max : 5 MB
- Types autorisés : image/jpeg, image/png, image/gif, image/webp

**Réponse** (200 OK) :
```json
{
  "success": true,
  "data": {
    "avatar": "https://example.com/avatars/507f1f77bcf86cd799439011.jpg"
  },
  "message": "Avatar uploaded successfully"
}
```

**Erreurs** :
- `400 Bad Request` : Fichier invalide ou trop volumineux
- `415 Unsupported Media Type` : Type de fichier non supporté

---

### Contacts

#### 📋 Liste des Contacts

**GET** `/api/contacts`

Récupérer la liste des contacts de l'utilisateur.

**Headers** :
```
Authorization: Bearer <token>
```

**Query Parameters** :
- `status` (optionnel) : Filtrer par statut (`accepted`, `pending`, `blocked`)

**Réponse** (200 OK) :
```json
{
  "success": true,
  "data": {
    "contacts": [
      {
        "id": "507f1f77bcf86cd799439012",
        "user": {
          "id": "507f1f77bcf86cd799439013",
          "username": "janedoe",
          "avatar": "https://example.com/avatars/jane.jpg",
          "status": "online"
        },
        "status": "accepted",
        "createdAt": "2025-11-27T10:00:00.000Z"
      }
    ]
  }
}
```

---

#### ➕ Ajouter un Contact

**POST** `/api/contacts`

Envoyer une demande de contact.

**Headers** :
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Body** :
```json
{
  "userId": "507f1f77bcf86cd799439013"
}
```

**Réponse** (201 Created) :
```json
{
  "success": true,
  "data": {
    "contact": {
      "id": "507f1f77bcf86cd799439012",
      "user": {
        "id": "507f1f77bcf86cd799439013",
        "username": "janedoe",
        "avatar": "https://example.com/avatars/jane.jpg"
      },
      "status": "pending"
    }
  },
  "message": "Contact request sent"
}
```

**Erreurs** :
- `400 Bad Request` : userId invalide ou manquant
- `404 Not Found` : Utilisateur introuvable
- `409 Conflict` : Contact déjà existant

---

#### ✅ Accepter une Demande de Contact

**PATCH** `/api/contacts/:id/accept`

Accepter une demande de contact en attente.

**Headers** :
```
Authorization: Bearer <token>
```

**Réponse** (200 OK) :
```json
{
  "success": true,
  "data": {
    "contact": {
      "id": "507f1f77bcf86cd799439012",
      "status": "accepted"
    }
  },
  "message": "Contact request accepted"
}
```

---

#### ❌ Refuser/Supprimer un Contact

**DELETE** `/api/contacts/:id`

Refuser une demande ou supprimer un contact existant.

**Headers** :
```
Authorization: Bearer <token>
```

**Réponse** (200 OK) :
```json
{
  "success": true,
  "message": "Contact removed"
}
```

---

#### 🚫 Bloquer un Contact

**PATCH** `/api/contacts/:id/block`

Bloquer un utilisateur.

**Headers** :
```
Authorization: Bearer <token>
```

**Réponse** (200 OK) :
```json
{
  "success": true,
  "data": {
    "contact": {
      "id": "507f1f77bcf86cd799439012",
      "status": "blocked"
    }
  },
  "message": "User blocked"
}
```

---

### Conversations

#### 💬 Liste des Conversations

**GET** `/api/conversations`

Récupérer toutes les conversations de l'utilisateur.

**Headers** :
```
Authorization: Bearer <token>
```

**Réponse** (200 OK) :
```json
{
  "success": true,
  "data": {
    "conversations": [
      {
        "id": "507f1f77bcf86cd799439014",
        "type": "individual",
        "participants": [
          {
            "id": "507f1f77bcf86cd799439011",
            "username": "johndoe",
            "avatar": "https://example.com/avatars/john.jpg"
          },
          {
            "id": "507f1f77bcf86cd799439013",
            "username": "janedoe",
            "avatar": "https://example.com/avatars/jane.jpg",
            "status": "online"
          }
        ],
        "lastMessage": {
          "content": "Hello!",
          "sender": "507f1f77bcf86cd799439013",
          "timestamp": "2025-11-27T12:00:00.000Z"
        },
        "unreadCount": 2,
        "updatedAt": "2025-11-27T12:00:00.000Z"
      },
      {
        "id": "507f1f77bcf86cd799439015",
        "type": "group",
        "name": "Project Team",
        "avatar": "https://example.com/groups/team.jpg",
        "participants": [
          { "id": "507f1f77bcf86cd799439011", "username": "johndoe" },
          { "id": "507f1f77bcf86cd799439013", "username": "janedoe" },
          { "id": "507f1f77bcf86cd799439016", "username": "bobsmith" }
        ],
        "admins": ["507f1f77bcf86cd799439011"],
        "lastMessage": {
          "content": "Meeting at 3pm",
          "sender": "507f1f77bcf86cd799439013",
          "timestamp": "2025-11-27T11:30:00.000Z"
        },
        "unreadCount": 0,
        "updatedAt": "2025-11-27T11:30:00.000Z"
      }
    ]
  }
}
```

---

#### 🆕 Créer une Conversation

**POST** `/api/conversations`

Créer une nouvelle conversation (individuelle ou de groupe).

**Headers** :
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Body (Conversation Individuelle)** :
```json
{
  "type": "individual",
  "participantId": "507f1f77bcf86cd799439013"
}
```

**Body (Groupe)** :
```json
{
  "type": "group",
  "name": "My Group",
  "participantIds": [
    "507f1f77bcf86cd799439013",
    "507f1f77bcf86cd799439016"
  ]
}
```

**Validations** :
- `type` : `individual` ou `group`
- `name` : Requis pour les groupes, 3-50 caractères
- `participantIds` : Array de userIds, min 2 pour les groupes, max 100

**Réponse** (201 Created) :
```json
{
  "success": true,
  "data": {
    "conversation": {
      "id": "507f1f77bcf86cd799439015",
      "type": "group",
      "name": "My Group",
      "participants": [...],
      "admins": ["507f1f77bcf86cd799439011"],
      "createdAt": "2025-11-27T12:00:00.000Z"
    }
  },
  "message": "Conversation created"
}
```

**Erreurs** :
- `400 Bad Request` : Données invalides
- `404 Not Found` : Participant(s) introuvable(s)
- `409 Conflict` : Conversation individuelle déjà existante

---

#### 📖 Détails d'une Conversation

**GET** `/api/conversations/:id`

Récupérer les détails d'une conversation.

**Headers** :
```
Authorization: Bearer <token>
```

**Réponse** (200 OK) :
```json
{
  "success": true,
  "data": {
    "conversation": {
      "id": "507f1f77bcf86cd799439015",
      "type": "group",
      "name": "My Group",
      "description": "Group description",
      "avatar": "https://example.com/groups/group.jpg",
      "participants": [
        {
          "id": "507f1f77bcf86cd799439011",
          "username": "johndoe",
          "avatar": "https://example.com/avatars/john.jpg",
          "role": "admin"
        },
        {
          "id": "507f1f77bcf86cd799439013",
          "username": "janedoe",
          "avatar": "https://example.com/avatars/jane.jpg",
          "role": "member"
        }
      ],
      "admins": ["507f1f77bcf86cd799439011"],
      "settings": {
        "onlyAdminsCanSend": false,
        "onlyAdminsCanEditInfo": true,
        "onlyAdminsCanAddMembers": false
      },
      "createdAt": "2025-11-27T10:00:00.000Z"
    }
  }
}
```

**Erreurs** :
- `404 Not Found` : Conversation introuvable
- `403 Forbidden` : Non membre de la conversation

---

#### ✏️ Mettre à Jour une Conversation

**PATCH** `/api/conversations/:id`

Mettre à jour les informations d'une conversation (groupes uniquement).

**Headers** :
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Body** :
```json
{
  "name": "Updated Group Name",
  "description": "Updated description",
  "settings": {
    "onlyAdminsCanSend": true
  }
}
```

**Permissions** : Administrateurs uniquement

**Réponse** (200 OK) :
```json
{
  "success": true,
  "data": {
    "conversation": {
      "id": "507f1f77bcf86cd799439015",
      "name": "Updated Group Name",
      "description": "Updated description",
      "settings": { ... }
    }
  },
  "message": "Conversation updated"
}
```

**Erreurs** :
- `403 Forbidden` : Non administrateur

---

#### ➕ Ajouter un Membre

**POST** `/api/conversations/:id/members`

Ajouter des membres à un groupe.

**Headers** :
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Body** :
```json
{
  "userIds": [
    "507f1f77bcf86cd799439017",
    "507f1f77bcf86cd799439018"
  ]
}
```

**Permissions** : Selon paramètres du groupe

**Réponse** (200 OK) :
```json
{
  "success": true,
  "data": {
    "addedMembers": [
      {
        "id": "507f1f77bcf86cd799439017",
        "username": "newuser"
      }
    ]
  },
  "message": "Members added"
}
```

**Erreurs** :
- `400 Bad Request` : Limite de 100 membres dépassée
- `403 Forbidden` : Pas les permissions
- `404 Not Found` : Utilisateur(s) introuvable(s)

---

#### ➖ Retirer un Membre

**DELETE** `/api/conversations/:id/members/:userId`

Retirer un membre d'un groupe.

**Headers** :
```
Authorization: Bearer <token>
```

**Permissions** : Administrateurs uniquement

**Réponse** (200 OK) :
```json
{
  "success": true,
  "message": "Member removed"
}
```

**Erreurs** :
- `403 Forbidden` : Non administrateur
- `400 Bad Request` : Ne peut pas retirer le dernier admin

---

#### 🚪 Quitter une Conversation

**POST** `/api/conversations/:id/leave`

Quitter un groupe.

**Headers** :
```
Authorization: Bearer <token>
```

**Réponse** (200 OK) :
```json
{
  "success": true,
  "message": "Left conversation"
}
```

**Erreurs** :
- `400 Bad Request` : Dernier admin, doit promouvoir un autre membre d'abord

---

#### 👑 Promouvoir en Admin

**PATCH** `/api/conversations/:id/members/:userId/promote`

Promouvoir un membre en administrateur.

**Headers** :
```
Authorization: Bearer <token>
```

**Permissions** : Administrateurs uniquement

**Réponse** (200 OK) :
```json
{
  "success": true,
  "message": "User promoted to admin"
}
```

---

#### 👤 Rétrograder un Admin

**PATCH** `/api/conversations/:id/members/:userId/demote`

Rétrograder un administrateur en membre.

**Headers** :
```
Authorization: Bearer <token>
```

**Permissions** : Administrateurs uniquement

**Réponse** (200 OK) :
```json
{
  "success": true,
  "message": "Admin demoted to member"
}
```

**Erreurs** :
- `400 Bad Request` : Ne peut pas rétrograder le dernier admin

---

### Messages

#### 📨 Liste des Messages

**GET** `/api/conversations/:conversationId/messages`

Récupérer l'historique des messages d'une conversation.

**Headers** :
```
Authorization: Bearer <token>
```

**Query Parameters** :
- `page` (optionnel, défaut: 1) : Numéro de page
- `limit` (optionnel, défaut: 50, max: 100) : Messages par page
- `before` (optionnel) : Timestamp ISO, messages avant cette date

**Exemple** :
```
GET /api/conversations/507f1f77bcf86cd799439015/messages?page=1&limit=50
```

**Réponse** (200 OK) :
```json
{
  "success": true,
  "data": {
    "messages": [
      {
        "id": "507f1f77bcf86cd799439020",
        "conversation": "507f1f77bcf86cd799439015",
        "sender": {
          "id": "507f1f77bcf86cd799439011",
          "username": "johndoe",
          "avatar": "https://example.com/avatars/john.jpg"
        },
        "content": "Hello everyone!",
        "type": "text",
        "reactions": [
          {
            "emoji": "👍",
            "users": ["507f1f77bcf86cd799439013"]
          }
        ],
        "edited": false,
        "deletedForEveryone": false,
        "createdAt": "2025-11-27T12:00:00.000Z",
        "updatedAt": "2025-11-27T12:00:00.000Z"
      },
      {
        "id": "507f1f77bcf86cd799439021",
        "conversation": "507f1f77bcf86cd799439015",
        "sender": {
          "id": "507f1f77bcf86cd799439013",
          "username": "janedoe",
          "avatar": "https://example.com/avatars/jane.jpg"
        },
        "content": "Check out this image!",
        "type": "image",
        "file": {
          "url": "https://example.com/uploads/image.jpg",
          "size": 102400,
          "mimeType": "image/jpeg",
          "thumbnail": "https://example.com/uploads/image_thumb.jpg"
        },
        "reactions": [],
        "edited": false,
        "createdAt": "2025-11-27T12:05:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 50,
      "total": 2,
      "pages": 1,
      "hasMore": false
    }
  }
}
```

---

#### 📤 Envoyer un Message

**POST** `/api/conversations/:conversationId/messages`

Envoyer un nouveau message dans une conversation.

**Headers** :
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Body (Message Texte)** :
```json
{
  "content": "Hello everyone!",
  "type": "text"
}
```

**Body (Message avec Fichier)** :
```json
{
  "content": "Check this out!",
  "type": "image",
  "file": {
    "url": "https://example.com/uploads/image.jpg",
    "size": 102400,
    "mimeType": "image/jpeg"
  }
}
```

**Types de Messages** :
- `text` : Message texte simple
- `image` : Image (JPG, PNG, GIF, WebP)
- `video` : Vidéo (MP4, MOV, AVI)
- `file` : Document (PDF, DOCX, XLSX, etc.)
- `audio` : Audio (MP3, WAV, M4A)

**Validations** :
- `content` : Max 4000 caractères
- `type` : Requis
- `file` : Requis si type != text

**Réponse** (201 Created) :
```json
{
  "success": true,
  "data": {
    "message": {
      "id": "507f1f77bcf86cd799439020",
      "conversation": "507f1f77bcf86cd799439015",
      "sender": {
        "id": "507f1f77bcf86cd799439011",
        "username": "johndoe"
      },
      "content": "Hello everyone!",
      "type": "text",
      "reactions": [],
      "createdAt": "2025-11-27T12:00:00.000Z"
    }
  },
  "message": "Message sent"
}
```

**Erreurs** :
- `400 Bad Request` : Données invalides
- `403 Forbidden` : Pas membre de la conversation ou groupe en mode admin-only
- `413 Payload Too Large` : Contenu trop long

---

#### ✏️ Modifier un Message

**PATCH** `/api/messages/:id`

Modifier le contenu d'un message (dans les 15 minutes).

**Headers** :
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Body** :
```json
{
  "content": "Updated message content"
}
```

**Réponse** (200 OK) :
```json
{
  "success": true,
  "data": {
    "message": {
      "id": "507f1f77bcf86cd799439020",
      "content": "Updated message content",
      "edited": true,
      "updatedAt": "2025-11-27T12:10:00.000Z"
    }
  },
  "message": "Message updated"
}
```

**Erreurs** :
- `400 Bad Request` : Délai de 15 minutes dépassé
- `403 Forbidden` : Pas l'auteur du message
- `404 Not Found` : Message introuvable

---

#### 🗑️ Supprimer un Message

**DELETE** `/api/messages/:id`

Supprimer un message.

**Headers** :
```
Authorization: Bearer <token>
```

**Query Parameters** :
- `forEveryone` (optionnel, défaut: false) : Supprimer pour tous (dans l'heure)

**Exemple** :
```
DELETE /api/messages/507f1f77bcf86cd799439020?forEveryone=true
```

**Réponse** (200 OK) :
```json
{
  "success": true,
  "message": "Message deleted"
}
```

**Erreurs** :
- `400 Bad Request` : Délai d'1h dépassé pour suppression globale
- `403 Forbidden` : Pas l'auteur du message

---

#### 😊 Réagir à un Message

**POST** `/api/messages/:id/reactions`

Ajouter une réaction emoji à un message.

**Headers** :
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Body** :
```json
{
  "emoji": "👍"
}
```

**Emojis Supportés** :
👍 ❤️ 😂 😮 😢 😡

**Réponse** (200 OK) :
```json
{
  "success": true,
  "data": {
    "reaction": {
      "emoji": "👍",
      "user": "507f1f77bcf86cd799439011"
    }
  },
  "message": "Reaction added"
}
```

---

#### ❌ Retirer une Réaction

**DELETE** `/api/messages/:id/reactions/:emoji`

Retirer sa réaction d'un message.

**Headers** :
```
Authorization: Bearer <token>
```

**Exemple** :
```
DELETE /api/messages/507f1f77bcf86cd799439020/reactions/👍
```

**Réponse** (200 OK) :
```json
{
  "success": true,
  "message": "Reaction removed"
}
```

---

#### 📎 Upload de Fichier

**POST** `/api/upload`

Uploader un fichier (image, vidéo, document, audio).

**Headers** :
```
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Body (form-data)** :
- `file` : Le fichier à uploader
- `type` (optionnel) : Type de fichier (`image`, `video`, `document`, `audio`)

**Limitations** :
- **Images** : 10 MB max (JPG, PNG, GIF, WebP)
- **Vidéos** : 50 MB max (MP4, MOV, AVI, WebM)
- **Documents** : 20 MB max (PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, TXT)
- **Audio** : 10 MB max (MP3, WAV, M4A, OGG)

**Réponse** (200 OK) :
```json
{
  "success": true,
  "data": {
    "file": {
      "url": "https://example.com/uploads/507f1f77bcf86cd799439011_1638360000000.jpg",
      "size": 102400,
      "mimeType": "image/jpeg",
      "thumbnail": "https://example.com/uploads/507f1f77bcf86cd799439011_1638360000000_thumb.jpg"
    }
  },
  "message": "File uploaded"
}
```

**Erreurs** :
- `400 Bad Request` : Fichier manquant
- `413 Payload Too Large` : Fichier trop volumineux
- `415 Unsupported Media Type` : Type de fichier non supporté

---

### Notifications

#### 🔔 Liste des Notifications

**GET** `/api/notifications`

Récupérer les notifications de l'utilisateur.

**Headers** :
```
Authorization: Bearer <token>
```

**Query Parameters** :
- `unreadOnly` (optionnel, défaut: false) : Seulement les non lues
- `page` (optionnel, défaut: 1) : Numéro de page
- `limit` (optionnel, défaut: 20, max: 100) : Notifications par page

**Réponse** (200 OK) :
```json
{
  "success": true,
  "data": {
    "notifications": [
      {
        "id": "507f1f77bcf86cd799439030",
        "type": "message",
        "title": "New message from johndoe",
        "body": "Hello!",
        "data": {
          "conversationId": "507f1f77bcf86cd799439015",
          "messageId": "507f1f77bcf86cd799439020"
        },
        "read": false,
        "createdAt": "2025-11-27T12:00:00.000Z"
      },
      {
        "id": "507f1f77bcf86cd799439031",
        "type": "group_add",
        "title": "Added to group",
        "body": "You were added to 'Project Team'",
        "data": {
          "conversationId": "507f1f77bcf86cd799439015",
          "addedBy": "507f1f77bcf86cd799439011"
        },
        "read": true,
        "createdAt": "2025-11-27T11:00:00.000Z"
      }
    ],
    "unreadCount": 1,
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 2,
      "pages": 1
    }
  }
}
```

**Types de Notifications** :
- `message` : Nouveau message
- `mention` : Mention dans un groupe
- `reaction` : Réaction à votre message
- `group_add` : Ajout à un groupe
- `group_remove` : Retrait d'un groupe
- `contact_request` : Demande de contact
- `contact_accept` : Contact accepté

---

#### ✅ Marquer comme Lu

**PATCH** `/api/notifications/:id/read`

Marquer une notification comme lue.

**Headers** :
```
Authorization: Bearer <token>
```

**Réponse** (200 OK) :
```json
{
  "success": true,
  "message": "Notification marked as read"
}
```

---

#### ✅ Marquer Toutes comme Lues

**PATCH** `/api/notifications/read-all`

Marquer toutes les notifications comme lues.

**Headers** :
```
Authorization: Bearer <token>
```

**Réponse** (200 OK) :
```json
{
  "success": true,
  "data": {
    "markedCount": 5
  },
  "message": "All notifications marked as read"
}
```

---

### Sessions

#### 📱 Sessions Actives

**GET** `/api/sessions`

Récupérer la liste des sessions actives de l'utilisateur.

**Headers** :
```
Authorization: Bearer <token>
```

**Réponse** (200 OK) :
```json
{
  "success": true,
  "data": {
    "sessions": [
      {
        "id": "507f1f77bcf86cd799439040",
        "device": "Chrome 119.0 on Windows 10",
        "ip": "192.168.1.10",
        "location": "Paris, France",
        "current": true,
        "lastActivity": "2025-11-27T12:00:00.000Z",
        "createdAt": "2025-11-27T10:00:00.000Z"
      },
      {
        "id": "507f1f77bcf86cd799439041",
        "device": "Firefox 120.0 on macOS 14",
        "ip": "192.168.1.20",
        "location": "Paris, France",
        "current": false,
        "lastActivity": "2025-11-27T11:30:00.000Z",
        "createdAt": "2025-11-26T14:00:00.000Z"
      }
    ]
  }
}
```

---

#### 🚪 Déconnecter une Session

**DELETE** `/api/sessions/:id`

Déconnecter une session spécifique.

**Headers** :
```
Authorization: Bearer <token>
```

**Réponse** (200 OK) :
```json
{
  "success": true,
  "message": "Session terminated"
}
```

---

#### 🚪 Déconnecter Toutes les Sessions

**DELETE** `/api/sessions/all`

Déconnecter toutes les sessions sauf la courante.

**Headers** :
```
Authorization: Bearer <token>
```

**Réponse** (200 OK) :
```json
{
  "success": true,
  "data": {
    "terminatedCount": 3
  },
  "message": "All other sessions terminated"
}
```

---

### Synchronisation

#### 🔄 Synchroniser les Données

**GET** `/api/sync`

Récupérer toutes les données pour synchronisation initiale.

**Headers** :
```
Authorization: Bearer <token>
```

**Query Parameters** :
- `lastSync` (optionnel) : Timestamp ISO de la dernière synchro

**Réponse** (200 OK) :
```json
{
  "success": true,
  "data": {
    "user": { ... },
    "conversations": [ ... ],
    "contacts": [ ... ],
    "notifications": [ ... ],
    "timestamp": "2025-11-27T12:00:00.000Z"
  }
}
```

---

## WebSocket Events

WhatsUp utilise Socket.IO pour la communication temps réel.

### Connexion

```javascript
import { io } from 'socket.io-client';

const socket = io('http://localhost:3000', {
  auth: {
    token: 'your-jwt-token'
  }
});
```

### Événements Client → Serveur

#### 📍 Rejoindre une Conversation

```javascript
socket.emit('join_conversation', {
  conversationId: '507f1f77bcf86cd799439015'
});
```

#### 🚪 Quitter une Conversation

```javascript
socket.emit('leave_conversation', {
  conversationId: '507f1f77bcf86cd799439015'
});
```

#### ✍️ Indicateur de saisie

```javascript
socket.emit('typing_start', {
  conversationId: '507f1f77bcf86cd799439015'
});

socket.emit('typing_stop', {
  conversationId: '507f1f77bcf86cd799439015'
});
```

#### 👁️ Marquer comme Lu

```javascript
socket.emit('message_read', {
  conversationId: '507f1f77bcf86cd799439015',
  messageId: '507f1f77bcf86cd799439020'
});
```

### Événements Serveur → Client

#### 📨 Nouveau Message

```javascript
socket.on('new_message', (data) => {
  console.log('New message:', data);
  // {
  //   message: { ... },
  //   conversation: { ... }
  // }
});
```

#### ✏️ Message Modifié

```javascript
socket.on('message_updated', (data) => {
  console.log('Message updated:', data);
  // {
  //   messageId: '507f1f77bcf86cd799439020',
  //   content: 'Updated content',
  //   edited: true
  // }
});
```

#### 🗑️ Message Supprimé

```javascript
socket.on('message_deleted', (data) => {
  console.log('Message deleted:', data);
  // {
  //   messageId: '507f1f77bcf86cd799439020',
  //   conversationId: '507f1f77bcf86cd799439015',
  //   forEveryone: true
  // }
});
```

#### 😊 Nouvelle Réaction

```javascript
socket.on('message_reaction', (data) => {
  console.log('New reaction:', data);
  // {
  //   messageId: '507f1f77bcf86cd799439020',
  //   emoji: '👍',
  //   user: { id: '...', username: '...' }
  // }
});
```

#### ✍️ Utilisateur en Train de Taper

```javascript
socket.on('user_typing', (data) => {
  console.log('User typing:', data);
  // {
  //   conversationId: '507f1f77bcf86cd799439015',
  //   user: { id: '...', username: '...' }
  // }
});

socket.on('user_stopped_typing', (data) => {
  console.log('User stopped typing:', data);
});
```

#### 🟢 Changement de Statut

```javascript
socket.on('user_status_changed', (data) => {
  console.log('User status changed:', data);
  // {
  //   userId: '507f1f77bcf86cd799439011',
  //   status: 'online' // online, away, busy, dnd, offline
  // }
});
```

#### 💬 Nouvelle Conversation

```javascript
socket.on('conversation_created', (data) => {
  console.log('New conversation:', data);
  // {
  //   conversation: { ... }
  // }
});
```

#### ✏️ Conversation Mise à Jour

```javascript
socket.on('conversation_updated', (data) => {
  console.log('Conversation updated:', data);
  // {
  //   conversationId: '507f1f77bcf86cd799439015',
  //   name: 'New Name',
  //   description: 'New Description',
  //   ...
  // }
});
```

#### ➕ Membre Ajouté

```javascript
socket.on('member_added', (data) => {
  console.log('Member added:', data);
  // {
  //   conversationId: '507f1f77bcf86cd799439015',
  //   member: { id: '...', username: '...' },
  //   addedBy: { id: '...', username: '...' }
  // }
});
```

#### ➖ Membre Retiré

```javascript
socket.on('member_removed', (data) => {
  console.log('Member removed:', data);
  // {
  //   conversationId: '507f1f77bcf86cd799439015',
  //   member: { id: '...', username: '...' },
  //   removedBy: { id: '...', username: '...' }
  // }
});
```

#### 🔔 Nouvelle Notification

```javascript
socket.on('notification', (data) => {
  console.log('New notification:', data);
  // {
  //   notification: { ... }
  // }
});
```

#### ❌ Erreur

```javascript
socket.on('error', (data) => {
  console.error('Socket error:', data);
  // {
  //   message: 'Error description',
  //   code: 'ERROR_CODE'
  // }
});
```

---

## Codes d'Erreur

### Codes HTTP Standards

| Code | Signification | Description |
|------|---------------|-------------|
| `200` | OK | Requête réussie |
| `201` | Created | Ressource créée avec succès |
| `204` | No Content | Succès sans contenu de réponse |
| `400` | Bad Request | Données invalides |
| `401` | Unauthorized | Non authentifié (token invalide/expiré) |
| `403` | Forbidden | Pas les permissions nécessaires |
| `404` | Not Found | Ressource introuvable |
| `409` | Conflict | Conflit (ex: email déjà utilisé) |
| `413` | Payload Too Large | Fichier ou données trop volumineux |
| `415` | Unsupported Media Type | Type de fichier non supporté |
| `429` | Too Many Requests | Rate limit dépassé |
| `500` | Internal Server Error | Erreur serveur interne |

### Codes d'Erreur Personnalisés

| Code | Description |
|------|-------------|
| `VALIDATION_ERROR` | Erreur de validation des données |
| `AUTHENTICATION_ERROR` | Erreur d'authentification |
| `AUTHORIZATION_ERROR` | Pas les permissions |
| `NOT_FOUND` | Ressource introuvable |
| `DUPLICATE_ERROR` | Ressource déjà existante |
| `FILE_TOO_LARGE` | Fichier trop volumineux |
| `UNSUPPORTED_FILE_TYPE` | Type de fichier non supporté |
| `RATE_LIMIT_EXCEEDED` | Limite de requêtes dépassée |
| `EXPIRED_TOKEN` | Token JWT expiré |
| `INVALID_TOKEN` | Token JWT invalide |
| `MESSAGE_TOO_LONG` | Message trop long (>4000 caractères) |
| `EDIT_TIME_EXPIRED` | Délai d'édition dépassé (>15min) |
| `DELETE_TIME_EXPIRED` | Délai de suppression dépassé (>1h) |
| `MAX_MEMBERS_REACHED` | Limite de 100 membres atteinte |
| `ADMIN_REQUIRED` | Action réservée aux administrateurs |
| `LAST_ADMIN` | Ne peut pas retirer le dernier admin |

### Format de Réponse d'Erreur

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": [
      {
        "field": "email",
        "message": "Email must be valid"
      },
      {
        "field": "password",
        "message": "Password must be at least 8 characters"
      }
    ]
  }
}
```

---

## Rate Limiting

WhatsUp implémente plusieurs niveaux de rate limiting pour prévenir les abus.

### Limites Globales

| Endpoint/Action | Limite | Fenêtre |
|-----------------|--------|---------|
| Tous les endpoints | 100 requêtes | 15 minutes |
| Login/Register | 5 requêtes | 15 minutes |
| Upload de fichiers | 10 uploads | 1 minute |
| Envoi de messages | 100 messages | 1 minute |

### Headers de Réponse

Chaque réponse inclut des headers de rate limiting :

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1638360000
```

### Dépassement de Limite

**Réponse** (429 Too Many Requests) :
```json
{
  "success": false,
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Too many requests, please try again later",
    "retryAfter": 900
  }
}
```

`retryAfter` : Temps en secondes avant de pouvoir réessayer

---

## Exemples

### Exemple Complet : Envoyer un Message avec Image

#### 1. Upload de l'image

```javascript
const formData = new FormData();
formData.append('file', imageFile);
formData.append('type', 'image');

const uploadResponse = await fetch('http://localhost:3000/api/upload', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`
  },
  body: formData
});

const { data: { file } } = await uploadResponse.json();
// file.url = "https://example.com/uploads/image.jpg"
```

#### 2. Envoi du message avec l'image

```javascript
const messageResponse = await fetch(
  `http://localhost:3000/api/conversations/${conversationId}/messages`,
  {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      content: 'Check out this image!',
      type: 'image',
      file: {
        url: file.url,
        size: file.size,
        mimeType: file.mimeType,
        thumbnail: file.thumbnail
      }
    })
  }
);

const { data: { message } } = await messageResponse.json();
console.log('Message sent:', message);
```

### Exemple : Utiliser Socket.IO pour le Temps Réel

```javascript
import { io } from 'socket.io-client';

// Connexion
const socket = io('http://localhost:3000', {
  auth: { token: localStorage.getItem('token') }
});

// Écouter les nouveaux messages
socket.on('new_message', (data) => {
  console.log('New message received:', data.message);
  // Mettre à jour l'UI
  addMessageToChat(data.message);
});

// Rejoindre une conversation
socket.emit('join_conversation', {
  conversationId: '507f1f77bcf86cd799439015'
});

// Indicateur de saisie
const messageInput = document.getElementById('messageInput');
let typingTimeout;

messageInput.addEventListener('input', () => {
  socket.emit('typing_start', {
    conversationId: '507f1f77bcf86cd799439015'
  });
  
  clearTimeout(typingTimeout);
  typingTimeout = setTimeout(() => {
    socket.emit('typing_stop', {
      conversationId: '507f1f77bcf86cd799439015'
    });
  }, 1000);
});

// Écouter les autres utilisateurs qui tapent
socket.on('user_typing', (data) => {
  showTypingIndicator(data.user.username);
});

socket.on('user_stopped_typing', (data) => {
  hideTypingIndicator(data.user.username);
});
```

### Exemple : Créer un Groupe et Ajouter des Membres

```javascript
async function createGroupAndAddMembers() {
  const token = localStorage.getItem('token');
  
  // 1. Créer le groupe
  const createResponse = await fetch('http://localhost:3000/api/conversations', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      type: 'group',
      name: 'My New Group',
      participantIds: [
        '507f1f77bcf86cd799439013',
        '507f1f77bcf86cd799439016'
      ]
    })
  });
  
  const { data: { conversation } } = await createResponse.json();
  console.log('Group created:', conversation);
  
  // 2. Ajouter d'autres membres
  const addResponse = await fetch(
    `http://localhost:3000/api/conversations/${conversation.id}/members`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        userIds: ['507f1f77bcf86cd799439017']
      })
    }
  );
  
  const { data: { addedMembers } } = await addResponse.json();
  console.log('Members added:', addedMembers);
  
  // 3. Mettre à jour les paramètres du groupe
  const updateResponse = await fetch(
    `http://localhost:3000/api/conversations/${conversation.id}`,
    {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        description: 'A group for project collaboration',
        settings: {
          onlyAdminsCanSend: false,
          onlyAdminsCanEditInfo: true,
          onlyAdminsCanAddMembers: false
        }
      })
    }
  );
  
  const { data: { conversation: updated } } = await updateResponse.json();
  console.log('Group updated:', updated);
}
```

---

## Postman Collection

Une collection Postman complète est disponible pour tester tous les endpoints :

**Télécharger** : [WhatsUp.postman_collection.json](../postman/WhatsUp.postman_collection.json)

**Variables d'environnement** :
- `baseUrl` : `http://localhost:3000`
- `token` : Sera rempli automatiquement après login

---

## Support

Pour toute question sur l'API :

- **GitHub Issues** : [github.com/Sereir/WhatsUp/issues](https://github.com/Sereir/WhatsUp/issues)
- **Documentation** : [docs/](../README.md)
- **Email** : api@whatsup.com

**Version de l'API** : 1.0.0  
**Dernière mise à jour** : 27 novembre 2025
