output "registry_latest" {
  value = "${data.docker_registry_image.latest.sha256_digest}"
}

output "new_image" {
  value = "${docker_image.new.latest}"
}
