// PanganTrace AI — Azure Machine Learning Workspace

@description('Azure region')
param location string

@description('Environment name')
param environment string

var workspaceName = 'pangantrace-${environment}-ml'
var storageName = 'pangantrace${environment}st'
var appInsightsName = 'pangantrace-${environment}-ai'
var keyVaultName = 'pangantrace-${environment}-kv'

// Storage Account (required by ML workspace)
resource storage 'Microsoft.Storage/storageAccounts@2023-04-01' = {
  name: storageName
  location: location
  sku: { name: 'Standard_LRS' }
  kind: 'StorageV2'
  tags: { project: 'PanganTrace AI' }
}

// Application Insights (for ML monitoring)
resource appInsights 'Microsoft.Insights/components@2020-02-02' = {
  name: appInsightsName
  location: location
  kind: 'web'
  properties: {
    Application_Type: 'web'
  }
  tags: { project: 'PanganTrace AI' }
}

// Key Vault (for secrets)
resource keyVault 'Microsoft.KeyVault/vaults@2023-07-01' = {
  name: keyVaultName
  location: location
  properties: {
    sku: { family: 'A', name: 'standard' }
    tenantId: subscription().tenantId
    accessPolicies: []
    enableSoftDelete: true
  }
  tags: { project: 'PanganTrace AI' }
}

// ML Workspace
resource mlWorkspace 'Microsoft.MachineLearningServices/workspaces@2023-10-01' = {
  name: workspaceName
  location: location
  identity: { type: 'SystemAssigned' }
  properties: {
    storageAccount: storage.id
    applicationInsights: appInsights.id
    keyVault: keyVault.id
    friendlyName: 'PanganTrace AI ML'
    description: 'ML workspace for fraud detection and price forecasting models'
  }
  tags: { project: 'PanganTrace AI' }
}

output workspaceName string = mlWorkspace.name
output workspaceId string = mlWorkspace.id
