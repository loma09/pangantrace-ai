// PanganTrace AI — Azure Event Hub

@description('Azure region')
param location string

@description('Environment name')
param environment string

var namespaceName = 'pangantrace-${environment}-eh'
var hubName = 'pangantrace-transactions'

resource eventHubNamespace 'Microsoft.EventHub/namespaces@2023-01-01-preview' = {
  name: namespaceName
  location: location
  sku: {
    name: 'Basic'
    tier: 'Basic'
    capacity: 1
  }
  tags: { project: 'PanganTrace AI' }
}

resource eventHub 'Microsoft.EventHub/namespaces/eventhubs@2023-01-01-preview' = {
  parent: eventHubNamespace
  name: hubName
  properties: {
    messageRetentionInDays: 1
    partitionCount: 2
  }
}

// Send authorization rule
resource sendRule 'Microsoft.EventHub/namespaces/authorizationRules@2023-01-01-preview' = {
  parent: eventHubNamespace
  name: 'SendPolicy'
  properties: {
    rights: ['Send']
  }
}

// Listen authorization rule
resource listenRule 'Microsoft.EventHub/namespaces/authorizationRules@2023-01-01-preview' = {
  parent: eventHubNamespace
  name: 'ListenPolicy'
  properties: {
    rights: ['Listen']
  }
}

output namespaceName string = eventHubNamespace.name
output hubName string = eventHub.name
