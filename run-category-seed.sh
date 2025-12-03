#!/bin/bash
# Script to run the category cleanup and seeding

echo "🔄 Running category cleanup and seeding script..."
npx ts-node prisma/clean-and-seed-categories.ts
