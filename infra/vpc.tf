provider "azure" {
  region = "eastus"
}

resource "azure_resource_group" "main" {
  name     = "my-resource-group"
  location = "East US"
}