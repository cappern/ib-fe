# IPAM Quality Layer Work Plan

## Phase 1: MVP API Gateway
- Choose KrakenD or Express-based gateway in front of Infoblox WAPI.
- Implement endpoints for subnet creation, IP allocation, and DNS zone creation.
- Add JSON Schema validation to reject malformed payloads.
- Enforce authentication/authorization via Entra ID.
- Return normalized responses and log request IDs.

## Phase 2: Svelte UI for Manual Operations
- Scaffold SvelteKit UI using Carbon Components for enterprise styling.
- Implement forms for subnet and DNS zone creation.
- Integrate MSAL.js for Entra ID login and include bearer tokens in gateway requests.
- Provide client-side validation and helpful error messages.

## Phase 3: Composite Actions
- Extend gateway with an endpoint for creating a subnet and DNS zone in sequence.
- Handle errors between steps and surface combined result to clients.
- Add logging for multi-step operations.

## Phase 4: Policy and Workflow Enhancements
- Introduce policy engine (OPA) to enforce naming conventions and other business rules.
- Evaluate workflow/orchestration tools (Temporal, Camunda, etc.) for robust sequencing.
- Centralize policy definitions and version control them.

## Phase 5: GraphQL Facade
- Implement GraphQL endpoint exposing mutations for subnet, zone, and composite operations.
- Map resolvers to gateway/ orchestration logic.
- Generate TypeScript types for UI consumption.

## Phase 6: Monitoring & Testing
- Add structured logging with correlation IDs.
- Implement unit tests for validation and orchestration logic.
- Gather metrics on request volume, success rates, and policy violations.

## Phase 7: Deployment & Scaling
- Containerize gateway and UI; deploy to chosen environment (Kubernetes, VM, etc.).
- Configure CI/CD pipeline for automated builds and tests.
- Plan for horizontal scaling and high availability.

