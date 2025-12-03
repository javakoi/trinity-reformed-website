# Calendar Backend Setup Guide

The calendar now supports automatic synchronization with GitHub, making it much easier to add and edit events without manually uploading files.

## How It Works

- **With GitHub Token**: Events are automatically saved to the `events.json` file in the repository
- **Without GitHub Token**: Events are saved locally and you download a file to manually upload

## Setting Up GitHub Integration

### Step 1: Create a GitHub Personal Access Token

1. Go to [GitHub Settings > Developer settings > Personal access tokens > Tokens (classic)](https://github.com/settings/tokens)
2. Click "Generate new token" → "Generate new token (classic)"
3. Give it a name like "Trinity Church Calendar"
4. Select the `repo` scope (this gives full access to repositories)
5. Click "Generate token"
6. **Copy the token immediately** (you won't be able to see it again!)

### Step 2: Add Token to Calendar

1. Go to the Calendar page on your website
2. Click "Admin Login" and enter the password: `trinitycrec`
3. In the Admin Panel, you'll see a "GitHub Integration" section
4. Click "Manage GitHub Token"
5. Paste your GitHub Personal Access Token
6. Click "Save Token"
7. The system will test the token automatically

### Step 3: Test the Integration

1. Click "Test Token" to verify it's working
2. Add or edit an event
3. The event should automatically sync to GitHub
4. You'll see a success notification when it works

## Security Notes

- The token is stored in your browser's sessionStorage (temporary, cleared when you close the browser)
- The token only has access to the repository you specify
- You can remove the token at any time using the "Remove Token" button
- Never share your token publicly

## Troubleshooting

### "Token verification failed"
- Make sure you copied the entire token
- Verify the token has `repo` permissions
- Check that the token hasn't expired

### "GitHub API error: 404"
- Make sure the repository name is correct in `github-api.js`
- Verify you have access to the repository

### Events not syncing
- Check your internet connection
- Verify the token is still valid in GitHub settings
- Try testing the token again

## Manual Mode (Without Token)

If you prefer not to use GitHub integration:
1. Add/edit events as normal
2. When you save, a file `events.json` will download
3. Upload this file to your GitHub repository manually
4. The changes will appear on the website after the next deployment

## Repository Configuration

The calendar is configured to work with:
- **Repository**: `javakoi/trinity-reformed-website`
- **File**: `events.json`
- **Branch**: `main`

To change these settings, edit the `GitHubAPI` class in `github-api.js`.

