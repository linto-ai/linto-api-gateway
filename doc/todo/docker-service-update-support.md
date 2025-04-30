# Spécification : Support de l'update des services Docker

## Objectif
Permettre à l'API Gateway de détecter et gérer dynamiquement les mises à jour (update) des services Docker (Swarm), afin de recharger la configuration et le routage sans redémarrage manuel.

## Contexte
- Le module `DockerEventsModule` écoute déjà les événements Docker de type `service` (create, update, remove, etc.) et les dispatch sur le bus d'événements (`coreEvents`).
- Le module `CoreServicesModule` réagit à l'événement `docker.event.create` pour inspecter et enregistrer un nouveau service via la classe `Service`.
- La classe `Service` encapsule la logique de parsing des labels, endpoints et middlewares d'un service Docker.

## Évolution à apporter

### 1. Écoute des événements `update`
- Étendre la logique de `CoreServicesModule` pour écouter aussi `docker.event.update`.
- À la réception d'un événement `update` :
  - Inspecter le service concerné (`docker.getServiceDetails(event.Actor.ID)`).
  - Parser la nouvelle configuration via la classe `Service`.
  - Comparer avec la version précédente (si déjà enregistrée).
  - Si changement significatif (labels, endpoints, middlewares, image, etc.) :
    - Mettre à jour le service dans le registre interne.
    - Émettre un événement `service.updated` sur le bus d'événements.
    - Mettre à jour dynamiquement le routage si besoin.

### 2. Critères de changement significatif
- Changement de labels importants (`linto.gateway.*`)
- Changement d'image ou de version
- Changement d'endpoints ou de middlewares

### 3. Robustesse
- Prendre en compte un délai de stabilisation après update (optionnel)
- Gérer les erreurs d'inspect ou de service non prêt (retry, logs)

## Exemple de workflow
1. Un service Docker est rebuild ou mis à jour (`docker service update ...`)
2. `DockerEventsModule` capte l'événement `update` et le dispatch (`docker.event.update`)
3. `CoreServicesModule` inspecte le service, compare, et met à jour si besoin
4. Un événement `service.updated` est émis, le routage est mis à jour dynamiquement

## À faire
- [ ] Implémenter l'écoute de `docker.event.update` dans `CoreServicesModule`
- [ ] Ajouter la logique de comparaison et de mise à jour
- [ ] Émettre l'événement `service.updated` si changement
- [ ] Tester le hot-reload en développement

---
**Référence code** : `src/modules/dockerEvents/DockerEventsModule.ts`, `src/modules/services/servicesModule.ts`, `src/modules/services/service.ts`