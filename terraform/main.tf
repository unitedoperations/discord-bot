provider "google" {
  credentials = "${file(var.credentials_file)}"
  project     = "${var.project_id}"
  region      = "${var.region}"
}

data "google_compute_instance" "instance" {
  name = "${var.instance_name}"
  zone = "${var.instance_zone}"
}

resource "null_resource" "docker" {
  triggers = {
    image_digest = "${sha1(file("../VERSION"))}"
  }

  connection {
    host     = "${data.google_compute_instance.instance.network_interface.0.access_config.0.nat_ip}"
    user     = "${var.ssh_user}"
    password = "${var.ssh_password}"
  }

  provisioner "remote-exec" {
    inline = [
      "echo ${var.ssh_password} | sudo -S docker pull ${var.docker_image_name}",
      "sudo docker stop $(sudo docker ps -a -q)",
      "sudo docker run --rm -d -e \"ANNOUNCE=true\" ${var.docker_image_name}",
      "sudo docker rmi $(sudo docker images -q | awk 'FNR == 2')",
    ]
  }
}
