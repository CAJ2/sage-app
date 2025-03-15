# Sage

The Sage apps and API are intended to be a unified place for recycling data and anything related to the circular economy. It is primarily intended to be open, accessible, and understandable to anyone.

## Monorepo Structure

The monorepo is organized into the following main directories:

- **apps/api**: Contains the Nest.js API project.
- **apps/frontend**: Contains the Nuxt.js project for Android, iOS apps, and the web version.

## Getting Started

### Prerequisites

Ensure you have the following installed:

- Node.js (>=22.x)
- pnpm (>=10.x)

### Installation

Clone the repository and install the dependencies:

```sh
git clone https://github.com/your-org/sage.git
cd sage
pnpm install
```

### Running the Applications

#### API (Nest.js)

To start the Nest.js API:

```sh
pnpm nx serve api
```

The API will be available at `http://localhost:4444`.

#### Frontend (Nuxt.js)

To start the Nuxt.js frontend:

```sh
pnpm nx serve frontend
```

The frontend will be available at `http://localhost:3000`.

### Common Commands

#### Build

To build the projects:

```sh
pnpm nx build api
pnpm nx build frontend
```

#### Test

To run tests for the projects:

```sh
pnpm nx test api
pnpm nx test frontend
```

#### Lint

To lint the projects:

```sh
pnpm nx lint api
pnpm nx lint frontend
```

#### Versioning and Releasing

To version and release the library:

```sh
pnpm nx release
```

Pass `--dry-run` to see what would happen without actually releasing the library.
