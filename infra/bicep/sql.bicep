// PanganTrace AI — Azure SQL Database

@description('Azure region')
param location string

@description('Environment name')
param environment string

@description('SQL admin password')
@secure()
param adminPassword string

var serverName = 'pangantrace-${environment}-sql'
var dbName = 'pangantrace'

resource sqlServer 'Microsoft.Sql/servers@2023-08-01-preview' = {
  name: serverName
  location: location
  properties: {
    administratorLogin: 'pangantrace_admin'
    administratorLoginPassword: adminPassword
    minimalTlsVersion: '1.2'
  }
  tags: {
    project: 'PanganTrace AI'
  }
}

resource sqlDb 'Microsoft.Sql/servers/databases@2023-08-01-preview' = {
  parent: sqlServer
  name: dbName
  location: location
  sku: {
    name: 'Basic'
    tier: 'Basic'
    capacity: 5
  }
  properties: {
    collation: 'SQL_Latin1_General_CP1_CI_AS'
    maxSizeBytes: 2147483648  // 2 GB
  }
}

// Allow Azure services to access
resource firewallRule 'Microsoft.Sql/servers/firewallRules@2023-08-01-preview' = {
  parent: sqlServer
  name: 'AllowAzureServices'
  properties: {
    startIpAddress: '0.0.0.0'
    endIpAddress: '0.0.0.0'
  }
}

output serverFqdn string = sqlServer.properties.fullyQualifiedDomainName
output databaseName string = sqlDb.name
