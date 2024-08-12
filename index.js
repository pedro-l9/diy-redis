const readline = require("readline-sync");
const STDIN = true;

let COMMANDS;

if (!STDIN) {
  for (let i = 1; i <= 6; i++) {
    console.log(`----------- Scenario ${i}: ------------`);

    COMMANDS = require("fs")
      .readFileSync(`scenarios/${i}.txt`, "utf-8")
      .split("\n");

    run();
  }
} else {
  run();
}

function run() {
  let store = {
    data: {},
    valueCount: {},
  };
  let transactions = [];

  let input, output;
  do {
    input = getNextLine();
    const [command, arg1, arg2, ...rest] = input.split(" ");

    let newStore = getStore();

    if (!STDIN) {
      console.log(command, arg1 ?? "", arg2 ?? "");
    }

    switch (command) {
      case "NUMEQUALTO": {
        log(newStore.valueCount[arg1] ?? 0);
        break;
      }

      case "GET": {
        log(newStore.data[arg1] ?? "NULL");
        break;
      }

      case "SET": {
        setValue(arg1, arg2, newStore);

        break;
      }

      case "UNSET": {
        unsetValue(arg1, newStore);

        break;
      }

      case "BEGIN": {
        transactions.push(newStore);
        break;
      }

      case "ROLLBACK": {
        if (transactions.length) {
          transactions.pop();

          newStore = getStore();
        } else {
          log("NOTRANSACTION");
        }
        break;
      }

      case "COMMIT": {
        if (transactions.length) {
          const commitedStore = transactions.pop();
          transactions = [];

          newStore = { ...getStore(), ...commitedStore };
        } else {
          log("NOTRANSACTION");
        }

        break;
      }
    }

    if (transactions.length) {
      transactions.splice(-1, 1, newStore);
    } else {
      store = newStore;
    }

    if (!STDIN) {
      const expectedOutput = rest.join("").trim();

      if (expectedOutput) {
        console.log("Expected:", expectedOutput);

        if (expectedOutput != output) {
          throw new Error(`Expected "${expectedOutput}" but got "${output}"`);
        }

        output = "";
      }
    }
  } while (input !== "END");

  function getStore() {
    const currentStore = transactions[transactions.length - 1] ?? store;

    return JSON.parse(JSON.stringify(currentStore));
  }

  function setValue(name, value, { data, valueCount }) {
    const currentValue = data[name];

    if (currentValue !== value) {
      if (currentValue) {
        valueCount[currentValue] -= 1;
      }

      data[name] = value;

      const currentCount = valueCount[value] ?? 0;
      valueCount[value] = currentCount + 1;
    }
  }

  function unsetValue(name, { data, valueCount }) {
    const value = data[name];

    delete data[name];
    valueCount[value] -= 1;
  }

  function getNextLine() {
    return STDIN ? String(readline.question()) : COMMANDS.shift();
  }

  function log(value) {
    console.log(value);
    output = value;
  }
}
