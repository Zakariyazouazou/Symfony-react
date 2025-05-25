Symf React E-Commerce App
Une application e-commerce full-stack avec un front-end React et un back-end Symfony, intégrée à Stripe pour les paiements. Ce guide vous explique comment configurer et exécuter les deux parties en local.
________________________________________
📋 Table des Matières
1.	Prérequis
2.	Structure du dépôt
3.	Configuration du Front-End (React)
4.	Configuration du Back-End (Symfony)
o	1. Cloner & Installer
o	2. Clés JWT
o	3. Configuration de l’environnement
o	4. Importation de la base de données
o	5. Stripe CLI & Webhook
o	6. Lancement du serveur Symfony
5.	Démarrage de l’application
6.	Démo Publique
7.	Dépannage & Aide
________________________________________
🔧 Prérequis
Assurez-vous d’avoir installé sur votre machine :
•	Node.js (v16+)
•	npm (v8+)
•	PHP (v8.1+)
•	Composer (dernière version)
•	XAMPP (ou autre stack LAMP/WAMP)
•	Stripe CLI (pour tester les webhooks en local)
________________________________________
📁 Structure du dépôt
•	frontend/ : application React
•	backend/ : API Symfony (avec authentification JWT & intégration Stripe)
________________________________________
⚛️ Configuration du Front-End (React)
1.	Cloner le dépôt et installer les dépendances :
2.	git clone https://github.com/Zakariyazouazou/Symfony-react.git frontend
3.	cd frontend
4.	npm install
5.	Configurer le point d’API
o	Ouvrez src/api/axios.js (ou axios.ts).
o	Modifiez baseURL pour pointer vers votre serveur Symfony local :
o	const api = axios.create({
o	  baseURL: 'http://localhost:8000/api',
o	  // ...autres réglages
o	});
6.	Démarrer le serveur de développement :
7.	npm run dev
Votre application React sera disponible sur http://localhost:5173 (ou l’URL indiquée par Vite).
________________________________________
🖥 Configuration du Back-End (Symfony)
1. Cloner & Installer
# Dans votre dossier de travail
git clone https://github.com/Zakariyazouazou/symfony-ecom.git backend
cd backend
composer install
2. Clés JWT
L’authentification repose sur JSON Web Tokens.
1.	Créez le dossier pour les clés :
2.	mkdir -p config/jwt
3.	Copiez vos fichiers private.pem et public.pem dans config/jwt/.
4.	Appliquez les bonnes permissions :
5.	chmod 600 config/jwt/private.pem
Pourquoi ? Le bundle lexik/jwt-authentication-bundle signe et vérifie les tokens avec ces clés.
3. Configuration de l’environnement
1.	Dupliquez .env.dist en .env (ou renommez .env.dist).
2.	Mettez à jour l’URL de la base de données dans .env :
3.	DATABASE_URL="mysql://UTILISATEUR:MOTDEPASSE@127.0.0.1:3306/NOM_DE_LA_BASE?charset=utf8mb4"
o	UTILISATEUR : votre utilisateur MySQL
o	MOTDEPASSE : votre mot de passe MySQL
o	NOM_DE_LA_BASE : par exemple symfony_ecom
4.	Les clés Stripe et le secret du webhook seront ajoutés plus tard (voir section Stripe).
4. Importation de la base de données
1.	Ouvrez phpMyAdmin (via XAMPP : http://localhost/phpmyadmin).
2.	Créez la base de données :
o	Cliquez sur Nouvelle base, saisissez le nom (ex : symfony_ecom), puis Créer.
3.	Importez le schéma & les données :
o	Sélectionnez votre base dans le panneau de gauche.
o	Cliquez sur l’onglet Import.
o	Sous Fichier à importer, choisissez le fichier SQL dans le dossier crud/ (ex : database_dump.sql).
o	Vérifiez que le format est SQL, puis cliquez sur Exécuter.
Un message de succès doit afficher les tables importées.
4.	Vérifiez :
o	Parcourez les tables (user, order, product, etc.) pour confirmer la présence des données.
5. Stripe CLI & Webhook
1.	Vérifiez l’installation de Stripe CLI :
2.	stripe --version
Cela affiche la version et l’API Stripe par défaut.
3.	Écoutez les événements et transmettez-les à votre endpoint local :
4.	stripe listen --forward-to localhost:8000/api/webhook
5.	Copiez le secret du webhook affiché (ex : whsec_...).
6.	Configurez votre webhook Symfony :
o	Ouvrez src/Controller/WebhookController.php.
o	Remplacez la valeur de private string $endpointSecret = '...'; par votre secret.
6. Lancement du serveur Symfony
symfony server:start
L’API sera accessible sur http://localhost:8000 (utilisez localhost pour la cohérence des cookies JWT).
________________________________________
🚀 Démarrage de l’application
1.	Vérifiez que le serveur Symfony tourne sur http://localhost:8000.
2.	Dans le dossier frontend, mettez à jour src/api/axios.js avec :
3.	baseURL: 'http://localhost:8000/api'
4.	Lancez le serveur React :
5.	cd frontend
6.	npm run dev
7.	Ouvrez votre navigateur :
o	Front-end : http://localhost:5173
o	API Back-end : http://localhost:8000/api
Testez l’inscription, la connexion (JWT) et le paiement via Stripe. Les webhooks doivent traiter les événements de paiement.
________________________________________
🌐 Démo Publique
Front-end : https://symfony-front.zakariyazouazou.com
________________________________________
❓ Dépannage & Aide
•	Erreurs d’import DB : vérifiez la compatibilité SQL et l’absence de tables conflictuelles.
•	Problèmes JWT : vérifiez les permissions de config/jwt/private.pem et la passphrase.
•	Stripe non forwarded : assurez-vous que l’URL est correcte et que le pare-feu autorise.
•	Toujours bloqué ? Contactez l’équipe sur Slack ou par email.
________________________________________
Bon codage !

