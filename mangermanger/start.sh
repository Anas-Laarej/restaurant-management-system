#!/bin/bash
echo "🍽️  Démarrage MangerManger Backend..."
cd "$(dirname "$0")"
python manage.py runserver 0.0.0.0:8000
