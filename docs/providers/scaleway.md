# Scaleway Provider

## Supported Features
Here are Scaleway features supported by Stratower:
* Compute:
  * ✅ Instances
  * ✅ Volumes
  * ✅ Snapshots
  * ✅ Flexible IPs
  * ❌ Elastic Metal
  * ❌ Apple silicon
* Containers:
  * ✅ Container Registry
* Serverless:
  * ✅ Functions
  * ✅ Containers
  * ❌ Messaging
* Storage:
  * ❌ Object Storage
* Managed Databases:
  * ❌ PostgreSQL
  * ❌ MySQL
  * ❌ Redis
* Network:
  * ❌ Public Gateways
  * ❌ Load Balancers
  * ❌ Domains and DNS
* Managed Services:
  * ❌ Transactional Email
  * ❌ IoT Hub

## Configuration
### Example
```bash
STRATOWER_CLUSTERS=foo

STRATOWER_foo_PROVIDER=scaleway
STRATOWER_foo_NAME=My Cluster
STRATOWER_foo_ICON=cloud-computing
STRATOWER_foo_ORGANIZATION_ID=b8fc2b01-b722-4823-947c-64dfb9c840c4
STRATOWER_foo_ACCESS_KEY=SCW3M34C3YZPT2VYK4A7
STRATOWER_foo_SECRET_KEY=b8fc2b01-b722-4823-947c-64dfb9c840c4
```

### Details

* `STRATOWER_<cluster>_PROVIDER` _(**required**, `scaleway`)_  
Cloud provider of the given cluster

```bash
STRATOWER_foo_PROVIDER=scaleway
```

* `STRATOWER_<cluster>_NAME` _(optional, string)_  
Name of the given cluster

```bash
STRATOWER_foo_NAME=My Cluster
```

* `STRATOWER_<cluster>_ICON` _(optional, string)_  
Icon name of the given cluster, from [tabler-icons.io](https://tabler-icons.io)

```bash
STRATOWER_foo_ICON=cloud-computing
```

* `STRATOWER_<cluster>_ORGANIZATION_ID` _(**required**, string)_  
ID of the Scaleway organization.

```bash
STRATOWER_foo_ORGANIZATION_ID=b8fc2b01-b722-4823-947c-64dfb9c840c4
```

* `STRATOWER_<cluster>_ACCESS_KEY` _(**required**, string)_  
Scaleway access key, with read-only permissions.

```bash
STRATOWER_foo_ACCESS_KEY=SCW3M34C3YZPT2VYK4A7
```

* `STRATOWER_<cluster>_SECRET_KEY` _(**required**, string)_  
Scaleway associated secret key.

```bash
STRATOWER_foo_SECRET_KEY=b8fc2b01-b722-4823-947c-64dfb9c840c4
```
