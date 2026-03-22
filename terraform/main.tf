terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
    local = {
      source  = "hashicorp/local"
      version = "~> 2.0"
    }
  }
}

# 1. PROVIDER: The API Connector
provider "aws" {
  region = "eu-west-3" 
}

# 2. VPC: The Isolated Network
resource "aws_vpc" "agile_vpc" {
  cidr_block           = "10.0.0.0/16"
  enable_dns_support   = true # Essential for K8s internal DNS
  enable_dns_hostnames = true 
  tags = { Name = "agile-project-vpc" }
}

# 3. INTERNET GATEWAY: The "Front Door" 
resource "aws_internet_gateway" "main_gw" {
  vpc_id = aws_vpc.agile_vpc.id
  tags   = { Name = "agile-gw" }
}

# 4. SUBNET: The "Floor"
resource "aws_subnet" "main_subnet" {
  vpc_id                  = aws_vpc.agile_vpc.id
  cidr_block              = "10.0.1.0/24"
  map_public_ip_on_launch = true # Gives EC2s a Public IP address
  tags                    = { Name = "agile-public-subnet" }
}

# 5. ROUTE TABLE: The "Map" to the Internet
resource "aws_route_table" "public_rt" {
  vpc_id = aws_vpc.agile_vpc.id

  route {
    cidr_block = "0.0.0.0/0" # Send all outgoing traffic
    gateway_id = aws_internet_gateway.main_gw.id # to the Internet Gateway
  }
}

# 6. ROUTE TABLE ASSOCIATION: Linking the Floor to the Map
resource "aws_route_table_association" "a" {
  subnet_id      = aws_subnet.main_subnet.id
  route_table_id = aws_route_table.public_rt.id
}

# 7. SECURITY GROUP: The "Firewall"
resource "aws_security_group" "k3s_sg" {
  name   = "k3s-security-group"
  vpc_id = aws_vpc.agile_vpc.id

  # Inbound: SSH for Ansible and manual debugging
  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"] 
  }

  # HTTP - user traffic, Nginx Ingress listens here
  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # HTTPS - for TLS
  ingress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }


  # K3s API - for kubectly and GHA deploys
  ingress {
    from_port   = 6443
    to_port     = 6443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # K3s inter-node communication (Flannel VXLAN)
  ingress {
    from_port   = 8472
    to_port     = 8472
    protocol    = "udp"
    cidr_blocks = ["10.0.0.0/16"]
  }

  # K3s node metrics
  ingress {
    from_port   = 10250
    to_port     = 10250
    protocol    = "tcp"
    cidr_blocks = ["10.0.0.0/16"]
  }

  # Outbound: Allow EVERYTHING
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

# 8. EC2 INSTANCES: The "Compute"
# NOTE: You MUST have a key pair created in AWS Console named "my-key"
resource "aws_instance" "master" {
  ami                    = "ami-00ac45f33470c3095"  # to change
  instance_type          = "t3.micro" #
  subnet_id              = aws_subnet.main_subnet.id
  vpc_security_group_ids = [aws_security_group.k3s_sg.id]
  key_name               = "my-key" # <---  AWS SSH KEY NAME HERE toc.
  
  tags = { Name = "k3s-master" }
}

resource "aws_instance" "worker" {
  ami                    = "ami-00ac45f33470c3095" # toc.
  instance_type          = "t3.micro" # toc.
  subnet_id              = aws_subnet.main_subnet.id
  vpc_security_group_ids = [aws_security_group.k3s_sg.id]
  key_name               = "my-key" # <---  AWS SSH KEY NAME HERE

  tags = { Name = "k3s-worker" }
}

# Outputs - copy these into ansible/inventory.ini after terraform apply
output "master_public_ip" {
  value = aws_instance.master.public_ip
}

output "worker_public_ip" {
  value = aws_instance.worker.public_ip
}

## should i add this ? where will it be used ? 
output "master_private_ip" {
  value = aws_instance.master.private_ip
}

resource "local_file" "ansible_inventory" {
  content = <<EOT
[master]
master_node ansible_host=${aws_instance.master.public_ip}

[worker]
worker_node ansible_host=${aws_instance.worker.public_ip}

[all:vars]
ansible_user=ubuntu
ansible_ssh_private_key_file=~/.ssh/my-key.pem
ansible_python_interpreter=/usr/bin/python3
EOT
  filename = "../ansible/inventory.ini"
}