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
