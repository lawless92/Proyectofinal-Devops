resource "azurerm_container_registry" "acr" {
  name                = "devopsprojectacr${random_string.unique.result}" # Nombre único global
  resource_group_name = azurerm_resource_group.rg.name
  location            = azurerm_resource_group.rg.location
  sku                 = "Basic"
  admin_enabled       = true # Habilitado para que el pipeline de Docker pueda autenticarse
}

resource "random_string" "unique" {
  length  = 6
  special = false
  upper   = false
}

resource "azurerm_role_assignment" "aks_pull_from_acr" {
  scope                = azurerm_container_registry.acr.id
  role_definition_name = "AcrPull"
  principal_id         = azurerm_kubernetes_cluster.aks.identity[0].principal_id
}
