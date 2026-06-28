# El nombre del grupo de recursos donde se ha desplegado todo.
output "resource_group_name" {
  description = "The name of the resource group where all resources are deployed."
  value       = azurerm_resource_group.rg.name
}

output "aks_cluster_name" {
  description = "The name of the AKS cluster."
  value       = azurerm_kubernetes_cluster.aks.name
}

output "acr_login_server" {
  description = "The login server of the Azure Container Registry."
  value       = azurerm_container_registry.acr.login_server
}