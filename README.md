📱 AMJE Bordeaux – Mobile App

App interne pour la gestion des études, KPI, documents et workflow AMJE

Ce projet est une application mobile développée avec Expo / React Native pour la Junior-Entreprise AMJE Bordeaux.
Elle centralise la création, le suivi et la gestion des études, en intégrant un backend Supabase (PostgreSQL + Realtime + Storage).

⸻

🚀 Fonctionnalités principales

🔧 Gestion des études (CRUD complet)
	•	Création d’une nouvelle étude
	•	Mise à jour du statut
(En cours → Livré → Facturé → Clos)
	•	Suppression avec mise à jour instantanée
	•	Affichage détaillé d’une étude

📊 Dashboard & KPI
	•	Nombre total d’études
	•	Études créées ce mois
	•	Montant total et montant moyen
	•	Répartition des statuts
	•	Graphiques :
Nombre d’études / Mois et Montant total / Mois

📁 Page Documents (préparée)
	•	Checklist : Devis, Convention d’Étude, Récapitulatif de Mission, PVRF
	•	Boutons Télécharger / Déposer (Storage Supabase-ready)

🔐 Authentification (architecture déjà prête)
	•	Gestion future des rôles (Président, Qualité, Trésorerie, Business Manager…)
	•	PersistSession avec Supabase Auth
	•	Redirection automatique si non connecté

🔄 Realtime

L’app utilise Supabase Realtime pour :
	•	mettre à jour instantanément toutes les listes
	•	recalculer les KPI sans refresh manuel
	•	supprimer/ajouter une étude sur tous les appareils connectés
