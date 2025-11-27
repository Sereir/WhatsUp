# 🧪 Tests manuels - API Profil et Paramètres

## Configuration
**Base URL**: `http://localhost:3000/api`
**Headers requis**: 
```json
{
  "Content-Type": "application/json",
  "Authorization": "Bearer YOUR_JWT_TOKEN"
}
```

## 1. Test changement de mot de passe

### Requête
```http
PUT /auth/password
Content-Type: application/json
Authorization: Bearer YOUR_TOKEN

{
  "newPassword": "nouveaumotdepasse123"
}
```

### Réponse attendue (200 OK)
```json
{
  "success": true,
  "message": "Mot de passe modifié avec succès"
}
```

### Réponse erreur (400 Bad Request)
```json
{
  "success": false,
  "message": "Le nouveau mot de passe doit contenir au moins 6 caractères"
}
```

---

## 2. Test mise à jour du bio

### Requête
```http
PATCH /users/bio
Content-Type: application/json
Authorization: Bearer YOUR_TOKEN

{
  "bio": "Développeur passionné 🚀 | Code | Coffee | Repeat"
}
```

### Réponse attendue (200 OK)
```json
{
  "success": true,
  "message": "Bio mis à jour",
  "data": {
    "bio": "Développeur passionné 🚀 | Code | Coffee | Repeat"
  }
}
```

---

## 3. Test mise à jour du profil complet

### Requête
```http
PATCH /users/profile
Content-Type: application/json
Authorization: Bearer YOUR_TOKEN

{
  "username": "john_dev",
  "bio": "Full Stack Developer"
}
```

### Réponse attendue (200 OK)
```json
{
  "success": true,
  "message": "Profil mis à jour",
  "data": {
    "user": {
      "_id": "...",
      "username": "john_dev",
      "bio": "Full Stack Developer",
      "email": "john@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "avatar": "/uploads/avatar-...",
      "status": "online"
    }
  }
}
```

### Réponse erreur - pseudo déjà pris (400 Bad Request)
```json
{
  "success": false,
  "message": "Ce pseudo est déjà utilisé"
}
```

---

## 4. Test upload avatar

### Requête (multipart/form-data)
```http
POST /users/avatar
Content-Type: multipart/form-data
Authorization: Bearer YOUR_TOKEN

avatar: [fichier image]
```

### Réponse attendue (200 OK)
```json
{
  "success": true,
  "message": "Avatar mis à jour",
  "data": {
    "avatar": "/uploads/avatar-123456789.jpg"
  }
}
```

---

## 5. Test mise à jour du statut

### Requête
```http
PATCH /users/status
Content-Type: application/json
Authorization: Bearer YOUR_TOKEN

{
  "status": "online"
}
```

### Réponse attendue (200 OK)
```json
{
  "success": true,
  "message": "Statut mis à jour",
  "data": {
    "status": "online",
    "lastSeen": "2025-11-27T15:30:00.000Z"
  }
}
```

---

## 6. Test récupération profil actuel

### Requête
```http
GET /auth/me
Authorization: Bearer YOUR_TOKEN
```

### Réponse attendue (200 OK)
```json
{
  "success": true,
  "data": {
    "_id": "...",
    "firstName": "John",
    "lastName": "Doe",
    "username": "john_dev",
    "email": "john@example.com",
    "avatar": "/uploads/avatar-...",
    "bio": "Full Stack Developer",
    "status": "online",
    "lastSeen": "2025-11-27T15:30:00.000Z"
  }
}
```

---

## Utilisation avec cURL

### Obtenir le token
```bash
# Se connecter
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# Copier le token de la réponse
```

### Changer le mot de passe
```bash
curl -X PUT http://localhost:3000/api/auth/password \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"newPassword":"nouveaupass123"}'
```

### Mettre à jour le bio
```bash
curl -X PATCH http://localhost:3000/api/users/bio \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"bio":"Ma nouvelle bio 🎉"}'
```

### Mettre à jour le profil
```bash
curl -X PATCH http://localhost:3000/api/users/profile \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"username":"nouveau_pseudo","bio":"Développeur Full Stack"}'
```

### Upload avatar
```bash
curl -X POST http://localhost:3000/api/users/avatar \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "avatar=@/path/to/image.jpg"
```

---

## Tests avec Postman

### Collection Postman
Créez une collection avec les endpoints suivants :

1. **Login** (POST /auth/login)
2. **Get Profile** (GET /auth/me)
3. **Update Password** (PUT /auth/password)
4. **Update Bio** (PATCH /users/bio)
5. **Update Profile** (PATCH /users/profile)
6. **Upload Avatar** (POST /users/avatar)
7. **Update Status** (PATCH /users/status)

### Variables d'environnement
```json
{
  "baseUrl": "http://localhost:3000/api",
  "token": "YOUR_JWT_TOKEN"
}
```

---

## Scénarios de test

### Scénario 1 : Inscription et configuration du profil
1. Créer un compte (POST /auth/register)
2. Se connecter (POST /auth/login)
3. Définir un pseudo (PATCH /users/profile)
4. Uploader un avatar (POST /users/avatar)
5. Définir un bio (PATCH /users/bio)
6. Passer en ligne (PATCH /users/status)

### Scénario 2 : Modification du profil
1. Se connecter
2. Récupérer profil actuel (GET /auth/me)
3. Modifier le pseudo (PATCH /users/profile)
4. Modifier le bio (PATCH /users/bio)
5. Changer l'avatar (POST /users/avatar)

### Scénario 3 : Sécurité
1. Se connecter
2. Changer le mot de passe (PUT /auth/password)
3. Se déconnecter
4. Se reconnecter avec le nouveau mot de passe

---

## Codes de statut HTTP

- **200 OK** : Succès
- **201 Created** : Ressource créée
- **400 Bad Request** : Données invalides
- **401 Unauthorized** : Token manquant ou invalide
- **404 Not Found** : Ressource non trouvée
- **500 Internal Server Error** : Erreur serveur

---

## Conseils de test

1. **Toujours tester avec un token valide** - Récupérez-le via /auth/login
2. **Vérifier les contraintes** - Pseudo min 3 caractères, mot de passe min 6 caractères
3. **Tester les cas limites** - Bio de 200 caractères, fichier avatar de 5 MB
4. **Tester les erreurs** - Pseudo déjà pris, mot de passe trop court
5. **Vérifier la persistance** - Les données doivent être sauvegardées en base

---

✅ **Tests réussis = Fonctionnalités prêtes pour la production !**
