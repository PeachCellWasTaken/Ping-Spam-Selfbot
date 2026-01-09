#!/usr/bin/env bash

set -e

echo "============================================"
echo "      Linux Node.js + Package Installer"
echo "============================================"
echo

# -------------------------------
# Detect package manager
# -------------------------------
detect_pm() {
    if command -v apt >/dev/null 2>&1; then PM=apt
    elif command -v dnf >/dev/null 2>&1; then PM=dnf
    elif command -v yum >/dev/null 2>&1; then PM=yum
    elif command -v pacman >/dev/null 2>&1; then PM=pacman
    elif command -v zypper >/dev/null 2>&1; then PM=zypper
    elif command -v apk >/dev/null 2>&1; then PM=apk
    else PM=unknown
    fi
}

detect_pm

echo "Detected package manager: $PM"
echo

# -------------------------------
# Install Node.js
# -------------------------------
install_node() {
    echo "Installing Node.js..."

    case "$PM" in
        apt)
            sudo apt update
            sudo apt install -y nodejs npm
            ;;
        dnf)
            sudo dnf install -y nodejs npm
            ;;
        yum)
            sudo yum install -y nodejs npm
            ;;
        pacman)
            sudo pacman -Sy --noconfirm nodejs npm
            ;;
        zypper)
            sudo zypper install -y nodejs npm
            ;;
        apk)
            sudo apk add nodejs npm
            ;;
        *)
            echo "No supported package manager found."
            echo "Falling back to NodeSource installer..."
            curl -fsSL https://deb.nodesource.com/setup_22.x | sudo bash -
            sudo apt install -y nodejs
            ;;
    esac
}

# -------------------------------
# Check for Node.js
# -------------------------------
echo "Checking for Node.js..."
if ! command -v node >/dev/null 2>&1; then
    echo "Node.js is NOT installed."
    echo
    read -p "Install Node.js now? (y/n): " yn
    case $yn in
        [Yy]*) install_node ;;
        *) echo "Installation cancelled."; exit 1 ;;
    esac
else
    echo "Node.js found: $(node -v)"
fi

echo

# -------------------------------
# Install npm packages
# -------------------------------
PACKAGES=(debug discord.js-selfbot-v13 open chalk)

echo "Installing npm packages..."
for pkg in "${PACKAGES[@]}"; do
    echo "Installing $pkg..."
    npm install "$pkg" || {
        echo "Failed to install $pkg"
        exit 1
    }
done

echo
echo "============================================"
echo "      All packages installed successfully!"
echo "============================================"
