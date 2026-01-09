#!/usr/bin/env sh

echo "============================================"
echo "      Universal Node.js Installer"
echo "============================================"
echo

# Detect OS
OS="$(uname -s)"

# Detect package manager
detect_pm() {
    for pm in apt dnf yum pacman zypper apk pkg brew; do
        if command -v "$pm" >/dev/null 2>&1; then
            PM="$pm"
            return
        fi
    done
    PM="unknown"
}

detect_pm
echo "Detected package manager: $PM"
echo

install_node() {
    case "$PM" in
        apt) sudo apt update && sudo apt install -y nodejs npm ;;
        dnf) sudo dnf install -y nodejs npm ;;
        yum) sudo yum install -y nodejs npm ;;
        pacman) sudo pacman -Sy --noconfirm nodejs npm ;;
        zypper) sudo zypper install -y nodejs npm ;;
        apk) sudo apk add nodejs npm ;;
        pkg) pkg install -y nodejs ;;
        brew) brew install node ;;
        *)
            echo "No supported package manager found."
            echo "Attempting NodeSource installer..."
            curl -fsSL https://deb.nodesource.com/setup_22.x | sudo sh -
            sudo apt install -y nodejs
            ;;
    esac
}

# Check for Node.js
if ! command -v node >/dev/null 2>&1; then
    echo "Node.js not found."
    echo "Installing Node.js..."
    install_node
fi

echo "Node.js version: $(node -v)"
echo

echo "Installing npm packages..."
npm install debug discord.js-selfbot-v13 open chalk

echo
echo "============================================"
echo "      Installation Complete!"
echo "============================================"
