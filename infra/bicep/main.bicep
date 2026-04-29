// PanganTrace AI — Main Bicep Template
// Orchestrates all Azure resources

targetScope = 'subscription'

@description('Environment name')
param environment string = 'dev'

@description('Primary Azure region')
param location string = 'southeastasia'

@description('SQL admin password')
@secure()
param sqlAdminPassword string

// Resource Group
resource rg 'Microsoft.Resources/resourceGroups@2023-07-01' = {
  name: 'pangantrace-${environment}-rg'
  location: location
  tags: {
    project: 'PanganTrace AI'
    environment: environment
  }
}

// SQL Database
module sql 'sql.bicep' = {
  name: 'sql-deployment'
  scope: rg
  params: {
    location: location
    environment: environment
    adminPassword: sqlAdminPassword
  }
}

// Machine Learning Workspace
module ml 'ml.bicep' = {
  name: 'ml-deployment'
  scope: rg
  params: {
    location: location
    environment: environment
  }
}

// Event Hub
module eventhub 'eventhub.bicep' = {
  name: 'eventhub-deployment'
  scope: rg
  params: {
    location: location
    environment: environment
  }
}

// Outputs
output resourceGroupName string = rg.name
output sqlServerFqdn string = sql.outputs.serverFqdn
output mlWorkspaceName string = ml.outputs.workspaceName
output eventhubNamespace string = eventhub.outputs.namespaceName
