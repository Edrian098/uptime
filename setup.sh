#!/bin/bash

# Uptime Monitor Setup Script
# This script sets up the entire uptime monitoring platform

set -e

echo "🚀 Uptime Monitor Setup"
echo "======================"
echo ""

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker not found. Please install Docker first."
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose not found. Please install Docker Compose first."
    exit 1
fi

echo "✓ Docker and Docker Compose found"
echo ""

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating .env file..."
    cp .env.example .env
    echo "✓ .env file created. Please edit it with your configuration."
else
    echo "✓ .env file already exists"
fi

echo ""
echo "📦 Building Docker images..."
docker-compose build

echo ""
echo "🚀 Starting services..."
docker-compose up -d

echo ""
echo "⏳ Waiting for services to be ready..."
sleep 5

# Check if services are running
if docker-compose ps | grep -q "Up"; then
    echo "✓ Services are running!"
    echo ""
    echo "🎉 Setup complete!"
    echo ""
    echo "Access the application:"
    echo "  📊 Dashboard: http://localhost:3000"
    echo "  🔌 API: http://localhost:3001/api"
    echo ""
    echo "Next steps:"
    echo "  1. Configure your services in the dashboard"
    echo "  2. Set up alerts (email, Telegram, webhooks)"
    echo "  3. Review logs: docker-compose logs -f"
    echo ""
    echo "Documentation:"
    echo "  📖 Quick Start: cat QUICKSTART.md"
    echo "  📘 Full Docs: cat README.md"
    echo "  🔧 API Docs: cat API.md"
else
    echo "❌ Services failed to start"
    echo ""
    echo "Check logs with: docker-compose logs"
    exit 1
fi
