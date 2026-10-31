#!/usr/bin/env node

// Node.js port of the legacy COBOL accounting system
// (main.cob + operations.cob + data.cob), preserving the
// original business logic, data flow, and menu options.

const readline = require("readline");

// data.cob equivalent: owns the single piece of persistent state.
class AccountStorage {
  constructor(initialBalance = 1000.0) {
    this.balance = initialBalance;
  }

  read() {
    return this.balance;
  }

  write(balance) {
    this.balance = balance;
  }
}

// operations.cob equivalent: business logic for each account operation.
class AccountOperations {
  constructor(storage) {
    this.storage = storage;
  }

  total() {
    return this.storage.read();
  }

  credit(amount) {
    const balance = this.storage.read();
    const newBalance = round2(balance + amount);
    this.storage.write(newBalance);
    return newBalance;
  }

  debit(amount) {
    const balance = this.storage.read();
    if (balance < amount) {
      return { success: false, balance };
    }
    const newBalance = round2(balance - amount);
    this.storage.write(newBalance);
    return { success: true, balance: newBalance };
  }
}

function round2(value) {
  return Math.round(value * 100) / 100;
}

// main.cob equivalent: user interface / menu controller.
function main() {
  const storage = new AccountStorage();
  const operations = new AccountOperations(storage);

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const ask = (question) =>
    new Promise((resolve) => rl.question(question, resolve));

  async function loop() {
    let continueFlag = true;

    while (continueFlag) {
      console.log("--------------------------------");
      console.log("Account Management System");
      console.log("1. View Balance");
      console.log("2. Credit Account");
      console.log("3. Debit Account");
      console.log("4. Exit");
      console.log("--------------------------------");
      const choice = (await ask("Enter your choice (1-4): ")).trim();

      switch (choice) {
        case "1":
          console.log(`Current balance: ${operations.total().toFixed(2)}`);
          break;
        case "2": {
          const amount = parseFloat(await ask("Enter credit amount: "));
          const newBalance = operations.credit(amount);
          console.log(`Amount credited. New balance: ${newBalance.toFixed(2)}`);
          break;
        }
        case "3": {
          const amount = parseFloat(await ask("Enter debit amount: "));
          const result = operations.debit(amount);
          if (result.success) {
            console.log(`Amount debited. New balance: ${result.balance.toFixed(2)}`);
          } else {
            console.log("Insufficient funds for this debit.");
          }
          break;
        }
        case "4":
          continueFlag = false;
          break;
        default:
          console.log("Invalid choice, please select 1-4.");
      }
    }

    console.log("Exiting the program. Goodbye!");
    rl.close();
  }

  loop();
}

if (require.main === module) {
  main();
}

module.exports = { AccountStorage, AccountOperations };
