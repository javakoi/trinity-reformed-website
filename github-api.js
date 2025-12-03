// GitHub API integration for calendar events
class GitHubAPI {
    constructor() {
        this.repoOwner = 'javakoi';
        this.repoName = 'trinity-reformed-website';
        this.filePath = 'events.json';
        this.token = null;
    }

    // Initialize with GitHub token (stored securely in sessionStorage)
    init() {
        const storedToken = sessionStorage.getItem('githubToken');
        if (storedToken) {
            this.token = storedToken;
        }
    }

    // Set GitHub token
    setToken(token) {
        this.token = token;
        sessionStorage.setItem('githubToken', token);
    }

    // Clear token
    clearToken() {
        this.token = null;
        sessionStorage.removeItem('githubToken');
    }

    // Check if token is set
    hasToken() {
        return !!this.token;
    }

    // Get the current content of events.json from GitHub
    async getFileContent() {
        if (!this.token) {
            throw new Error('GitHub token not set');
        }

        try {
            const url = `https://api.github.com/repos/${this.repoOwner}/${this.repoName}/contents/${this.filePath}`;
            const response = await fetch(url, {
                headers: {
                    'Authorization': `token ${this.token}`,
                    'Accept': 'application/vnd.github.v3+json'
                }
            });

            if (!response.ok) {
                if (response.status === 404) {
                    // File doesn't exist yet, return empty array
                    return [];
                }
                throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();
            const content = atob(data.content.replace(/\s/g, '')); // Decode base64
            return JSON.parse(content);
        } catch (error) {
            console.error('Error fetching file from GitHub:', error);
            throw error;
        }
    }

    // Update events.json on GitHub
    async saveFileContent(events) {
        if (!this.token) {
            throw new Error('GitHub token not set');
        }

        try {
            // First, get the current file to get its SHA (required for update)
            let sha = null;
            try {
                const getUrl = `https://api.github.com/repos/${this.repoOwner}/${this.repoName}/contents/${this.filePath}`;
                const getResponse = await fetch(getUrl, {
                    headers: {
                        'Authorization': `token ${this.token}`,
                        'Accept': 'application/vnd.github.v3+json'
                    }
                });
                
                if (getResponse.ok) {
                    const fileData = await getResponse.json();
                    sha = fileData.sha;
                }
            } catch (error) {
                // File doesn't exist, that's okay - we'll create it
                console.log('File does not exist, will create new file');
            }

            // Prepare the content
            const content = JSON.stringify(events, null, 2);
            const encodedContent = btoa(unescape(encodeURIComponent(content)));

            // Create or update the file
            const url = `https://api.github.com/repos/${this.repoOwner}/${this.repoName}/contents/${this.filePath}`;
            const body = {
                message: `Update calendar events - ${new Date().toLocaleString()}`,
                content: encodedContent,
                branch: 'main'
            };

            if (sha) {
                body.sha = sha; // Include SHA for update
            }

            const response = await fetch(url, {
                method: 'PUT',
                headers: {
                    'Authorization': `token ${this.token}`,
                    'Accept': 'application/vnd.github.v3+json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(body)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`GitHub API error: ${response.status} - ${errorData.message || response.statusText}`);
            }

            const data = await response.json();
            return {
                success: true,
                commit: data.commit,
                message: 'Events saved successfully to GitHub!'
            };
        } catch (error) {
            console.error('Error saving file to GitHub:', error);
            throw error;
        }
    }

    // Test the token by making a simple API call
    async testToken() {
        if (!this.token) {
            return { valid: false, message: 'No token set' };
        }

        try {
            const url = `https://api.github.com/repos/${this.repoOwner}/${this.repoName}`;
            const response = await fetch(url, {
                headers: {
                    'Authorization': `token ${this.token}`,
                    'Accept': 'application/vnd.github.v3+json'
                }
            });

            if (response.ok) {
                return { valid: true, message: 'Token is valid' };
            } else if (response.status === 401) {
                return { valid: false, message: 'Invalid token' };
            } else {
                return { valid: false, message: `Error: ${response.status}` };
            }
        } catch (error) {
            return { valid: false, message: `Error: ${error.message}` };
        }
    }
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = GitHubAPI;
}

