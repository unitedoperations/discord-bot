variable "docker_cfg" {
  type        = "string"
  description = "Path to your Docker config.json file"
}

variable "hub_namespace" {
  type        = "string"
  description = "Namespace containing the Docker image on the registry hub"
}

variable "image_name" {
  type        = "string"
  description = "The name of the Docker image in the registry hub"
}
