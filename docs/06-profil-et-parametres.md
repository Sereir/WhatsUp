# 📋 SECTION 9 : PROFIL ET PARAMÈTRES - Documentation

## ✅ Fonctionnalités implémentées

### 🎯 Étape 9.1 : Page de Profil (`/profile`)

#### Accès
- Nouveau bouton "Mon Profil" dans le menu déroulant (⋮) en haut à droite du chat
- Situé au-dessus du bouton "Paramètres" et "Déconnexion"

#### Fonctionnalités disponibles

1. **Photo de profil**
   - Affichage de l'avatar actuel (ou initiales si pas d'avatar)
   - Modification par clic sur l'icône de téléchargement
   - Formats acceptés : JPG, PNG, GIF
   - Taille maximale : 5 MB
   - L'image est automatiquement optimisée et redimensionnée

2. **Modification du pseudo**
   - Bouton "Modifier" pour activer l'édition
   - Validation : minimum 3 caractères
   - Vérification de l'unicité du pseudo
   - Messages de confirmation/erreur

3. **Modification du bio/statut**
   - Zone de texte avec limite de 200 caractères
   - Compteur de caractères affiché
   - Boutons Enregistrer/Annuler

4. **Statut en ligne/hors ligne**
   - Toggle visuel avec boutons
   - 2 statuts disponibles :
     - 🟢 En ligne (visible par tous)
     - ⚫ Hors ligne (invisible)
   - Mise à jour en temps réel

5. **Informations du compte**
   - Date d'inscription
   - Dernière connexion
   - Identifiant unique (MongoDB ObjectId)
   - Email (non modifiable)
   - Prénom et Nom (non modifiables)

### ⚙️ Étape 9.2 : Page Paramètres (`/settings`)

#### Accès
- Bouton "Paramètres" dans le menu déroulant du chat
- Bouton dans l'en-tête de la page profil

#### Sections implémentées

