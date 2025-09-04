# Angkor Compliance Platform

## Overview
Angkor Compliance Platform is an AI-first, evidence-driven compliance automation system designed for multi-tenant enterprises. It streamlines audits, case management, and worker grievances.

## Installation
1. Install [Node.js](https://nodejs.org/) (>=18) and npm (>=8).
2. Clone the repository.
3. Install dependencies:
   ```bash
   npm install
   ```

## Development Workflow
- Start the development server:
  ```bash
  npm run dev
  ```
- Run tests and linting before committing:
  ```bash
  npm test
  npm run lint
  ```
- Use Git for version control and submit pull requests for review.

## Deployment
- Deploy the entire Firebase project:
  ```bash
  npm run deploy
  ```
- Deploy individual Firebase components:
  ```bash
  npm run deploy:hosting
  npm run deploy:firestore
  npm run deploy:functions
  ```

## Contributing
Contributions are welcome! Please open an issue or submit a pull request. Ensure code passes tests and linting before submission.

## License
This project is licensed under the MIT License.
