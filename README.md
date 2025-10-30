# Xmrit

Xmrit is the easiest tool to work with the [XmR process-control chart](https://xmrit.com/about/). It is a simple web-based application that allows you to create a chart by pasting in data, interacting with the chart, and sharing it.

A live version of the tool is available at http://xmrit.com/t/ . You can find more details on the tool by reading the [user manual](https://xmrit.com/manual/) or the [integration guide](https://xmrit.com/integration/). All data is stored in your browser and will never be shared with anyone (including us!) as per our [privacy policy](https://xmrit.com/privacy/).

## Getting Started

1. We assume you have [Bun](https://bun.sh/) installed (v1.3.0 or higher)
   - Install Bun: `curl -fsSL https://bun.sh/install | bash`
   - Or via npm: `npm install -g bun`
2. If it is your first time, run `bun install`
3. Otherwise simply run `bun run start` and open your browser at http://localhost:1234.

## Available Scripts

- `bun install` - Install dependencies
- `bun run start` - Start development server with hot reload
- `bun run build` - Build for production

## Why Bun?

This project uses [Bun](https://bun.sh/) as the package manager and runtime for:
- ⚡ Fast dependency installation
- 🚀 Quick script execution
- 🔄 Drop-in replacement for Node.js and npm
- 📦 Efficient package management
