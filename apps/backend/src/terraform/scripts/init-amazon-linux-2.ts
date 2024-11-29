export const initScript = (repoUrl: string, branch: string): string => `
#!/bin/bash

# Update the system
yum update -y

# Install Docker
yum install docker -y

# Start Docker and enable it to start on boot
systemctl start docker
systemctl enable docker

# Add the ec2-user to the docker group 
usermod -a -G docker ec2-user

# Install Docker Compose
curl -L "https://github.com/docker/compose/releases/download/2.24.6/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose

# Clone the given GitHub repository and branch
cd /home/ec2-user
git clone -b ${branch} ${repoUrl}
cd repository_name

# Run Docker Compose build
docker-compose build

# Start Application
docker-compose up -d
`;
