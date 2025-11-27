# 🚀 Guide de démarrage - Profil et Paramètres

## Démarrage rapide

### 1. Démarrer le backend
```bash
cd backend
npm install  # Si pas déjà fait
npm start    # ou node src/server.js
```

Le backend démarre sur `http://localhost:3000`

### 2. Démarrer le frontend
```bash
cd frontend
npm install  # Si pas déjà fait
npm run dev
```

Le frontend démarre sur `http://localhost:5173`

### 3. Tester les nouvelles fonctionnalités

#### Test du profil
1. Connectez-vous à l'application
2. Dans le chat, cliquez sur le menu (⋮) en haut à droite
3. Sélectionnez "Mon Profil"
4. Testez :
   - Modifier le pseudo
   - Changer la photo de profil
   - Modifier le bio
   - Changer le statut en ligne/hors ligne

#### Test des paramètres
1. Dans le chat, cliquez sur le menu (⋮)
2. Sélectionnez "Paramètres"
3. Testez :
   - Activer le Dark Mode (toggle)
   - Changer la couleur du thème
   - Changer le mot de passe
   - Naviguer vers le profil

#### Test du Dark Mode
1. Allez dans Paramètres
2. Activez le "Mode sombre"
3. Vérifiez que toute l'interface devient sombre
4. Naviguez dans les différentes pages (Chat, Profil, Paramètres)
5. Rechargez la page - le thème doit persister

## Endpoints API disponibles

### Profil
- `GET /api/auth/me` - Obtenir le profil actuel
- `PATCH /api/users/profile` - Mettre à jour profil (username, firstName, lastName, bio)
- `PATCH /api/users/bio` - Mettre à jour bio uniquement
- `POST /api/users/avatar` - Télécharger avatar
- `PATCH /api/users/status` - Mettre à jour statut (online/offline)

### Sécurité
- `PUT /api/auth/password` - Changer le mot de passe

## Structure des fichiers ajoutés/modifiés

### Backend
```
backend/src/
├── controllers/
│   ├── authController.js (modifié - ajout changePassword)
│   └── userController.js (modifié - ajout updateBio, amélioration updateProfile)
└── routes/
    ├── auth.routes.js (modifié - route PUT /password)
    └── user.routes.js (modifié - route PATCH /bio)
```

### Frontend
```
frontend/src/
├── views/
│   ├── Profile.vue (nouveau)
│   ├── Settings.vue (nouveau)
│   └── Chat.vue (modifié - menu avec liens profil/paramètres)
├── composables/
│   └── useTheme.js (nouveau)
├── router/
│   └── index.js (modifié - routes /profile et /settings)
├── App.vue (modifié - initialisation thème)
└── tailwind.config.js (modifié - dark mode + variable couleur)
```

## Vérifications

### Checklist fonctionnelle
- [ ] Le backend démarre sans erreur
- [ ] Le frontend démarre sans erreur
- [ ] Connexion possible
- [ ] Menu déroulant affiche Profil et Paramètres
- [ ] Page profil accessible
- [ ] Modification du pseudo fonctionne
- [ ] Upload de photo fonctionne
- [ ] Modification du bio fonctionne
- [ ] Changement de statut fonctionne
- [ ] Page paramètres accessible
- [ ] Dark Mode fonctionne et persiste
- [ ] Changement de couleur fonctionne
- [ ] Changement de mot de passe fonctionne

## Dépannage

### Le Dark Mode ne s'applique pas
- Vérifiez que `tailwind.config.js` contient `darkMode: 'class'`
- Vérifiez que le navigateur supporte localStorage
- Ouvrez la console et vérifiez les erreurs

### L'upload d'avatar échoue
- Vérifiez que le dossier `backend/uploads` existe
- Vérifiez les permissions du dossier
- Vérifiez la taille du fichier (max 5 MB)

### Le mot de passe ne change pas
- Vérifiez que le nouveau mot de passe fait au moins 6 caractères
- Vérifiez que les deux mots de passe correspondent
- Ouvrez la console réseau pour voir la réponse de l'API

### Erreur "Ce pseudo est déjà utilisé"
- Le pseudo doit être unique dans la base de données
- Essayez un autre pseudo

## Support technique

Pour plus d'informations, consultez :
- `docs/06-profil-et-parametres.md` - Documentation complète
- Console du navigateur (F12) - Erreurs JavaScript
- Logs du backend - Erreurs serveur

---

**Tout est prêt ! 🎉**

Vous pouvez maintenant utiliser les fonctionnalités de profil et paramètres dans votre application WhatsApp-like !
