#!/bin/bash
# Setup AWS CloudWatch Monitoring

echo "📊 Setting up CloudWatch Monitoring..."

# 1. Install CloudWatch Agent
wget https://s3.amazonaws.com/amazoncloudwatch-agent/ubuntu/amd64/latest/amazon-cloudwatch-agent.deb
sudo dpkg -i -E ./amazon-cloudwatch-agent.deb

# 2. Configure Agent
# This config tracks CPU, Memory, Disk, and custom log files
cat <<EOF > /opt/aws/amazon-cloudwatch-agent/bin/config.json
{
  "agent": {
    "metrics_collection_interval": 60,
    "run_as_user": "root"
  },
  "metrics": {
    "append_dimensions": {
      "InstanceId": "\${aws:InstanceId}"
    },
    "metrics_collected": {
      "disk": {
        "measurement": ["used_percent"],
        "metrics_collection_interval": 60,
        "resources": ["*"]
      },
      "mem": {
        "measurement": ["mem_used_percent"],
        "metrics_collection_interval": 60
      }
    }
  },
  "logs": {
    "logs_collected": {
      "files": {
        "collect_list": [
          {
            "file_path": "/var/log/syslog",
            "log_group_name": "RythuMitra-Syslog",
            "log_stream_name": "{instance_id}"
          },
          {
            "file_path": "/var/lib/docker/containers/*/*.log",
            "log_group_name": "RythuMitra-Docker",
            "log_stream_name": "{instance_id}"
          }
        ]
      }
    }
  }
}
EOF

# 3. Start Agent
sudo /opt/aws/amazon-cloudwatch-agent/bin/amazon-cloudwatch-agent-ctl -a fetch-config -m ec2 -c file:/opt/aws/amazon-cloudwatch-agent/bin/config.json -s

echo "✅ CloudWatch Monitoring Active!"
