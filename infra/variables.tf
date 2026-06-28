#locacion de azure
variable "location" {
  description = "La región de Azure donde se crearán los recursos."
  type        = string
  default     = "westeurope"
}

#grupo de recursos
variable "resource_group_name" {
  description = "El nombre del grupo de recursos principal."
  type        = string
  default     = "Devops-Project-app"
}

variable "cluster_name" {
  description = "El nombre del clúster de AKS."
  type        = string
  default     = "Devops-Project-cluster"
}

variable "vm_size" {
  description = "El tamaño de la VM para los nodos del clúster de AKS."
  type        = string
  default     = "Standard_B2s" # Tamaño económico de la capa gratuita
}

variable "vnet_address_space" {
  description = "El bloque de direcciones CIDR para la red virtual."
  type        = list(string)
  default     = ["10.0.0.0/16"]
}

variable "aks_subnet_address_prefixes" {
  description = "El bloque de direcciones CIDR para la subred de AKS."
  type        = list(string)
  default     = ["10.0.1.0/24"]
}