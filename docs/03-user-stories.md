# Étape 1.3 : User Stories - WhatsApp Clone

## Introduction

Les user stories décrivent les fonctionnalités du point de vue de l'utilisateur final. Chaque story suit le format :
**En tant que** [rôle], **je veux** [action], **afin de** [bénéfice].

## 1. Authentification et Gestion de Compte

### US-001 : Inscription
**En tant qu'** utilisateur non inscrit,  
**je veux** créer un compte avec mon email et mot de passe,  
**afin de** pouvoir utiliser l'application de messagerie.

**Critères d'acceptation :**
- Le formulaire demande : prénom, nom, email, mot de passe, confirmation de mot de passe
- L'email doit être valide et unique
- Le mot de passe doit avoir au moins 8 caractères avec 1 majuscule, 1 chiffre et 1 caractère spécial
- Un message de confirmation est affiché après inscription réussie
- L'utilisateur est automatiquement connecté après inscription
- Un avatar par défaut est attribué

**Priorité :** Haute  
**Estimation :** 3 points

### US-002 : Connexion
**En tant qu'** utilisateur inscrit,  
**je veux** me connecter avec mes identifiants,  
**afin de** accéder à mes conversations.

**Critères d'acceptation :**
- Le formulaire demande email et mot de passe
- Un token JWT est généré et stocké côté client
- L'utilisateur est redirigé vers la page de chat après connexion
- Un message d'erreur clair s'affiche en cas d'identifiants incorrects
- Option "Se souvenir de moi" disponible

**Priorité :** Haute  
**Estimation :** 2 points

### US-003 : Déconnexion
**En tant qu'** utilisateur connecté,  
**je veux** me déconnecter,  
**afin de** sécuriser mon compte.

**Critères d'acceptation :**
- Bouton de déconnexion accessible dans le menu utilisateur
- Le token est supprimé du stockage local
- L'utilisateur est redirigé vers la page de connexion
- Le statut passe à "offline"

**Priorité :** Haute  
**Estimation :** 1 point

### US-004 : Réinitialisation de mot de passe
**En tant qu'** utilisateur ayant oublié son mot de passe,  
**je veux** réinitialiser mon mot de passe via email,  
**afin de** récupérer l'accès à mon compte.

**Critères d'acceptation :**
- Lien "Mot de passe oublié ?" sur la page de connexion
- L'utilisateur saisit son email
- Un email avec un lien de réinitialisation est envoyé
- Le lien expire après 1 heure
- L'utilisateur peut définir un nouveau mot de passe

**Priorité :** Moyenne  
**Estimation :** 3 points

### US-005 : Éditer son profil
**En tant qu'** utilisateur connecté,  
**je veux** modifier mes informations personnelles,  
**afin de** garder mon profil à jour.

**Critères d'acceptation :**
- Possibilité de modifier : prénom, nom, bio, photo de profil
- Les modifications sont sauvegardées en temps réel
- Les contacts voient les changements immédiatement
- Validation des données avant sauvegarde

**Priorité :** Moyenne  
**Estimation :** 3 points

## 2. Gestion des Contacts

### US-006 : Rechercher un utilisateur
**En tant qu'** utilisateur connecté,  
**je veux** rechercher d'autres utilisateurs par nom ou email,  
**afin de** les ajouter à mes contacts.

**Critères d'acceptation :**
- Barre de recherche accessible
- La recherche fonctionne sur prénom, nom et email
- Les résultats s'affichent en temps réel (debounce 300ms)
- Maximum 20 résultats affichés
- Les utilisateurs déjà dans mes contacts sont identifiés

**Priorité :** Haute  
**Estimation :** 2 points

### US-007 : Ajouter un contact
**En tant qu'** utilisateur connecté,  
**je veux** ajouter un utilisateur à mes contacts,  
**afin de** pouvoir lui envoyer des messages.

**Critères d'acceptation :**
- Bouton "Ajouter" sur chaque résultat de recherche
- L'ajout est instantané (pas de confirmation requise)
- Le nouveau contact apparaît dans ma liste
- Notification envoyée au contact ajouté
- Impossible d'ajouter deux fois le même contact

**Priorité :** Haute  
**Estimation :** 2 points

### US-008 : Supprimer un contact
**En tant qu'** utilisateur connecté,  
**je veux** supprimer un contact,  
**afin de** nettoyer ma liste.

