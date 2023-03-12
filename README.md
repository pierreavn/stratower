# Stratower

<img src="src/public/img/logo.svg" alt="stratower logo" height="50">

Stratower is a simple dashboard to track Cloud resources consumption.

## Getting Started

With Docker:
```bash
docker run -d \
    --name stratower \
    -p 8080:8080 \
    -e STRATOWER_CLUSTERS=Scaleway \
    -e STRATOWER_Scaleway_PROVIDER=scaleway \
    -e STRATOWER_Scaleway_ORGANIZATION_ID=<org-id> \
    -e STRATOWER_Scaleway_AUTH_TOKEN=<auth-token> \
    stratower:latest
```

or from source:
```bash
cp .env.sample .env # Fill .env file
bin/stratower
```
