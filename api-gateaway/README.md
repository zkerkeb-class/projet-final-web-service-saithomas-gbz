# 🦊 API Gateway avec OAuth 2.0

API Gateway construite avec [Elysia](https://elysiajs.com/) et [Bun](https://bun.sh) qui implémente l'authentification OAuth 2.0 avec Google et GitHub.

## ✨ Fonctionnalités

- 🔐 **Authentification OAuth 2.0** avec Google et GitHub
- 🎫 **Gestion des JWT** pour les sessions utilisateurs
- 🔒 **Routes protégées** avec middleware d'authentification
- 🌐 **CORS configuré** pour les applications frontend
- 📝 **Validation des données** avec TypeBox
- 🚀 **Performance optimale** grâce à Bun et Elysia
- 📦 **Architecture modulaire** et scalable

## 🚀 Démarrage rapide

### Prérequis

- [Bun](https://bun.sh) >= 1.0
- Un compte Google Cloud Platform
- Un compte GitHub

### Installation

1. **Cloner le projet et installer les dépendances**

```bash
bun install
```

2. **Configurer les variables d'environnement**

```bash
cp .env.example .env
```

Éditez le fichier `.env` avec vos credentials OAuth (voir [Configuration OAuth](#-configuration-oauth))

3. **Démarrer le serveur**

```bash
bun run dev
```

Le serveur démarre sur `http://localhost:3000` 🎉

## 🔐 Configuration OAuth

### 📘 Documentation complète

Pour un guide détaillé de configuration, consultez [OAUTH_SETUP.md](./OAUTH_SETUP.md)

Ce document contient :
- ✅ Guide pas à pas pour configurer Google OAuth
- ✅ Guide pas à pas pour configurer GitHub OAuth
- ✅ Instructions de test
- ✅ Exemples d'intégration frontend
- ✅ Suggestions de refactoring
- ✅ Bonnes pratiques de sécurité

### Configuration rapide

#### Google OAuth

1. Allez sur [Google Cloud Console](https://console.cloud.google.com/)
2. Créez un projet OAuth 2.0
3. Configurez les redirections autorisées : `http://localhost:3000/auth/google/callback`
4. Copiez le Client ID et Client Secret dans `.env`

#### GitHub OAuth

1. Allez sur [GitHub Settings](https://github.com/settings/developers)
2. Créez une nouvelle OAuth App
3. Configurez le callback : `http://localhost:3000/auth/github/callback`
4. Copiez le Client ID et générez un Client Secret dans `.env`

## 📚 API Endpoints

### Authentification

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/auth` | Informations sur l'API d'authentification |
| GET | `/auth/google` | Initie le flow OAuth Google |
| GET | `/auth/google/callback` | Callback OAuth Google |
| GET | `/auth/github` | Initie le flow OAuth GitHub |
| GET | `/auth/github/callback` | Callback OAuth GitHub |
| GET | `/auth/verify` | Vérifie la validité d'un token JWT |
| GET | `/auth/me` | Récupère le profil de l'utilisateur connecté |
| POST | `/auth/logout` | Déconnecte l'utilisateur |

### Routes publiques

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/` | Page d'accueil de l'API |
| GET | `/health` | Health check |

### Routes de debug (à supprimer en production)

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/auth/users` | Liste tous les utilisateurs |

## 🔑 Utilisation des tokens JWT

### Obtenir un token

1. Redirigez l'utilisateur vers `/auth/google` ou `/auth/github`
2. Après authentification, l'utilisateur est redirigé vers votre frontend avec le token :
   ```
   http://localhost:5173?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...&provider=google
   ```

### Utiliser le token

Ajoutez le token dans le header `Authorization` de vos requêtes :

```bash
curl http://localhost:3000/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Exemple avec JavaScript

```javascript
const token = localStorage.getItem('auth_token');

const response = await fetch('http://localhost:3000/auth/me', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

const data = await response.json();
console.log(data.user);
```

## 🏗️ Architecture

```
src/
├── config/              # Configuration (env, oauth)
│   └── env.ts
├── modules/             # Modules métier
│   └── auth/
│       └── auth.routes.ts
├── services/            # Services (business logic)
│   ├── jwt.service.ts
│   └── user.service.ts
├── types/               # Types TypeScript
│   └── auth.types.ts
└── index.ts            # Point d'entrée
```

## 🧪 Tests

### Test manuel

```bash
# Test Google OAuth
open http://localhost:3000/auth/google

# Test GitHub OAuth
open http://localhost:3000/auth/github

# Test de vérification du token
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:3000/auth/verify
```

### Health check

```bash
curl http://localhost:3000/health
```

## 🔒 Sécurité

- ✅ Les secrets OAuth ne sont jamais exposés côté client
- ✅ Les tokens JWT expirent après 7 jours
- ✅ CORS configuré pour limiter les origines autorisées
- ✅ Validation des données avec TypeBox
- ✅ HTTPS recommandé en production

⚠️ **Important** : Ne commitez JAMAIS votre fichier `.env` !

## 🛠️ Scripts disponibles

```bash
# Démarrer en mode développement (avec hot reload)
bun run dev

# Lancer les tests (à implémenter)
bun test
```

## 📦 Dépendances principales

- **elysia** - Framework web ultra-rapide
- **elysia-oauth2** - Plugin OAuth 2.0 pour Elysia
- **arctic** - Bibliothèque de providers OAuth
- **@elysiajs/jwt** - Gestion des JWT
- **@elysiajs/bearer** - Authentication Bearer token

## 🚀 Déploiement

### Variables d'environnement en production

```bash
NODE_ENV=production
APP_SKOLAR_URL_GATEAWAY=https://api.votredomaine.com
FRONTEND_URL=https://votredomaine.com
JWT_SECRET=votre-secret-ultra-securise-genere-aleatoirement
```

### Checklist avant déploiement

- [ ] Variables d'environnement configurées
- [ ] HTTPS activé
- [ ] URLs de callback OAuth mises à jour (Google + GitHub)
- [ ] CORS configuré avec les bonnes origines
- [ ] Rate limiting activé (recommandé)
- [ ] Logging configuré
- [ ] Base de données persistante (optionnel)

## 📖 Documentation

- [Configuration OAuth détaillée](./OAUTH_SETUP.md)
- [Documentation Elysia](https://elysiajs.com/)
- [Documentation Arctic OAuth](https://arctic.js.org/)
- [Google OAuth 2.0](https://developers.google.com/identity/protocols/oauth2)
- [GitHub OAuth](https://docs.github.com/en/apps/oauth-apps)

## 🐛 Troubleshooting

### Erreur "Invalid redirect_uri"
Vérifiez que l'URL de callback est identique dans `.env` et dans la configuration OAuth (Google/GitHub).

### Variables d'environnement manquantes
Vérifiez que votre fichier `.env` existe et contient toutes les variables requises.

### CORS error
Vérifiez que `FRONTEND_URL` dans `.env` correspond exactement à l'origine de votre frontend.

Consultez [OAUTH_SETUP.md](./OAUTH_SETUP.md) pour plus de solutions.

## 🤝 Contribution

Les contributions sont les bienvenues ! N'hésitez pas à :

1. Fork le projet
2. Créer une branche (`git checkout -b feature/amazing-feature`)
3. Commit vos changements (`git commit -m 'Add amazing feature'`)
4. Push vers la branche (`git push origin feature/amazing-feature`)
5. Ouvrir une Pull Request

## 📝 TODO / Améliorations futures

- [ ] Ajouter une base de données persistante (PostgreSQL + Prisma)
- [ ] Implémenter le refresh token
- [ ] Ajouter le rate limiting
- [ ] Ajouter des tests unitaires et d'intégration
- [ ] Implémenter le logging structuré
- [ ] Ajouter d'autres providers OAuth (Discord, Twitter, etc.)
- [ ] Créer un système de rôles et permissions
- [ ] Ajouter la documentation OpenAPI/Swagger
- [ ] Implémenter la gestion des sessions

## 📄 Licence

MIT

## 👨‍💻 Auteur

Votre nom

---

**Fait avec ❤️ avec Bun et Elysia**