**Critères d'acceptation :**
- Option "Supprimer" dans le menu contextuel du contact
- Demande de confirmation avant suppression
- Le contact est retiré de la liste immédiatement
- Les conversations existantes sont conservées
- Possibilité de rajouter le contact ultérieurement

**Priorité :** Moyenne  
**Estimation :** 1 point

### US-009 : Voir la liste de contacts
**En tant qu'** utilisateur connecté,  
**je veux** voir tous mes contacts,  
**afin de** initier des conversations.

**Critères d'acceptation :**
- Liste triée alphabétiquement par prénom
- Affichage : avatar, nom complet, statut (en ligne/hors ligne)
- Indicateur visuel pour les contacts en ligne
- Compteur du nombre total de contacts
- Possibilité de filtrer par statut

**Priorité :** Haute  
**Estimation :** 2 points

### US-010 : Bloquer un contact
**En tant qu'** utilisateur connecté,  
**je veux** bloquer un contact,  
**afin de** ne plus recevoir ses messages.

**Critères d'acceptation :**
- Option "Bloquer" dans le menu du contact
- Les messages du contact bloqué ne sont plus reçus
- Le contact bloqué ne voit pas mon statut en ligne
- Les conversations passées restent visibles
- Possibilité de débloquer

**Priorité :** Basse  
**Estimation :** 2 points

## 3. Conversations

### US-011 : Créer une conversation individuelle
**En tant qu'** utilisateur connecté,  
**je veux** démarrer une conversation avec un contact,  
**afin de** échanger des messages.

**Critères d'acceptation :**
- Clic sur un contact ouvre/crée la conversation
- Si une conversation existe déjà, elle est ouverte
- Sinon, une nouvelle conversation est créée
- L'interface de chat s'affiche immédiatement
- Le contact voit la conversation dès le premier message

**Priorité :** Haute  
**Estimation :** 2 points

### US-012 : Créer un groupe
**En tant qu'** utilisateur connecté,  
**je veux** créer un groupe avec plusieurs contacts,  
**afin de** discuter avec plusieurs personnes simultanément.

**Critères d'acceptation :**
- Bouton "Nouveau groupe" accessible
- Sélection multiple de contacts (minimum 2)
- Champ pour le nom du groupe (obligatoire)
- Option pour ajouter une photo de groupe
- Le créateur devient administrateur par défaut
- Tous les membres sont notifiés

**Priorité :** Haute  
**Estimation :** 4 points

### US-013 : Voir la liste des conversations
**En tant qu'** utilisateur connecté,  
**je veux** voir toutes mes conversations,  
**afin de** accéder rapidement à mes échanges.

**Critères d'acceptation :**
- Liste triée par dernière activité (plus récent en haut)
- Affichage pour chaque conversation :
  - Avatar (contact ou groupe)
  - Nom
  - Dernier message (preview)
  - Horodatage du dernier message
  - Badge avec nombre de messages non lus
- Indicateur visuel si le contact tape un message
- Scroll infini pour charger plus de conversations

**Priorité :** Haute  
**Estimation :** 3 points

### US-014 : Archiver une conversation
**En tant qu'** utilisateur connecté,  
**je veux** archiver une conversation,  
**afin de** nettoyer ma liste sans supprimer l'historique.

**Critères d'acceptation :**
- Option "Archiver" dans le menu de la conversation
- La conversation disparaît de la liste principale
- Accessible via section "Conversations archivées"
- Revient en haut de la liste si nouveau message reçu
- Possibilité de désarchiver

**Priorité :** Basse  
**Estimation :** 2 points

### US-015 : Supprimer une conversation
**En tant qu'** utilisateur connecté,  
**je veux** supprimer une conversation,  
**afin de** effacer l'historique.

**Critères d'acceptation :**
- Option "Supprimer" dans le menu de la conversation
- Demande de confirmation
- Tous les messages sont supprimés côté utilisateur
- Les messages restent visibles pour l'autre participant
- La conversation peut être recréée

**Priorité :** Moyenne  
**Estimation :** 2 points

### US-016 : Rechercher dans les conversations
**En tant qu'** utilisateur connecté,  
**je veux** rechercher une conversation par nom,  
**afin de** la retrouver rapidement.

