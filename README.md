📱 AMJE Bordeaux – Mobile App

Internal Application for Study Management, KPI Tracking & Document Workflow

This project is a mobile application built with Expo / React Native for the Junior Enterprise AMJE Bordeaux.
It centralizes the creation, monitoring and management of client studies, with a realtime backend powered by Supabase (PostgreSQL + Realtime + Storage).

⸻

🚀 Features

🔧 Full Study Management (CRUD)
	•	Create new studies
	•	Update the study status
(en_cours → livré → facturé → clos)
	•	Delete studies (with realtime sync)
	•	Detailed study view

📊 Dashboard & KPIs
	•	Total number of studies
	•	Studies created this month
	•	Total and average revenue
	•	Status distribution
	•	Charts for monthly study count & monthly revenue

📁 Document Checklist (Ready for Storage Integration)

For each study:
	•	Devis (Quote)
	•	Convention d’Étude
	•	Récapitulatif de Mission
	•	PVRF
	•	Each item includes Upload & Download buttons (Supabase Storage-ready)

🔐 Authentication (Architecture Ready)
	•	Supabase Auth configured
	•	Session persistence
	•	Future role-based access planned
	•	Automatic redirection for non-authenticated users

🔄 Realtime Synchronization

Using Supabase Realtime to:
	•	Update lists instantly
	•	Recompute KPIs live
	•	Reflect deletions/updates across all devices without reload

