const { AccountStorage, AccountOperations } = require("./index");

function setup(initialBalance = 1000.0) {
  const storage = new AccountStorage(initialBalance);
  const operations = new AccountOperations(storage);
  return { storage, operations };
}

// TC-01: View account balance
test("TC-01: view balance returns the current balance", () => {
  const { operations } = setup(1000.0);
  expect(operations.total()).toBe(1000.0);
});

// TC-02: Credit account with a valid amount
test("TC-02: credit increases the balance", () => {
  const { operations } = setup(1000.0);
  expect(operations.credit(250.0)).toBe(1250.0);
});

// TC-03: Debit account with sufficient funds
test("TC-03: debit decreases the balance when funds are sufficient", () => {
  const { operations } = setup(1000.0);
  const result = operations.debit(400.0);
  expect(result.success).toBe(true);
  expect(result.balance).toBe(600.0);
});

// TC-04: Debit account with insufficient funds
test("TC-04: debit is rejected when funds are insufficient", () => {
  const { operations } = setup(1000.0);
  const result = operations.debit(5000.0);
  expect(result.success).toBe(false);
  expect(operations.total()).toBe(1000.0);
});

// TC-05: Debit account with exact balance amount (inclusive boundary)
test("TC-05: debit of the exact balance succeeds and leaves 0.00", () => {
  const { operations } = setup(1000.0);
  const result = operations.debit(1000.0);
  expect(result.success).toBe(true);
  expect(result.balance).toBe(0.0);
});

// TC-08: Persisted balance across operations
test("TC-08: balance persists across sequential operations", () => {
  const { operations } = setup(1000.0);
  operations.credit(100.0);
  expect(operations.total()).toBe(1100.0);
});

// TC-09: Balance precision (2 decimal places)
test("TC-09: credit preserves 2 decimal place precision", () => {
  const { operations } = setup(1000.0);
  expect(operations.credit(0.01)).toBe(1000.01);
});

// TC-10: Multiple sequential operations
test("TC-10: multiple sequential credit/debit operations produce correct final balance", () => {
  const { operations } = setup(1000.0);
  operations.credit(500.0);
  operations.debit(200.0);
  expect(operations.total()).toBe(1300.0);
});
