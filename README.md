# IPAM Quality Layer Work Plan
## Overview
The app is named NETMax.
Primary objective is to serve as a top system for other systems.

## Phase 1: MVP API Gateway
- Choose KrakenD.
- Implement endpoints for subnet CRUD and IP host CRUD for infoblox ddi wapi, 
- Add JSON Schema validation to reject malformed payloads.
- Enforce authentication/authorization via Entra ID.
- Return normalized responses and log request IDs.

## Phase 2: Svelte UI for Manual Operations
- Scaffold SvelteKit UI using Carbon Components for enterprise styling, dark-80
- The frontend should be designed in a modular manner, where each system is treated as a module.
- Each system will have its own route with sub sequent sub route for each function / page.
- Implement a interactive script for generating modules and their respective pages, functions, models etc. This has priority after the base layout is done.
- Implement layout with uishell, sidebar for sub system pages, and a appswitcher for navigating between systems.
- Logged in users are welcomed with a overview dashboard and key statistics.
- As far it is possible, always use carbon-svelte components, if we need to create our own, make it re-usable so we stay consistent.
- Do not implement live queries or connect front end with backend unless we have mock data to properly display every page/component.
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
