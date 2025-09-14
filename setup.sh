#!/bin/bash

echo "🚀 Setting up Smart Tourist Safety System for SIH 2025"
echo "=================================================="

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

echo "✅ Docker and Docker Compose are installed"

# Create necessary directories
echo "📁 Creating project directories..."
mkdir -p database/init
mkdir -p nginx/ssl
mkdir -p logs

# Set up environment files
echo "⚙️ Setting up environment files..."
if [ ! -f backend/.env ]; then
    cp backend/env.example backend/.env
    echo "✅ Created backend/.env from template"
fi

# Build and start services
echo "🔨 Building and starting services..."
docker-compose up --build -d

# Wait for services to be ready
echo "⏳ Waiting for services to start..."
sleep 30

# Check service health
echo "🏥 Checking service health..."

# Check backend
if curl -f http://localhost:3001/health > /dev/null 2>&1; then
    echo "✅ Backend service is running"
else
    echo "❌ Backend service is not responding"
fi

# Check AI service
if curl -f http://localhost:8001/health > /dev/null 2>&1; then
    echo "✅ AI service is running"
else
    echo "❌ AI service is not responding"
fi

# Check frontend
if curl -f http://localhost:3000 > /dev/null 2>&1; then
    echo "✅ Frontend service is running"
else
    echo "❌ Frontend service is not responding"
fi

echo ""
echo "🎉 Setup completed!"
echo ""
echo "📱 Services are now running:"
echo "   • Frontend Dashboard: http://localhost:3000"
echo "   • Backend API: http://localhost:3001"
echo "   • API Documentation: http://localhost:3001/api/docs"
echo "   • AI Service: http://localhost:8001"
echo ""
echo "🔧 To stop services: docker-compose down"
echo "📊 To view logs: docker-compose logs -f"
echo ""
echo "📚 For more information, check the README.md file"
