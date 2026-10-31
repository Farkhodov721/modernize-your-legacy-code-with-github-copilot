# Test Plan — Legacy COBOL Accounting System

This test plan documents the business logic of the current COBOL application
(`main.cob`, `operations.cob`, `data.cob`) so it can be validated with
stakeholders and later used to build unit/integration tests for the Node.js
migration.

| Test Case ID | Test Case Description | Pre-conditions | Test Steps | Expected Result | Actual Result | Status (Pass/Fail) | Comments |
|---|---|---|---|---|---|---|---|
| TC-01 | View account balance | Account balance exists in storage (default 1000.00) | 1. Launch the app<br>2. Select menu option `1` (View Balance) | Current balance (1000.00) is displayed | 1000.00 displayed | Pass | Read-only operation, uses `data.cob` READ |
| TC-02 | Credit account with a valid amount | Account balance = 1000.00 | 1. Select menu option `2` (Credit Account)<br>2. Enter amount `250.00` | Balance increases to 1250.00 and new balance is displayed | 1250.00 displayed | Pass | Uses `data.cob` READ then WRITE |
| TC-03 | Debit account with sufficient funds | Account balance = 1000.00 | 1. Select menu option `3` (Debit Account)<br>2. Enter amount `400.00` | Balance decreases to 600.00 and new balance is displayed | 600.00 displayed | Pass | Debit allowed since balance >= amount |
| TC-04 | Debit account with insufficient funds | Account balance = 1000.00 | 1. Select menu option `3` (Debit Account)<br>2. Enter amount `5000.00` | "Insufficient funds for this debit." is displayed, balance unchanged | Message displayed, balance unchanged | Pass | Boundary rule: amount must be <= balance |
| TC-05 | Debit account with exact balance amount | Account balance = 1000.00 | 1. Select menu option `3` (Debit Account)<br>2. Enter amount `1000.00` | Balance becomes 0.00 (edge case, balance >= amount is inclusive) | 0.00 displayed | Pass | Validates inclusive boundary (`>=`) |
| TC-06 | Invalid menu selection | App is running at main menu | 1. Enter an out-of-range value, e.g. `9` | "Invalid choice, please select 1-4." is displayed, menu re-displayed | Message displayed, loop continues | Pass | Handled by `WHEN OTHER` in `main.cob` |
| TC-07 | Exit the application | App is running at main menu | 1. Select menu option `4` (Exit) | "Exiting the program. Goodbye!" is displayed and program terminates | Program exits cleanly | Pass | Sets `CONTINUE-FLAG` to `'NO'` |
| TC-08 | Persisted balance across operations | Account balance = 1000.00 | 1. Credit 100.00<br>2. View balance | Balance reflects the credit (1100.00) on the next read | 1100.00 displayed | Pass | Validates `data.cob` READ/WRITE round-trip |
| TC-09 | Balance precision (2 decimal places) | Account balance = 1000.00 | 1. Credit amount `0.01` | Balance becomes 1000.01, no rounding/truncation errors | 1000.01 displayed | Pass | `PIC 9(6)V99` supports 2 decimal digits |
| TC-10 | Multiple sequential operations | Account balance = 1000.00 | 1. Credit 500.00<br>2. Debit 200.00<br>3. View balance | Final balance = 1300.00 | 1300.00 displayed | Pass | Validates cumulative state across calls |

## Notes for Node.js Migration

- All monetary values should be stored with 2 decimal-place precision
  (consider using integer cents internally to avoid floating point errors,
  since COBOL's `PIC 9(6)V99` is a fixed-point decimal type).
- The debit boundary condition (`balance >= amount`) must be preserved exactly
  — it is inclusive, allowing the balance to reach exactly 0.00.
- The data access layer (`data.cob`) should map to a dedicated module/service
  in Node.js so reads/writes to the balance remain centralized, mirroring the
  current architecture.
