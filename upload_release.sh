#!/bin/bash
TOKEN="${GITHUB_TOKEN}"
REPO="alxzy-group/alxzen"
TAG="v4.0.1"
NAME="v4.0.1 - Theme Background Fix & Update Panel Fix"
BODY="Fixed Advanced Theme Settings not applying correctly. Fixed option 4 (Update Panel) in setup.sh to also update multiplayer server."

echo "Checking for existing release..."
RESPONSE=$(curl -s -H "Authorization: Bearer $TOKEN" -H "X-GitHub-Api-Version: 2022-11-28" https://api.github.com/repos/$REPO/releases/tags/$TAG)
RELEASE_ID=$(echo "$RESPONSE" | grep '"id":' | head -n 1 | awk -F': ' '{print $2}' | sed 's/,//')

if [ -z "$RELEASE_ID" ] || [ "$RELEASE_ID" = "null" ]; then
    echo "Release not found. Creating..."
    RESPONSE=$(curl -s -X POST \
      -H "Accept: application/vnd.github+json" \
      -H "Authorization: Bearer $TOKEN" \
      -H "X-GitHub-Api-Version: 2022-11-28" \
      https://api.github.com/repos/$REPO/releases \
      -d "{\"tag_name\":\"$TAG\",\"target_commitish\":\"main\",\"name\":\"$NAME\",\"body\":\"$BODY\"}")
    RELEASE_ID=$(echo "$RESPONSE" | grep '"id":' | head -n 1 | awk -F': ' '{print $2}' | sed 's/,//')
fi

if [ -z "$RELEASE_ID" ] || [ "$RELEASE_ID" = "null" ]; then
    echo "Failed to create release. Response:"
    echo "$RESPONSE"
    exit 1
fi

echo "Release created with ID: $RELEASE_ID"

echo "Creating panel.tar.gz..."
# Tar the directory excluding unnecessary files
tar -czf panel.tar.gz --exclude="node_modules" --exclude=".git" --exclude="panel.tar.gz" .

echo "Uploading asset..."

curl -L \
  -X POST \
  -H "Accept: application/vnd.github+json" \
  -H "Authorization: Bearer $TOKEN" \
  -H "X-GitHub-Api-Version: 2022-11-28" \
  -H "Content-Type: application/gzip" \
  --data-binary "@panel.tar.gz" \
  "https://uploads.github.com/repos/$REPO/releases/$RELEASE_ID/assets?name=panel.tar.gz"