**Critères d'acceptation :**
- Barre de recherche en haut de la liste
- Recherche en temps réel (debounce)
- Filtre par nom de contact ou nom de groupe
- Résultats mis en évidence
- Effacer la recherche réaffiche toutes les conversations

**Priorité :** Moyenne  
**Estimation :** 2 points

## 4. Messages

### US-017 : Envoyer un message texte
**En tant qu'** utilisateur connecté,  
**je veux** envoyer un message texte,  
**afin de** communiquer avec mes contacts.

**Critères d'acceptation :**
- Champ de saisie multi-lignes
- Bouton "Envoyer" ou touche Entrée
- Le message apparaît immédiatement dans l'UI (optimistic update)
- Indicateur de statut : envoi → envoyé → livré → lu
- Maximum 5000 caractères
- Support des emojis

**Priorité :** Haute  
**Estimation :** 3 points

### US-018 : Recevoir un message en temps réel
**En tant qu'** utilisateur connecté,  
**je veux** recevoir les messages instantanément,  
**afin de** avoir une conversation fluide.

**Critères d'acceptation :**
- Les nouveaux messages s'affichent sans rafraîchir la page
- Scroll automatique vers le bas si déjà en bas de conversation
- Son de notification (désactivable)
- Notification desktop si fenêtre inactive
- Badge avec nombre de messages non lus

**Priorité :** Haute  
**Estimation :** 3 points

### US-019 : Envoyer une image
**En tant qu'** utilisateur connecté,  
**je veux** envoyer une image,  
**afin de** partager du contenu visuel.

**Critères d'acceptation :**
- Bouton d'attachement (trombone ou caméra)
- Support : JPG, PNG, GIF, WEBP
- Taille max : 10 MB
- Preview avant envoi avec option de légende
- Compression automatique
- Affichage en miniature dans la conversation
- Clic pour agrandir

**Priorité :** Haute  
**Estimation :** 4 points

### US-020 : Envoyer un fichier
**En tant qu'** utilisateur connecté,  
**je veux** envoyer un fichier,  
**afin de** partager des documents.

**Critères d'acceptation :**
- Bouton d'attachement
- Support : PDF, DOC, DOCX, XLS, XLSX, TXT, ZIP
- Taille max : 50 MB
- Affichage : icône de type de fichier, nom, taille
- Barre de progression pendant l'upload
- Possibilité de télécharger le fichier

**Priorité :** Moyenne  
**Estimation :** 4 points

### US-021 : Envoyer un message vocal
**En tant qu'** utilisateur connecté,  
**je veux** envoyer un message vocal,  
**afin de** communiquer plus rapidement.

**Critères d'acceptation :**
- Bouton microphone
- Maintenir pour enregistrer, relâcher pour envoyer
- Glisser vers la gauche pour annuler
- Durée max : 2 minutes
- Format : WebM ou MP3
- Player audio avec waveform
- Indicateur de durée

**Priorité :** Basse  
**Estimation :** 5 points

### US-022 : Éditer un message
**En tant qu'** utilisateur,  
**je veux** modifier un message que j'ai envoyé,  
**afin de** corriger une erreur.

**Critères d'acceptation :**
- Option "Modifier" dans le menu du message (clic droit)
- Délai max : 15 minutes après envoi
- Uniquement mes propres messages
- Indicateur "modifié" affiché sur le message
- Historique des modifications non accessible
- Notification aux participants du groupe

**Priorité :** Moyenne  
**Estimation :** 3 points

### US-023 : Supprimer un message
**En tant qu'** utilisateur,  
**je veux** supprimer un message,  
**afin de** retirer un contenu inapproprié.

**Critères d'acceptation :**
- Option "Supprimer" dans le menu du message
- Choix : "Supprimer pour moi" ou "Supprimer pour tous"
- "Pour tous" : délai max 1 heure
- Message remplacé par "Ce message a été supprimé"
- Confirmation requise

**Priorité :** Moyenne  
**Estimation :** 3 points

### US-024 : Réagir à un message (emojis)
**En tant qu'** utilisateur,  
**je veux** réagir à un message avec un emoji,  
**afin de** exprimer une réaction rapide.

**Critères d'acceptation :**
- Clic long ou survol affiche menu de réactions
- Emojis rapides : 👍 ❤️ 😂 😮 😢 🙏
- Possibilité de choisir autre emoji via picker
- Affichage des réactions sous le message
- Un utilisateur peut réagir plusieurs fois (emojis différents)
- Clic sur une réaction pour voir qui a réagi

