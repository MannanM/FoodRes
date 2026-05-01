NEW MODULE: "Meds" (Medication & Supplements Inventory Management):
Build a self-contained section/tab in the app specifically for tracking medications and supplements. 

ARCHITECTURE INSTRUCTIONS:
- Modular Separation: The code for the Meds module must be completely separate from the Food core app. Place it in a dedicated `/meds` directory (e.g., separate context/hooks, separate components, separate routing). 
- Global Import/Export Integration: Despite the code being separate, the global `localStorage` backup MUST handle both. The exported JSON is unified: `{ "foodData": { ... }, "medsData": { ... } }`.
- Example Data: Include a combined example data set (Food + Meds) accessible via the Settings page "Load Example Data" button.

DATA MODELS:
1. `MedicationProfile`:
- `id` (UUID)
- `name` (String, e.g., "Low-dose Naltrexone", "Psyllium Husk", "Osmolax")
- `baseUnit` (Enum: 'mg', 'g', 'ml', 'unit/tablet')
- `scheduleDose` (Object): 
   - `morning` (Number, amount in baseUnit)
   - `midday` (Number, amount in baseUnit)
   - `night` (Number, amount in baseUnit)
- `scriptRepeatsRemaining` (Number, Optional)
- `scriptExpiryDate` (Date, Optional)
- `lastStockTakeDate` (Date, tracks when the baseline was last verified)

2. `MedInventoryBatch`:
- `id` (UUID)
- `medicationId` (References `MedicationProfile`)
- `quantity` (Number, e.g., 100 tablets, or 1 tub, or 2 bottles)
- `sizePerQuantity` (Number, e.g., 0.2 for 0.2mg tablets, or 500 for a 500g tub) 
- `dateAdded` (Date, the date this specific packet/stock was added)
- `price` (Number, Optional)
*(Note: Total base units added by a batch = quantity * sizePerQuantity)*

AUTO-CALCULATION & RUN-OUT MATH:
Unlike food, Medication relies on *Passive Auto-Deduction* based on the daily schedule.
Calculate current stock dynamically on the fly:
- Step 1: Calculate "Total Daily Need" = `morning + midday + night` (in baseUnits).
- Step 2: Calculate "Total Pool" (in baseUnits) = Sum of all `MedInventoryBatch` records `(quantity * sizePerQuantity)`.
- Step 3: Calculate "Days Passed" = Days elapsed since `lastStockTakeDate`.
- Step 4: Calculate "Consumed Since Stock Take" (in baseUnits) = `Days Passed * Total Daily Need`.
- Step 5: Calculate "Current Estimated Inventory" = `Total Pool - Consumed Since Stock Take`.
- Step 6: Calculate "Days Remaining" = `Current Estimated Inventory / Total Daily Need`.
- Step 7: Calculate "Run-Out Date" = Today + Days Remaining.

CORE VIEWS & FUNCTIONALITY:
- Meds Dashboard:
Show a list of all Medications with calculated run-out metrics and daily routine. Color code the Run-Out Date (Red < 14 days, Yellow < 30 days, Green > 30 days). Clicking a medication enters the **Medication Detail View**.

- Medication Detail View:
Provides a deep dive into a specific medication, listing the full **Stock History** (all batches currently in possession), the active dosage schedule, and a summary of the last physical stock take.

- Daily Routine Summary:
A specialized view showing all medications grouped by time of day (**Morning**, **Midday**, **Night**) for a quick daily checklist.

- Add/Edit Medication & Dosage Changes:
When editing a `MedicationProfile`, if the dosage schedule is changed, the system forces a **Physical Stock Take**. This updates the `lastStockTakeDate` to 'Today' and overwrites previous batches with the new physical count to ensure future accuracy.

- Add Stock (Add Packet):
A simplified form to add new inventory. Uses dynamic labeling for clarity (e.g., "Number of Tablets" or "Number of Bottles" based on unit) and renames "Size per Qty" to **"Dosage"** to align with medical terminology.

NAVIGATION:
The "Meds" tab is integrated into the global navigation bar, positioned between **Market** and **Settings**. Primary entry points for adding items (Food or Meds) are moved to the respective Dashboard headers for a cleaner interface.