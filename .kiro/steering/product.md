# Product: Placey Backend

Placey is a proximity-based app that helps users discover nearby recreational places based on their current location. Users provide coordinates and get back nearby places sorted by distance, optionally filtered by category and radius.

This is an educational MVP built for a System Design course and portfolio.

## Polyrepo Architecture

| Repo              | Responsibility                                 |
| ----------------- | ---------------------------------------------- |
| `placey-backend`  | Lambda functions, REST API, geospatial queries |
| `placey-frontend` | React app, map UI, search interface            |
| `placey-infra`    | Terraform IaC, all AWS resource provisioning   |

No shared code between repos — communication is via REST API only.

## Supported Categories

Categories are stored as plain text in the `places` table:

`Comida`, `Farmacia`, `Gasolinera`, `Café`, `Tienda`, `Hospital`, `Banco`, `Gimnasio`, `Hotel`