**Priorité :** Basse  
**Estimation :** 3 points

### US-025 : Répondre à un message spécifique
**En tant qu'** utilisateur,  
**je veux** répondre à un message précis,  
**afin de** maintenir le contexte dans une conversation.

**Critères d'acceptation :**
- Option "Répondre" dans le menu du message
- Preview du message original au-dessus du champ de saisie
- Affichage : auteur + contenu (tronqué si long)
- Clic sur la réponse scrolle vers le message original
- Indicateur visuel liant la réponse au message original

**Priorité :** Moyenne  
**Estimation :** 3 points

### US-026 : Transférer un message
**En tant qu'** utilisateur,  
**je veux** transférer un message vers une autre conversation,  
**afin de** partager rapidement une information.

**Critères d'acceptation :**
- Option "Transférer" dans le menu du message
- Sélection d'une ou plusieurs conversations de destination
- Préservation du format original (texte, image, fichier)
- Mention "Transféré" sur le message
- Confirmation après transfert

**Priorité :** Basse  
**Estimation :** 3 points

### US-027 : Copier un message
**En tant qu'** utilisateur,  
**je veux** copier le contenu d'un message,  
**afin de** le coller ailleurs.

**Critères d'acceptation :**
- Option "Copier" dans le menu du message
- Copie dans le presse-papiers
- Fonctionne pour les messages texte uniquement
- Feedback visuel (tooltip "Copié !")

**Priorité :** Basse  
**Estimation :** 1 point

## 5. Statuts et Indicateurs

### US-028 : Voir le statut d'un contact
**En tant qu'** utilisateur,  
**je veux** voir si un contact est en ligne,  
**afin de** savoir s'il est disponible.

**Critères d'acceptation :**
- Indicateur visuel : point vert (en ligne) / gris (hors ligne)
- Affichage du dernier "vu à" si hors ligne
- Respect des paramètres de confidentialité du contact
- Mise à jour en temps réel

**Priorité :** Haute  
**Estimation :** 2 points

### US-029 : Voir les statuts des messages
**En tant qu'** expéditeur,  
**je veux** voir l'état de mes messages,  
**afin de** savoir s'ils ont été lus.

**Critères d'acceptation :**
- États : envoyé (✓), livré (✓✓), lu (✓✓ bleu)
- Mise à jour en temps réel
- Dans les groupes : affichage du nombre de personnes ayant lu
- Clic pour voir le détail (qui a lu et quand)

**Priorité :** Haute  
**Estimation :** 3 points

### US-030 : Voir l'indicateur "en train d'écrire"
**En tant qu'** utilisateur,  
**je veux** voir quand mon contact tape un message,  
**afin de** savoir qu'il répond.

**Critères d'acceptation :**
- Texte "en train d'écrire..." affiché sous le nom du contact
- Animation de points (...)
- Disparaît après 3 secondes d'inactivité
- Dans les groupes : affichage du nom "Alice est en train d'écrire..."

**Priorité :** Moyenne  
**Estimation :** 2 points

## 6. Gestion des Groupes

### US-031 : Ajouter un membre au groupe
**En tant qu'** administrateur de groupe,  
**je veux** ajouter de nouveaux membres,  
**afin de** agrandir le groupe.

**Critères d'acceptation :**
- Option "Ajouter membre" dans les paramètres du groupe
- Sélection parmi mes contacts
- Maximum 256 membres par groupe
- Notification envoyée aux nouveaux membres
- Message système dans la conversation

**Priorité :** Haute  
**Estimation :** 2 points

### US-032 : Retirer un membre du groupe
**En tant qu'** administrateur de groupe,  
**je veux** retirer un membre,  
**afin de** gérer la composition du groupe.

**Critères d'acceptation :**
- Option "Retirer" sur chaque membre (sauf soi-même)
- Demande de confirmation
- Le membre retiré ne voit plus les nouveaux messages
- Message système notifiant le retrait
- Historique conservé pour le membre retiré

**Priorité :** Moyenne  
**Estimation :** 2 points

### US-033 : Quitter un groupe
**En tant que** membre d'un groupe,  
**je veux** quitter le groupe,  
**afin de** ne plus recevoir les messages.

