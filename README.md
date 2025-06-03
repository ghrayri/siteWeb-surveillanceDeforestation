# GeoApp - Plateforme Géospatiale

## Description
GeoApp est une plateforme web complète pour la visualisation et l'analyse de données géospatiales. Elle permet de:
- Visualiser des régions géographiques avec leurs statistiques
- Analyser des images satellites et des données IoT
- Créer des zones personnalisées
- Générer des rapports d'analyse

## Fonctionnalités Principales
- **Cartographie interactive** avec différentes couches de données
- **Analyse d'indices** (NDVI, NDWI, etc.) à partir d'images satellites
- **Données IoT** en temps réel (température, humidité, etc.)
- **Export de données** au format GeoJSON
- **Gestion des utilisateurs** avec authentification sécurisée

## Installation
1. Cloner le dépôt:
```bash
git clone https://github.com/ghrayri/siteWeb-surveillanceDeforestation.git
cd geoapp
```
2. Installer les dépendances:
```bash
pip install -r requirements.txt
```
3. Configurer la base de données:
```bash
python manage.py migrate
```
4. Lancer le serveur:
```bash
python manage.py runserver
```

## Utilisation
1. Accéder à l'interface web à http://localhost:8000
2. Se connecter avec un compte administrateur
3. Explorer les différentes fonctionnalités via le menu

## Licence
Ce projet est sous licence MIT. Vous êtes libre de:
- Utiliser, copier, modifier, fusionner, publier, distribuer
- Sous réserve d'inclure la notice de copyright originale

```
Copyright (c) 2024 chirazGhrayri

Permission est accordée [...]
```

## Contribution
Les contributions sont les bienvenues! Veuillez ouvrir une issue ou une pull request.

## Auteur
- Chiraz Ghrayri (ghrayric@gmail.com)