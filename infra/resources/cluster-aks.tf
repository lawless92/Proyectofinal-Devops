resource "azurerm_kubernetes_cluster" "main" {
  name                = "my-aks-cluster"
  location            = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name
  dns_prefix          = "myakscluster"

  # Capa gratuita de Azure para el plano de control
  sku_tier = "Free"

  default_node_pool {
    name       = "default"
    node_count = 1
    vm_size    = "Standard_B2s" # Tamaño económico
  }

  identity {
    type = "SystemAssigned"
  }

  tags = {
    Environment = "Dev-FreeTier"
  }
}
  