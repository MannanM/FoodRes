Act as an expert Frontend Developer. I want you to build a React Single Page Application (SPA) called "FoodRes.click" (short for Food Reserves). 

CONTEXT: 
It is a lightweight inventory management system for households to stock up on food to prepare for inflation, climate change, and supply chain shortages. 
Technical constraints: It will be hosted on AWS S3 as a static website. There is NO backend and NO database. All data must be stored in the browser's `localStorage`. The app must include robust Import and Export functionality (saving/loading JSON files) so the user can back up their data. 
Please use React, Vite, and Tailwind CSS. Make the UI clean, utilitarian, and mobile-friendly.

DATA MODELS:
Please implement the following data structures. Note the difference between how data is stored (base units) vs how it is displayed in the UI.

1. FoodType:
- id (UUID)
- name (e.g., "White Rice")
- tags (Array of strings, e.g., ["Bob", "Jane"]. UI should allow comma-separated input).
- weeklyConsumptionRate (Number). UI can allow input as per week, month, or year, but convert and store it strictly as a weekly amount in the base unit (e.g., 420g a year / 52.14 = 8.05g per week).

2. Item:
- id (UUID)
- foodTypeId (References FoodType)
- name (e.g., "Sunbeam Medium White Rice")
- baseAmount (Number). Stored strictly in grams, milliliters, or units.
- unitType (Enum: 'g', 'ml', 'unit')
- quantity (Number, >= 1)
- purchaseDate (Date, Mandatory)
- bestBeforeDate (Date, Optional)
- useByDate (Date, Optional)
- price (Number, Optional)
- batchNumber (String, Optional)
- upc (String, Optional)
- imageUrl (String, Optional)

CORE FUNCTIONALITY & VIEWS:
1. Add Item Form: 
Allow users to create a FoodType (if it doesn't exist) and add an Item. Auto-convert UI inputs (like 2kg) into base units (2000g) for storage.

2. Consumption/Deduction Logic (FIFO):
When a user clicks "Consume 1 Unit" for a FoodType, the system must automatically find the correct Item to deduct from. 
Sorting logic for deduction: First check `useByDate` (soonest first). If null, check `bestBeforeDate` (soonest first). If null, check `purchaseDate` (oldest first). Deduct 1 from the quantity. If quantity reaches 0, delete the item or mark as consumed.

3. Dashboard / Stock View (Grouped) with "Days of Survival" Calculator:
Show an aggregated view grouped by FoodType.
For each FoodType, calculate the Total Base Amount across all items. 
Calculate the Survival Rate: If `weeklyConsumptionRate` > 0, calculate Weeks Remaining = (Total Base Amount / weeklyConsumptionRate). Then multiply by 7 to get Days Remaining. 
Display format example: "White Rice | Total: 20kg | Total Value: $50 | Best Before Range: 1/1/2027 - 2/2/2027 | Survival: 200 Days (28.5 Weeks)".
Must include the ability to filter the dashboard by FoodType tags (e.g., show only items tagged "Bob").

4. Settings / Data Management:
A page with two buttons: "Export Backup" (downloads `localStorage` state as a formatted JSON file) and "Import Backup" (overwrites `localStorage` with uploaded JSON).

Please generate the complete, working code for this application.

ADDITIONAL TECHNICAL REQUIREMENTS & DEPENDENCIES:
- PWA Support: Use `vite-plugin-pwa` to generate a manifest and service worker. The app must be fully installable as a Progressive Web App and work 100% offline.
- Barcode Scanner: Use a lightweight library like `html5-qrcode` or `react-zxing` for camera access.
- Charts: Use a lightweight charting library like `recharts` for price tracking.

ADDITIONS TO CORE FUNCTIONALITY & VIEWS:

5. Offline PWA (Progressive Web App):
Ensure the Vite config includes the PWA plugin configured for offline-first usage. The app should prompt the user to "Install App" to their home screen. Since all data is in `localStorage`, the app must function seamlessly without an internet connection.

6. Expiration Warnings (Traffic Light System):
On the Dashboard and Item lists, apply visual color-coding based on the `useByDate` (or `bestBeforeDate` if use-by is null):
- RED: Expired or expiring within 30 days.
- YELLOW: Expiring within 6 months.
- GREEN: Expiring in more than 6 months (or no expiration date).
Sort items in the detailed view so that RED items are pushed to the top to encourage immediate consumption.

7. Barcode Scanner (Add Item Form):
In the "Add Item" form, include a "Scan Barcode" button that opens the device camera. 
When a UPC is scanned:
- Auto-fill the `upc` field.
- Scan the existing `localStorage` items for a matching UPC. If a match is found in the user's history, automatically pre-fill the `name`, `foodTypeId`, `baseAmount`, and `unitType` to save the user from typing. (Do not use external APIs, rely purely on local history to maintain offline capability).

8. Unit Price Tracker (Inflation Visualizer):
Inside the detailed view for a specific `FoodType`, include a "Price History" line chart.
- X-Axis: `purchaseDate`.
- Y-Axis: Unit Price (e.g., Price per 100g or Price per 100ml).
- Calculation: Unit Price = `(price / (baseAmount * quantity)) * 100`. 
Plot a chronological line chart showing how the cost of this specific FoodType has changed over time, allowing the user to visually track inflation.

9. External UPC Lookup (Open Food Facts Integration):
When a user scans a barcode (or manually types a UPC and clicks "Lookup"), implement the following logic:
- Step 1: Check `localStorage` history for a matching UPC. If found, auto-fill the details (Offline-first approach).
- Step 2: If no local match is found, check if `navigator.onLine` is true. If false, show a toast notification: "Offline: Cannot lookup new product. Please enter manually."
- Step 3: If online, make a fetch `GET` request to the free Open Food Facts API: 
  `https://world.openfoodfacts.org/api/v0/product/{upc}.json`
- Step 4: Parse the response. If `status === 1` (product found):
  - Map `product.product_name` (plus `product.brands` if available) to the Item `name`.
  - Map `product.image_front_small_url` or `product.image_url` to `imageUrl`.
  - Attempt to parse `product.quantity` (e.g., "500 g") to auto-fill `baseAmount` (500) and `unitType` ('g').
  - Auto-fill these fields in the Add Item form so the user can review and save.
- Step 5: Handle errors gracefully (e.g., if API times out or product is not in the database, alert the user to enter details manually).

