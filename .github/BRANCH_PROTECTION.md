# Branch Protection Configuration Guide

This document outlines the recommended branch protection rules for the Angkor Compliance Platform repository.

## Branch Protection Rules

### Main Branch (`main`)
- **Required Status Checks**: All CI/CD workflows must pass
- **Required Reviews**: 2 reviewers (at least 1 from code owners)
- **Dismiss Stale Reviews**: Yes
- **Require Review from Code Owners**: Yes
- **Restrict Pushes**: Yes (only via pull requests)
- **Allow Force Pushes**: No
- **Allow Deletions**: No
- **Require Linear History**: Yes
- **Require Up-to-date Branches**: Yes
- **Allow Auto-merge**: Yes (with all requirements met)

### Develop Branch (`develop`)
- **Required Status Checks**: Frontend and Backend tests must pass
- **Required Reviews**: 1 reviewer
- **Dismiss Stale Reviews**: Yes
- **Require Review from Code Owners**: No
- **Restrict Pushes**: Yes (only via pull requests)
- **Allow Force Pushes**: No
- **Allow Deletions**: No
- **Require Linear History**: No
- **Require Up-to-date Branches**: Yes
- **Allow Auto-merge**: Yes (with all requirements met)

### Feature Branches
- **Pattern**: `feature/*`, `bugfix/*`, `hotfix/*`
- **No protection rules** (developers can push directly)
- **Must be merged via pull request**

## Required Status Checks

### For Main Branch
1. `frontend` - Frontend build and test
2. `backend` - Backend build and test
3. `security` - Security scanning
4. `code-quality` - Code quality checks
5. `test-coverage` - Test coverage validation

### For Develop Branch
1. `frontend` - Frontend build and test
2. `backend` - Backend build and test
3. `code-quality` - Code quality checks

## Code Owners

Create a `.github/CODEOWNERS` file with the following structure:

```
# Global code owners
* @vannylyvan0209-hub

# Frontend specific
/angkor-compliance-v2/frontend/ @frontend-team

# Backend specific
/angkor-compliance-v2/backend/ @backend-team

# Documentation
/docs/ @documentation-team

# CI/CD and infrastructure
/.github/ @devops-team
/docker/ @devops-team
```

## Environment Protection Rules

### Staging Environment
- **Required Reviewers**: 1 (any team member)
- **Wait Timer**: 0 minutes
- **Prevent Self-Review**: No

### Production Environment
- **Required Reviewers**: 2 (including repository admin)
- **Wait Timer**: 5 minutes
- **Prevent Self-Review**: Yes

## Setup Instructions

### 1. Configure Branch Protection via GitHub Web Interface

1. Go to your repository on GitHub
2. Navigate to **Settings** → **Branches**
3. Click **Add rule** or **Edit** existing rules
4. Configure the rules as specified above

### 2. Configure Branch Protection via GitHub CLI

```bash
# Install GitHub CLI if not already installed
# https://cli.github.com/

# Configure main branch protection
gh api repos/:owner/:repo/branches/main/protection \
  --method PUT \
  --field required_status_checks='{"strict":true,"contexts":["frontend","backend","security","code-quality","test-coverage"]}' \
  --field enforce_admins=true \
  --field required_pull_request_reviews='{"required_approving_review_count":2,"dismiss_stale_reviews":true,"require_code_owner_reviews":true}' \
  --field restrictions='{"users":[],"teams":[]}' \
  --field allow_force_pushes=false \
  --field allow_deletions=false \
  --field required_linear_history=true

# Configure develop branch protection
gh api repos/:owner/:repo/branches/develop/protection \
  --method PUT \
  --field required_status_checks='{"strict":true,"contexts":["frontend","backend","code-quality"]}' \
  --field enforce_admins=false \
  --field required_pull_request_reviews='{"required_approving_review_count":1,"dismiss_stale_reviews":true,"require_code_owner_reviews":false}' \
  --field restrictions='{"users":[],"teams":[]}' \
  --field allow_force_pushes=false \
  --field allow_deletions=false \
  --field required_linear_history=false
```

### 3. Create CODEOWNERS File

```bash
# Create the CODEOWNERS file
cat > .github/CODEOWNERS << 'EOF'
# Global code owners
* @vannylyvan0209-hub

# Frontend specific
/angkor-compliance-v2/frontend/ @vannylyvan0209-hub

# Backend specific
/angkor-compliance-v2/backend/ @vannylyvan0209-hub

# Documentation
/docs/ @vannylyvan0209-hub

# CI/CD and infrastructure
/.github/ @vannylyvan0209-hub
/docker/ @vannylyvan0209-hub
EOF
```

### 4. Configure Environment Protection

1. Go to **Settings** → **Environments**
2. Create **staging** environment
3. Create **production** environment
4. Configure protection rules as specified above

## Workflow Integration

The branch protection rules work seamlessly with the GitHub Actions workflows:

- **Pull Request Workflow**: Runs on all PRs to protected branches
- **CI/CD Workflow**: Runs on pushes to main/develop branches
- **Code Quality Workflow**: Validates code quality before merge
- **Security Workflow**: Scans for vulnerabilities

## Best Practices

1. **Always create feature branches** from the latest develop branch
2. **Keep feature branches small** and focused on single features
3. **Write meaningful commit messages** following conventional commits
4. **Update documentation** when adding new features
5. **Run tests locally** before pushing
6. **Request reviews early** for complex changes
7. **Use draft pull requests** for work in progress

## Troubleshooting

### Common Issues

1. **Status checks not running**: Ensure workflows are properly configured
2. **Reviews not being counted**: Check CODEOWNERS file and reviewer permissions
3. **Auto-merge not working**: Verify all required checks are passing
4. **Environment deployment failing**: Check environment protection rules

### Support

For issues with branch protection or CI/CD setup, please:
1. Check the GitHub Actions logs
2. Review the branch protection settings
3. Contact the repository administrators
