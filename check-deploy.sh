#!/bin/bash

# Netlify Deploy Notification Webhook Handler
# This script checks Netlify deployment status and sends notifications

NETLIFY_SITE_ID="mom-gen"
NETLIFY_BADGE_URL="https://api.netlify.com/api/v1/badges/41185cae-237d-4bb7-b3a8-6cfbacb19d81/deploy-status"

echo "🚀 Netlify Deployment Monitor"
echo "================================"
echo ""

# Function to check deployment status
check_deploy_status() {
    echo "📡 Checking deployment status..."
    
    # Get the badge status
    STATUS=$(curl -s "$NETLIFY_BADGE_URL" | grep -o 'success\|building\|failed' | head -1)
    
    case $STATUS in
        success)
            echo "✅ Deployment SUCCESSFUL!"
            echo "🌐 Live at: https://mom-gen.netlify.app"
            osascript -e 'display notification "Your MOM Generator is now live!" with title "✅ Netlify Deploy Success"'
            return 0
            ;;
        building)
            echo "🔄 Deployment in progress..."
            return 1
            ;;
        failed)
            echo "❌ Deployment FAILED!"
            osascript -e 'display notification "Check Netlify dashboard for details" with title "❌ Deploy Failed"'
            return 2
            ;;
        *)
            echo "⚠️  Status unknown"
            return 3
            ;;
    esac
}

# Monitor deployment
if [ "$1" == "--watch" ]; then
    echo "👀 Watching for deployment completion..."
    echo ""
    
    while true; do
        check_deploy_status
        STATUS_CODE=$?
        
        if [ $STATUS_CODE -eq 0 ] || [ $STATUS_CODE -eq 2 ]; then
            # Deployment completed (success or failure)
            break
        fi
        
        echo "Checking again in 10 seconds..."
        sleep 10
    done
else
    check_deploy_status
fi

echo ""
echo "📊 View full deployment history:"
echo "   https://app.netlify.com/projects/mom-gen/deploys"
