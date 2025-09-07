# Environment Setup Guide

This guide explains how to configure environment variables and secrets for the Angkor Compliance Platform CI/CD pipeline.

## Required Secrets

### Repository Secrets

These secrets are available to all workflows and should be configured in **Settings** → **Secrets and variables** → **Actions** → **Repository secrets**.

#### GitHub Token
- **Name**: `GITHUB_TOKEN`
- **Description**: GitHub token for repository access
- **Value**: Automatically provided by GitHub Actions
- **Required**: No (automatically available)

#### Codecov Token
- **Name**: `CODECOV_TOKEN`
- **Description**: Codecov token for coverage reporting
- **Value**: Get from [codecov.io](https://codecov.io)
- **Required**: Yes (for coverage reporting)

#### Snyk Token
- **Name**: `SNYK_TOKEN`
- **Description**: Snyk token for security scanning
- **Value**: Get from [snyk.io](https://snyk.io)
- **Required**: Yes (for security scanning)

### Environment Secrets

These secrets are specific to each environment and should be configured in **Settings** → **Environments** → **[Environment Name]** → **Environment secrets**.

#### Staging Environment

##### Database
- **Name**: `STAGING_DATABASE_URL`
- **Description**: PostgreSQL connection string for staging
- **Value**: `postgresql://username:password@staging-db-host:5432/angkor_compliance_staging`
- **Required**: Yes

##### Redis
- **Name**: `STAGING_REDIS_URL`
- **Description**: Redis connection string for staging
- **Value**: `redis://staging-redis-host:6379`
- **Required**: Yes

##### JWT
- **Name**: `STAGING_JWT_SECRET`
- **Description**: JWT secret key for staging
- **Value**: Generate a secure random string (32+ characters)
- **Required**: Yes

##### AWS S3
- **Name**: `STAGING_AWS_ACCESS_KEY_ID`
- **Description**: AWS access key for staging S3 bucket
- **Value**: Your AWS access key
- **Required**: Yes

- **Name**: `STAGING_AWS_SECRET_ACCESS_KEY`
- **Description**: AWS secret key for staging S3 bucket
- **Value**: Your AWS secret key
- **Required**: Yes

- **Name**: `STAGING_AWS_S3_BUCKET`
- **Description**: S3 bucket name for staging
- **Value**: `angkor-compliance-staging-files`
- **Required**: Yes

- **Name**: `STAGING_AWS_REGION`
- **Description**: AWS region for staging
- **Value**: `us-east-1`
- **Required**: Yes

##### Email Service
- **Name**: `STAGING_EMAIL_SERVICE_API_KEY`
- **Description**: Email service API key for staging
- **Value**: Your email service API key
- **Required**: Yes

- **Name**: `STAGING_EMAIL_FROM`
- **Description**: Default sender email for staging
- **Value**: `noreply-staging@angkorcompliance.com`
- **Required**: Yes

#### Production Environment

##### Database
- **Name**: `PRODUCTION_DATABASE_URL`
- **Description**: PostgreSQL connection string for production
- **Value**: `postgresql://username:password@prod-db-host:5432/angkor_compliance_production`
- **Required**: Yes

##### Redis
- **Name**: `PRODUCTION_REDIS_URL`
- **Description**: Redis connection string for production
- **Value**: `redis://prod-redis-host:6379`
- **Required**: Yes

##### JWT
- **Name**: `PRODUCTION_JWT_SECRET`
- **Description**: JWT secret key for production
- **Value**: Generate a secure random string (32+ characters)
- **Required**: Yes

##### AWS S3
- **Name**: `PRODUCTION_AWS_ACCESS_KEY_ID`
- **Description**: AWS access key for production S3 bucket
- **Value**: Your AWS access key
- **Required**: Yes

- **Name**: `PRODUCTION_AWS_SECRET_ACCESS_KEY`
- **Description**: AWS secret key for production S3 bucket
- **Value**: Your AWS secret key
- **Required**: Yes

- **Name**: `PRODUCTION_AWS_S3_BUCKET`
- **Description**: S3 bucket name for production
- **Value**: `angkor-compliance-production-files`
- **Required**: Yes

- **Name**: `PRODUCTION_AWS_REGION`
- **Description**: AWS region for production
- **Value**: `us-east-1`
- **Required**: Yes

##### Email Service
- **Name**: `PRODUCTION_EMAIL_SERVICE_API_KEY`
- **Description**: Email service API key for production
- **Value**: Your email service API key
- **Required**: Yes

- **Name**: `PRODUCTION_EMAIL_FROM`
- **Description**: Default sender email for production
- **Value**: `noreply@angkorcompliance.com`
- **Required**: Yes

##### SSL/TLS
- **Name**: `PRODUCTION_SSL_CERT_PATH`
- **Description**: Path to SSL certificate
- **Value**: `/etc/ssl/certs/angkor-compliance.crt`
- **Required**: Yes

- **Name**: `PRODUCTION_SSL_KEY_PATH`
- **Description**: Path to SSL private key
- **Value**: `/etc/ssl/private/angkor-compliance.key`
- **Required**: Yes

## Setup Instructions

### 1. Configure Repository Secrets

1. Go to your repository on GitHub
2. Navigate to **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Add each secret with the appropriate name and value

### 2. Configure Environment Secrets

1. Go to **Settings** → **Environments**
2. Click on **staging** environment
3. Add all staging-specific secrets
4. Click on **production** environment
5. Add all production-specific secrets

### 3. Generate Secure Secrets

#### JWT Secret
```bash
# Generate a secure JWT secret
openssl rand -base64 32
```

#### Database Password
```bash
# Generate a secure database password
openssl rand -base64 24
```

### 4. AWS S3 Setup

#### Create S3 Buckets
```bash
# Create staging bucket
aws s3 mb s3://angkor-compliance-staging-files --region us-east-1

# Create production bucket
aws s3 mb s3://angkor-compliance-production-files --region us-east-1

# Set bucket policies for public read access to uploaded files
aws s3api put-bucket-policy --bucket angkor-compliance-staging-files --policy file://staging-bucket-policy.json
aws s3api put-bucket-policy --bucket angkor-compliance-production-files --policy file://production-bucket-policy.json
```

#### S3 Bucket Policy Example
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::angkor-compliance-staging-files/*"
    }
  ]
}
```

### 5. Database Setup

#### PostgreSQL Setup
```sql
-- Create staging database
CREATE DATABASE angkor_compliance_staging;
CREATE USER angkor_staging WITH PASSWORD 'your-secure-password';
GRANT ALL PRIVILEGES ON DATABASE angkor_compliance_staging TO angkor_staging;

-- Create production database
CREATE DATABASE angkor_compliance_production;
CREATE USER angkor_production WITH PASSWORD 'your-secure-password';
GRANT ALL PRIVILEGES ON DATABASE angkor_compliance_production TO angkor_production;
```

#### Redis Setup
```bash
# Install Redis
sudo apt-get install redis-server

# Configure Redis for staging
sudo nano /etc/redis/redis-staging.conf

# Configure Redis for production
sudo nano /etc/redis/redis-production.conf
```

### 6. Email Service Setup

#### Using SendGrid
1. Sign up at [sendgrid.com](https://sendgrid.com)
2. Create an API key
3. Verify your sender email
4. Add the API key to your environment secrets

#### Using AWS SES
1. Set up AWS SES
2. Verify your domain
3. Create IAM user with SES permissions
4. Add access keys to your environment secrets

## Security Best Practices

### 1. Secret Management
- **Never commit secrets** to version control
- **Use environment-specific secrets** for different deployments
- **Rotate secrets regularly** (every 90 days)
- **Use least privilege principle** for access keys

### 2. Database Security
- **Use strong passwords** (20+ characters)
- **Enable SSL/TLS** for database connections
- **Restrict network access** to database servers
- **Regular security updates** for database software

### 3. AWS Security
- **Use IAM roles** instead of access keys when possible
- **Enable MFA** for AWS accounts
- **Use VPC** for network isolation
- **Enable CloudTrail** for audit logging

### 4. Application Security
- **Use HTTPS** for all communications
- **Implement rate limiting** for API endpoints
- **Enable CORS** with specific origins
- **Regular security scanning** with tools like Snyk

## Troubleshooting

### Common Issues

1. **Secrets not available in workflow**
   - Check if secrets are configured in the correct environment
   - Verify secret names match exactly (case-sensitive)
   - Ensure the workflow has access to the environment

2. **Database connection failures**
   - Verify database URL format
   - Check network connectivity
   - Ensure database is running and accessible

3. **S3 upload failures**
   - Verify AWS credentials
   - Check bucket permissions
   - Ensure bucket exists and is accessible

4. **Email sending failures**
   - Verify email service API key
   - Check sender email verification
   - Review email service quotas and limits

### Support

For issues with environment setup:
1. Check the GitHub Actions logs
2. Verify all secrets are configured correctly
3. Test database and service connections
4. Contact the repository administrators

## Monitoring

### Health Checks
- **Database connectivity**: Check every 5 minutes
- **Redis connectivity**: Check every 5 minutes
- **S3 accessibility**: Check every 10 minutes
- **Email service**: Check every 15 minutes

### Alerts
- Set up alerts for failed health checks
- Monitor secret expiration dates
- Track failed deployments
- Monitor resource usage