**Critères d'acceptation :**
- Option "Quitter le groupe" dans les paramètres
- Demande de confirmation
- Message système notifiant le départ
- Le groupe disparaît de ma liste de conversations
- Possibilité d'être rajouté ultérieurement

**Priorité :** Moyenne  
**Estimation :** 2 points

### US-034 : Modifier les informations du groupe
**En tant qu'** administrateur de groupe,  
**je veux** modifier le nom et la photo du groupe,  
**afin de** personnaliser le groupe.

**Critères d'acceptation :**
- Accès aux paramètres du groupe
- Modification du nom (max 50 caractères)
- Upload d'une photo (max 5 MB)
- Message système notifiant les changements
- Tous les membres voient les modifications instantanément

**Priorité :** Moyenne  
**Estimation :** 2 points

### US-035 : Promouvoir/Rétrograder un administrateur
**En tant qu'** administrateur de groupe,  
**je veux** nommer d'autres administrateurs,  
**afin de** partager la gestion du groupe.

**Critères d'acceptation :**
- Option "Nommer administrateur" sur chaque membre
- Option "Retirer admin" pour les admins existants
- Badge visuel pour identifier les admins
- Notification au membre promu/rétrogradé
- Minimum 1 admin par groupe (ne peut pas se rétrograder si seul admin)

**Priorité :** Basse  
**Estimation :** 2 points

### US-036 : Configurer les permissions du groupe
**En tant qu'** administrateur de groupe,  
**je veux** définir qui peut envoyer des messages et modifier les infos,  
**afin de** contrôler l'activité du groupe.

**Critères d'acceptation :**
- Options de permissions :
  - Qui peut envoyer des messages : Tous / Admins seulement
  - Qui peut modifier les infos : Tous / Admins seulement
  - Qui peut ajouter des membres : Tous / Admins seulement
- Les changements sont appliqués immédiatement
- Notification aux membres si restriction importante

**Priorité :** Basse  
**Estimation :** 3 points

## 7. Recherche

### US-037 : Rechercher dans une conversation
**En tant qu'** utilisateur,  
**je veux** rechercher un mot ou phrase dans une conversation,  
**afin de** retrouver un message ancien.

**Critères d'acceptation :**
- Barre de recherche dans la conversation
- Recherche en temps réel
- Mise en surbrillance des résultats
- Navigation entre les résultats (précédent/suivant)
- Affichage du nombre de résultats trouvés
- Scroll automatique vers le résultat

**Priorité :** Moyenne  
**Estimation :** 3 points

### US-038 : Recherche globale
**En tant qu'** utilisateur,  
**je veux** rechercher dans toutes mes conversations,  
**afin de** retrouver un message sans savoir dans quelle conversation il est.

**Critères d'acceptation :**
- Barre de recherche globale
- Recherche dans : messages, contacts, groupes
- Résultats groupés par type
- Affichage : aperçu du message, conversation, date
- Clic sur un résultat ouvre la conversation au message

**Priorité :** Basse  
**Estimation :** 4 points

## 8. Notifications

### US-039 : Recevoir des notifications push
**En tant qu'** utilisateur,  
**je veux** recevoir des notifications pour les nouveaux messages,  
**afin de** ne pas manquer de messages importants.

**Critères d'acceptation :**
- Demande de permission au premier lancement
- Notification desktop avec : avatar, nom, aperçu du message
- Notification même si l'application est fermée (service worker)
- Clic sur la notification ouvre la conversation
- Son de notification (personnalisable)

**Priorité :** Haute  
**Estimation :** 4 points

### US-040 : Gérer les paramètres de notifications
**En tant qu'** utilisateur,  
**je veux** personnaliser mes notifications,  
**afin de** contrôler les interruptions.

**Critères d'acceptation :**
- Activation/désactivation globale
- Activation/désactivation par conversation
- Mode "Ne pas déranger" avec horaires
- Choix du son de notification
- Preview du message dans la notification (on/off)
- Notifications pour : messages, mentions, réactions

**Priorité :** Moyenne  
**Estimation :** 3 points

## 9. Confidentialité et Sécurité

### US-041 : Contrôler la visibilité de mon statut en ligne
**En tant qu'** utilisateur,  
**je veux** masquer mon statut en ligne,  
**afin de** préserver ma confidentialité.

