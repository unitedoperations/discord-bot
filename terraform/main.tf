provider "docker" {
  host = "tcp://127.0.0.1:2376"

  registry_auth = {
    address     = "registry.hub.docker.com"
    config_file = "${var.docker_cfg}"
  }
}

data "docker_registry_image" "latest" {
  name = "${var.hub_namespace}/${var.image_name}:latest"
}

resource "docker_image" "new" {
  name          = "${var.image_name}:latest"
  pull_triggers = ["${data.docker_registry_image.latest.sha256_digest}"]
}
