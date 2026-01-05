# How to Connect to GitHub

## Step 1: Install Git

1. **Download Git for Windows:**
   - Visit: https://git-scm.com/download/win
   - Download the latest version
   - Run the installer and follow the setup wizard
   - Use default settings (recommended for beginners)

2. **Verify Installation:**
   After installation, open a new terminal/PowerShell and run:
   ```bash
   git --version
   ```

## Step 2: Configure Git

Set up your name and email (this will be used for your commits):

```bash
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
```

## Step 3: Choose Authentication Method

You have two options: **SSH** (recommended) or **HTTPS with Personal Access Token**.

### Option A: SSH Authentication (Recommended)

#### 3A.1: Check for Existing SSH Keys
```bash
ls ~/.ssh
```

#### 3A.2: Generate a New SSH Key
If you don't have keys, generate one:
```bash
ssh-keygen -t ed25519 -C "your_email@example.com"
```
- Press Enter to accept default location
- Optionally set a passphrase (recommended for security)

#### 3A.3: Start opus 4.5 and Add Key
```bash
# Start opus 4.5
eval "$(ssh-agent -s)"

# Add your SSH key
ssh-add ~/.ssh/id_ed25519
```

#### 3A.4: Copy Your Public Key
```bash
cat ~/.ssh/id_ed25519.pub
```
Copy the entire output (starts with `ssh-ed25519`)

#### 3A.5: Add SSH Key to GitHub
1. Go to GitHub.com and sign in
2. Click your profile picture → **Settings**
3. In the left sidebar, click **SSH and GPG keys**
4. Click **New SSH key**
5. Give it a title (e.g., "My Windows PC")
6. Paste your public key
7. Click **Add SSH key**

#### 3A.6: Test SSH Connection
```bash
ssh -T git@github.com
```
You should see: `Hi username! You've successfully authenticated...`

### Option B: HTTPS with Personal Access Token

#### 3B.1: Generate a Personal Access Token
1. Go to GitHub.com → **Settings** → **Developer settings**
2. Click **Personal access tokens** → **Tokens (classic)**
3. Click **Generate new token (classic)**
4. Give it a name and select scopes (at minimum: `repo`)
5. Click **Generate token**
6. **Copy the token immediately** (you won't see it again!)

#### 3B.2: Use Token When Cloning/Pushing
When you clone or push, use your token as the password:
```bash
git clone https://github.com/username/repo.git
# Username: your_github_username
# Password: your_personal_access_token
```

## Step 4: Connect to a Repository

### Clone an Existing Repository
```bash
# Using SSH
git clone git@github.com:username/repository.git

# Using HTTPS
git clone https://github.com/username/repository.git
```

### Initialize a New Repository and Connect to GitHub

1. **Create a new repository on GitHub:**
   - Go to GitHub.com
   - Click the "+" icon → **New repository**
   - Name it and click **Create repository**

2. **Initialize local repository:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   ```

3. **Connect to GitHub:**
   ```bash
   # Using SSH
   git remote add origin git@github.com:username/repository.git
   
   # OR using HTTPS
   git remote add origin https://github.com/username/repository.git
   ```

4. **Push to GitHub:**
   ```bash
   git branch -M main
   git push -u origin main
   ```

## Quick Reference Commands

```bash
# Check Git status
git status

# Add files
git add .

# Commit changes
git commit -m "Your commit message"

# Push to GitHub
git push

# Pull from GitHub
git pull

# View remote repositories
git remote -v
```

## Troubleshooting

- **"git is not recognized"**: Make sure Git is installed and restart your terminal
- **Permission denied (publickey)**: Check your SSH key is added to GitHub
- **Authentication failed**: Verify your Personal Access Token is correct (for HTTPS)
- **Need to update remote URL**: `git remote set-url origin git@github.com:username/repo.git`


