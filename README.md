# FoodRes.MannanLive.com

A powerful PWA (Progressive Web App) for tracking food inventory, monitoring shelf-life, and analyzing market inflation. Designed to help you optimize your pantry and save money.

## 🚀 Key Features

- **Inventory Management**: Track stock levels with support for multiple units (g, ml, units) and automatic consumption logic.
- **Expiration Tracking**: Visual status indicators (Red/Yellow/Green) for items nearing their best-before or use-by dates.
- **Inflation Analytics**:
  - **Market Price Logging**: Scan barcodes to log current shelf prices without adding to inventory.
  - **Visualizer**: Dual-series charts comparing your purchase prices against current market trends.
  - **Savings Analysis**: Real-time calculation of your current stock's "replacement value" vs. what you actually paid.
- **Offline-First**: Fully functional offline using PWA technology and LocalStorage.
- **Smart Barcode Support**: Integrated UPC lookup via Open Food Facts and local history.
- **Privacy Focused**: All data stays in your browser. No account required.
- **Data Portability**: Easy JSON import/export via file or clipboard.

## 🛠️ Technology Stack

- **Framework**: React 19 + TypeScript
- **Build Tool**: Vite 8
- **Styling**: Tailwind CSS
- **Charts**: Recharts
- **PWA**: vite-plugin-pwa
- **Icons**: Lucide React

## 🏃 Getting Started

### Prerequisites
- Node.js (v20 or higher)
- npm

### Installation
```bash
# Clone the repository
git clone <repository-url>

# Navigate to directory
cd food-res

# Install dependencies
npm install
```

### Running Locally
```bash
# Start the dev server
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

### Building for Production
```bash
# Build the production assets
npm run build
```
The output will be in the `dist/` directory.

## 🚢 Deployment
This project includes a GitHub Action (`.github/workflows/deploy.yml`) that automatically builds and deploys the site to an S3 bucket (`foodres.mannanlive.com`) on every push to the `main` branch.

## 🧹 Maintenance
Use the **Clean Storage** option in Settings to quickly prune items with 0 quantity and empty food groups.
