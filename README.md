# ![logo2](https://github.com/user-attachments/assets/b2caf879-142c-486a-b5c3-0af3ab73edc2)

UrbanRoots est une application web basée sur Angular, conçue pour promouvoir et faciliter le jardinage urbain au sein des communautés. La plateforme permet aux utilisateurs de découvrir et de se connecter avec des jardins locaux, de participer à des événements de jardinage et d'engager des discussions via un forum dédié. UrbanRoots vise à favoriser la collaboration communautaire, à améliorer la durabilité urbaine et à sensibiliser à l'éco-responsabilité.

---

## Fonctionnalités

### Gestion des Utilisateurs
- **Inscription/Connexion** : Créez un compte et connectez-vous en utilisant un email et un mot de passe.
- **Gestion du Profil** : Mettez à jour votre nom, téléchargez une photo de profil et suivez vos activités personnelles (jardins créés, événements auxquels vous avez participé).
- **Tableau de Bord** : Accédez à un tableau de bord utilisateur personnalisé pour voir rapidement les informations pertinentes telles que les jardins et les événements.

### Gestion des Jardins
- **Carte Interactive** : Utilisez Leaflet pour explorer et découvrir les jardins à proximité, avec des options de filtrage par distance et type.
- **Ajouter/Modifier/Supprimer des Jardins** : Les utilisateurs peuvent créer de nouveaux jardins, ajouter des descriptions, télécharger des images et gérer les jardins existants.
- **Voir les Détails du Jardin** : Consultez les détails des jardins, y compris le nom, la localisation, la taille et les images.

### Gestion des Événements
- **Créer/Gérer des Événements** : Organisez des événements de jardinage, des ateliers et des rassemblements communautaires, ou modifiez/supprimez des événements existants.
- **Participer à des Événements** : Rejoignez des événements et suivez votre participation via l'interface de gestion des événements.
- **Liste des Événements** : Parcourez les événements à venir et rejoignez ceux qui vous intéressent.

### Forum (Blogs)
- **Créer/Modifier des Sujets** : Lancez des discussions sur le jardinage, la durabilité et les sujets communautaires.
- **Discussions Filtrées** : Répondez aux messages, engagez-vous avec la communauté et participez à des discussions collaboratives.

---

## Pile Technologique

### Frontend
- **Angular 18** : Framework web dynamique et modulaire.
- **Tailwind CSS/Daisy UI** : Framework CSS utilitaire-first pour un style rapide et personnalisable.
- **Leaflet** : Bibliothèque JavaScript pour créer des cartes interactives.
- **Swiper.js** : Utilisé pour créer des carrousels d'images sur les pages de détails des jardins et des événements.

### Backend
- **Authentification Firebase** : Authentification sécurisée via email/mot de passe.
- **Firestore (Base de Données NoSQL)** : Stocke les données des utilisateurs, des jardins, des événements et des discussions de forum.
- **Stockage Firebase** : Permet de télécharger et de stocker des images et des fichiers multimédias.
- **Hébergement Firebase** : Hébergement de l'application Angular avec support SSL et CDN.

---
## Démarrage

### Prérequis

- **Node.js** : Assurez-vous que Node.js est installé. Téléchargez-le [ici](https://nodejs.org/en/).
- **Angular CLI** : Installez Angular CLI globalement :
  
  ```bash
  npm install -g @angular/cli
  ```
  
## Installation


### 1. Clonez le Répertoire :
```bash
git clone https://github.com/yourusername/urbanroots.git
```

### 2. Naviguez dans le répertoire du projet :
```bash
cd urbanroots
```
### 3. Installez les Dépendances :
```bash
npm install
````

### 4. Configurez Firebase :
Créez un projet Firebase depuis la Console Firebase.
Ajoutez votre configuration Firebase dans src/environments/environment.ts :

```ts
export const environment = {
  production: false,
  firebaseConfig: {
    apiKey: "your-api-key",
    authDomain: "your-app-id.firebaseapp.com",
    projectId: "your-project-id",
    storageBucket: "your-app-id.appspot.com",
    messagingSenderId: "your-messaging-sender-id",
    appId: "your-app-id",
  },
};
```
 ### 5.Lancez l'Application :
```bash
ng serve
```
L'application sera accessible localement à http://localhost:4200.

---
 
## Configuration de Firebase
Pour utiliser pleinement les services Firebase (Authentification, Firestore et Stockage) :

Activez l'authentification (Email/Mot de Passe) dans Firebase.
Créez une base de données Firestore et définissez des règles d'accès.
Activez Firebase Storage pour stocker les images téléchargées par les utilisateurs.
Configurez Firebase Hosting pour déployer l'application au niveau mondial.

## Déploiement
Pour déployer l'application sur Firebase Hosting, suivez ces étapes :
```bash
ng build --prod
firebase deploy
```
Cela construira la version de production de l'application Angular et la déploiera sur Firebase Hosting.



ng build --configuration production

http-server -p 8080 -c-1 dist/interculture/browser

firebase deploy --only hosting
