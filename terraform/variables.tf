variable "credentials_file" {
  type        = "string"
  description = "Relative path to the service account credentials file"
}

variable "project_id" {
  type        = "string"
  description = "ID of the Google Cloud Platform project being targeted"
}

variable "region" {
  type        = "string"
  description = "GCP project region"
}

variable "instance_name" {
  type        = "string"
  description = "Name of the Compute Instance hosting to chatbot"
}

variable "instance_zone" {
  type        = "string"
  description = "Availability zone that the Compute Instance is deployed in"
}

variable "docker_image_name" {
  type        = "string"
  description = "Name of the image on the Docker Hub to create the image from"
}

variable "ssh_user" {
  type        = "string"
  description = "User to SSH into in the Compute Instance"
}

variable "ssh_password" {
  type        = "string"
  description = "Password for the SSH user in the Compute Instance"
}
