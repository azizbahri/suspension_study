# Suspension DAQ Implementation Notes

This folder contains implementation-facing documents that translate the theory and software-design notes into concrete backend contracts, data structures, and delivery sequencing.

These notes are intentionally separate from:

- the theoretical core in the parent folder,
- the software-design notes in [../software-design/README.md](../software-design/README.md).

The purpose of this folder is to define how the backend, persistence layer, and frontend integration should actually be built.

## Documents

- [api_contract.md](api_contract.md): Service boundaries and request-response contracts for session import, calibration, analysis, and comparison
- [communication_architecture.md](communication_architecture.md): How the React frontend should communicate with the Python backend in desktop-first and future cloud-capable deployments
- [backend_data_structures.md](backend_data_structures.md): Canonical backend models and the relationships between persisted objects, derived outputs, and API payloads
- [implementation_roadmap.md](implementation_roadmap.md): Delivery sequence that ties backend modules and frontend workflows together through MVP slices