1. **Paramètres d'apparence**
   
   **Mode sombre (Dark Mode)**
   - Toggle switch pour activer/désactiver
   - Persistance dans localStorage (`whatsup_theme`)
   - Application immédiate sur toute l'interface
   - Classes Tailwind CSS `dark:` pour tous les composants
   
   **Thème de couleur**
   - 4 couleurs prédéfinies :
     - 🔵 Bleu (#075E54) - Par défaut
     - 🟣 Violet (#7C3AED)
     - 🌸 Rose (#EC4899)
     - 🟢 Vert (#10B981)
   - Stockage dans localStorage (`whatsup_color`)
   - Application via variable CSS `--color-primary`

2. **Paramètres de compte**
   - Lien direct vers la page profil
   - Icône et description claire

### 🔒 Étape 9.3 : Sécurité

#### Changement de mot de passe
- Section dédiée dans les paramètres
- Interface en deux étapes :
  1. Bouton "Modifier mon mot de passe"
  2. Formulaire avec :
     - Nouveau mot de passe (minimum 6 caractères)
     - Confirmation du mot de passe
     - Validation de correspondance
- Messages de succès/erreur
- Boutons Enregistrer/Annuler

---

## 🛠️ Modifications techniques

### Backend

#### Nouveaux endpoints

1. **PUT `/api/auth/password`** - Changement de mot de passe
   - Authentification requise
   - Validation de la longueur (min 6 caractères)
   - Hash automatique du nouveau mot de passe
   - Alerte de sécurité créée

2. **PATCH `/api/users/bio`** - Mise à jour du bio
   - Authentification requise
   - Limite de 200 caractères
   - Retour immédiat de la nouvelle valeur

3. **PATCH `/api/users/profile`** - Mise à jour améliorée
   - Support du champ `username` avec validation d'unicité
   - Support de `firstName`, `lastName`, `bio`
   - Validation des données
   - Alertes de sécurité

#### Fichiers modifiés

- `backend/src/controllers/authController.js` - Ajout de `changePassword()`
- `backend/src/controllers/userController.js` - Ajout de `updateBio()`, amélioration de `updateProfile()`
- `backend/src/routes/auth.routes.js` - Route PUT `/password`
- `backend/src/routes/user.routes.js` - Route PATCH `/bio`

### Frontend

#### Nouveaux composants

1. **`Profile.vue`** - Page de profil complète
   - Gestion d'état local pour édition
   - Upload d'avatar avec FormData
   - Messages de succès/erreur
   - Navigation vers paramètres
   - Support Dark Mode complet

2. **`Settings.vue`** - Page paramètres
   - Toggle Dark Mode fonctionnel
   - Sélecteur de couleur de thème
   - Formulaire de changement de mot de passe
   - Liens vers profil
   - Bouton de déconnexion

3. **`composables/useTheme.js`** - Gestion du thème
   - État réactif du thème (dark/light)
   - État de la couleur active
   - Fonctions de basculement
   - Persistance dans localStorage
   - Initialisation au démarrage

#### Fichiers modifiés

- `frontend/src/App.vue` - Initialisation du thème
- `frontend/src/views/Chat.vue` - Menu avec boutons Profil et Paramètres
- `frontend/src/router/index.js` - Routes `/profile` et `/settings`
- `frontend/tailwind.config.js` - Configuration `darkMode: 'class'` et variable CSS pour couleur primaire

---

## 📱 Utilisation

### Accéder au profil
1. Ouvrir le chat (`/chat`)
2. Cliquer sur le menu (⋮) en haut à droite
3. Sélectionner "Mon Profil"

### Modifier son pseudo
1. Aller sur le profil
2. Cliquer sur "Modifier" à côté du pseudo
3. Saisir le nouveau pseudo (min 3 caractères)
4. Cliquer sur "Enregistrer"

### Changer de photo
1. Aller sur le profil
2. Cliquer sur l'icône ⬆️ sur l'avatar
3. Sélectionner une image (max 5 MB)
4. La photo est automatiquement uploadée

### Activer le Dark Mode
1. Aller dans Paramètres (`/settings`)
2. Activer le toggle "Mode sombre"
3. Le thème s'applique immédiatement

### Changer le mot de passe
1. Aller dans Paramètres
2. Cliquer sur "Modifier mon mot de passe"
3. Saisir deux fois le nouveau mot de passe
4. Cliquer sur "Enregistrer"

---

## 🎨 Design et UX

- **Interface cohérente** : Tous les écrans suivent le même design system
- **Feedback utilisateur** : Messages de succès (vert) et d'erreur (rouge) avec icônes
- **Dark Mode complet** : Tous les composants supportent le mode sombre
- **Responsive** : Interface adaptée à différentes tailles d'écran
- **Transitions fluides** : Animations et effets hover
- **Icônes SVG** : Material Design Icons pour cohérence visuelle

---

## 🔄 Persistance des données

- **Thème** : Stocké dans `localStorage.whatsup_theme` ('dark' ou 'light')
- **Couleur** : Stocké dans `localStorage.whatsup_color` ('blue', 'purple', 'pink', 'green')
- **Profil utilisateur** : Synchronisé avec le store Pinia et localStorage
- **Session** : Token JWT maintenu dans localStorage/sessionStorage

---

## ✅ Tests recommandés

1. ✓ Modifier le pseudo avec validation d'unicité
2. ✓ Télécharger une nouvelle photo de profil
3. ✓ Modifier le bio (test limite 200 caractères)
4. ✓ Changer le statut en ligne/hors ligne
5. ✓ Activer/désactiver le Dark Mode
6. ✓ Changer le thème de couleur
7. ✓ Changer le mot de passe avec validation
8. ✓ Vérifier la persistance après rechargement
9. ✓ Navigation entre profil, paramètres et chat
10. ✓ Messages d'erreur et de succès

---

## 🚀 Prochaines améliorations possibles

- Paramètres de notifications (push, son, vibrations)
- Paramètres de confidentialité (qui peut voir mon profil, mon statut)
- Gestion des sessions actives
- Authentification à deux facteurs
- Export des données personnelles
- Suppression définitive du compte
- Changement d'email avec vérification
- Langues multiples
- Personnalisation de la police

---

**Date d'implémentation** : 27 novembre 2025
**Version** : 1.0.0
**Statut** : ✅ Complet et fonctionnel