**Critères d'acceptation :**
- Paramètre "Statut en ligne" : Tout le monde / Mes contacts / Personne
- Paramètre "Dernière visite" : Tout le monde / Mes contacts / Personne
- Si masqué, je ne vois pas non plus le statut des autres
- Les changements sont appliqués immédiatement

**Priorité :** Moyenne  
**Estimation :** 2 points

### US-042 : Contrôler la visibilité de ma photo de profil
**En tant qu'** utilisateur,  
**je veux** définir qui peut voir ma photo de profil,  
**afin de** contrôler mon image.

**Critères d'acceptation :**
- Paramètre : Tout le monde / Mes contacts / Personne
- Photo remplacée par avatar par défaut pour les personnes non autorisées

**Priorité :** Basse  
**Estimation :** 1 point

### US-043 : Signaler un message ou utilisateur
**En tant qu'** utilisateur,  
**je veux** signaler un contenu inapproprié,  
**afin de** maintenir une communauté saine.

**Critères d'acceptation :**
- Option "Signaler" dans le menu du message
- Choix de la raison : spam, harcèlement, contenu inapproprié, etc.
- Champ de texte pour détails
- Le signalement est envoyé aux modérateurs
- Confirmation de soumission
- Option de bloquer l'utilisateur après signalement

**Priorité :** Basse  
**Estimation :** 3 points

## 10. Performance et Expérience Utilisateur

### US-044 : Charger les messages progressivement
**En tant qu'** utilisateur,  
**je veux** que les messages se chargent rapidement,  
**afin de** avoir une expérience fluide.

**Critères d'acceptation :**
- Chargement initial : 50 derniers messages
- Scroll vers le haut charge 50 messages supplémentaires
- Indicateur de chargement visible
- Pas de saccades lors du scroll
- Conservation de la position de scroll après chargement

**Priorité :** Haute  
**Estimation :** 3 points

### US-045 : Mode hors ligne
**En tant qu'** utilisateur,  
**je veux** consulter mes conversations sans connexion,  
**afin de** accéder à l'historique partout.

**Critères d'acceptation :**
- Messages récents disponibles hors ligne (cache)
- Indication visuelle "Hors ligne"
- Messages envoyés mis en file d'attente
- Envoi automatique à la reconnexion
- Synchronisation des messages manqués au retour en ligne

**Priorité :** Moyenne  
**Estimation :** 5 points

### US-046 : Mode sombre
**En tant qu'** utilisateur,  
**je veux** activer un thème sombre,  
**afin de** réduire la fatigue oculaire.

**Critères d'acceptation :**
- Basculement dans les paramètres
- Application instantanée sans rechargement
- Toutes les pages et composants supportés
- Conservation du choix entre les sessions
- Option "Auto" basée sur l'heure ou préférence système

**Priorité :** Basse  
**Estimation :** 2 points

## Récapitulatif

**Total des user stories : 46**

### Répartition par priorité :
- **Haute** : 18 stories (39%)
- **Moyenne** : 20 stories (43%)
- **Basse** : 8 stories (17%)

### Répartition par catégorie :
- Authentification : 5 stories
- Gestion des contacts : 5 stories
- Conversations : 6 stories
- Messages : 11 stories
- Statuts et indicateurs : 3 stories
- Gestion des groupes : 6 stories
- Recherche : 2 stories
- Notifications : 2 stories
- Confidentialité : 3 stories
- Performance/UX : 3 stories

### Estimation totale : ~120 story points

### Ordre de développement recommandé :

**Sprint 1 - Fondations (US-001 à US-009)**
- Authentification complète
- Gestion basique des contacts

**Sprint 2 - Messagerie de base (US-011, US-017, US-018, US-028, US-029)**
- Conversations individuelles
- Envoi/réception de messages texte
- Statuts

**Sprint 3 - Médias et fichiers (US-019, US-020, US-044)**
- Partage d'images et fichiers
- Chargement progressif

**Sprint 4 - Groupes (US-012, US-013, US-031 à US-034)**
- Création et gestion de groupes

**Sprint 5 - Fonctionnalités avancées (US-022, US-023, US-025, US-030, US-037, US-039)**
- Édition/suppression de messages
- Indicateurs en temps réel
- Notifications

**Sprint 6 - Finitions (Stories restantes)**
- Recherche, réactions, mode hors ligne, etc.
