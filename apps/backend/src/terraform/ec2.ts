import { initScript } from "./scripts/init-amazon-linux-2";

interface Tag {
  key: string;
  value: string;
}

interface TerraformConfig {
  feature: string
  region: string;
  publicKey: string;
  ami: string;
  instanceType: string;
  tags: Array<Tag>;
  repoUrl: string;
  branch: string;
}

export const generateEc2InstanceTerraformConfig = (
  config: TerraformConfig
): string => {
  return `
terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "5.41.0"
    }
  }
}

provider "aws" {
  region = "${config.region}"
}

resource "aws_key_pair" "deployer" {
  key_name   = "ec2_deployer_key_${Date.now()}"
  public_key = "${config.publicKey}"
}

resource "aws_security_group" "${config.feature}_dev_sg" {
  name        = "${config.feature}_dev_sg"
  description = "Security group for my application allowing HTTP, HTTPS, and SSH inbound"

  # Allow HTTP
  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # Allow HTTPS
  ingress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # Allow SSH
  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # Allow all outbound traffic
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "${config.feature}_dev_sg"
  }
}

resource "aws_instance" "${config.feature}_devserver" {
  ami           = "${config.ami}"
  instance_type = "${config.instanceType}"
  key_name      = aws_key_pair.deployer.key_name

  tags = {
    ${config.tags.map((tag: any) => `"${tag.key}" = "${tag.value}"`).join("\n    ")}
  }

  vpc_security_group_ids = [aws_security_group.${config.feature}_dev_sg.id]

  user_data = <<-EOF
              ${initScript(config.repoUrl, config.branch)}
              EOF
}

output "public_ip" {
  value = aws_instance.${config.feature}_devserver.public_ip
}
`;
};
