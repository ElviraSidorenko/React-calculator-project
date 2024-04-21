import { useReducer } from "react";
import DigitButton from "./components/DigitButton";
import OperationButton from "./components/OperationButton";
import { ACTIONS } from "./utilities/action";
import "./styles.css";

// Using the reducer function, we can manage the state of the calculator.
// The reducer function takes two arguments: state as 'state' and action as 'type and payload'.
// The state represents the current state of the calculator, and the action represents the action that the user wants to perform.
// The reducer function then returns the new state of the calculator based on the action that was performed.
function reducer(state, { type, payload }) {
  // The switch statement is used to determine which action to perform based on the type of action.
  // Actions are defined in the 'ACTIONS' object, which is imported from the 'utilities/action' file.
  switch (type) {
    // Add a digit to the current operand.
    case ACTIONS.ADD_DIGIT:
      if (state.overwrite) {
        // If the state is set to overwrite, set the current operand to the digit and set overwrite to false.
        return {
          ...state,
          currentOperand: payload.digit,
          overwrite: false,
        };
      }
      // Prevents leading zeros.
      if (payload.digit === "0" && state.currentOperand === "0") {
        return state;
      }
      // Prevents multiple decimal points.
      if (payload.digit === "." && state.currentOperand.includes(".")) {
        return state;
      }

      return {
        ...state,
        currentOperand: `${state.currentOperand || ""}${payload.digit}`,
      };
    // Choose the operation to perform.
    case ACTIONS.CHOOSE_OPERATION:
      // If the current operand and previous operand are null, return the current state.
      if (state.currentOperand == null && state.previousOperand == null) {
        return state;
      }
      // If the current operand is null, set the operation to the payload operation.
      if (state.currentOperand == null) {
        return {
          ...state,
          operation: payload.operation,
        };
      }
      // If the previous operand is null, set the previous operand to the current operand and set the current operand to null.
      if (state.previousOperand == null) {
        return {
          ...state,
          operation: payload.operation,
          previousOperand: state.currentOperand,
          currentOperand: null,
        };
      }

      return {
        ...state,
        previousOperand: evaluate(state),
        operation: payload.operation,
        currentOperand: null,
      };

    // Clear the calculator state.
    case ACTIONS.CLEAR:
      return {};

    // Delete the last digit from the current operand.
    case ACTIONS.DELETE_DIGIT:
      if (state.overwrite) {
        return {
          ...state,
          overwrite: false,
          currentOperand: null,
        };
      }
      if (state.currentOperand == null) return state;
      if (state.currentOperand.length === 1) {
        return { ...state, currentOperand: null };
      }

      return {
        ...state,
        currentOperand: state.currentOperand.slice(0, -1),
      };

    // Evaluate the current expression.
    case ACTIONS.EVALUATE:
      if (
        state.operation == null ||
        state.currentOperand == null ||
        state.previousOperand == null
      ) {
        return state;
      }

      return {
        ...state,
        overwrite: true,
        previousOperand: null,
        operation: null,
        currentOperand: evaluate(state),
      };
  }
}

// The evaluate function takes the current operand, previous operand, and operation as arguments and returns the result of the expression.
function evaluate({ currentOperand, previousOperand, operation }) {
  const prev = parseFloat(previousOperand); // Convert the previous operand to a floating-point number.
  const current = parseFloat(currentOperand); // Convert the current operand to a floating-point number.
  
  if (isNaN(prev) || isNaN(current)) return "";

  let computation = ""; // Initialize the computation variable to an empty string.

  switch (operation) {
    case "+":
      computation = prev + current;
      break;
    case "-":
      computation = prev - current;
      break;
    case "*":
      computation = prev * current;
      break;
    case "÷":
      computation = prev / current;
      break;
  }

  return computation.toString(); // Convert the computation result to a string and return it.
}

// Format the operand (integer part) by adding commas as the thousands separator.
const INTEGER_FORMATTER = new Intl.NumberFormat("en-us", { // `en-us` is the locale for the United States, which uses the comma as the thousands separator.
  maximumFractionDigits: 0, // The maximum number of fraction digits to display.
});

// Split the operand into integer and decimal parts, format the integer part (with INTEGER_FORMATTER), and return the formatted operand.
function formatOperand(operand) {
  if (operand == null) return;
  const [integer, decimal] = operand.split(".");
  if (decimal == null) return INTEGER_FORMATTER.format(integer);
  return `${INTEGER_FORMATTER.format(integer)}.${decimal}`;
}

// The App component is the main component that renders the calculator.
function App() {
  // The useReducer hook is used to manage the state of the calculator.
  // State is an object that contains the current operand, previous operand, and operation.
  // Dispatch is a function that is used to dispatch actions to the reducer function.
  // The initial state of the calculator is an empty object.
  const [{ currentOperand, previousOperand, operation }, dispatch] = useReducer(
    reducer,
    {}
  );

  // The calculator-grid div contains the calculator display and buttons.
  return (
    <div className="calculator-grid">
      <div className="output">
        <div className="previous-operand">
          {formatOperand(previousOperand)} {operation}
        </div>
        <div className="current-operand">{formatOperand(currentOperand)}</div>
      </div>
      <button
        className="span-two"
        onClick={() => dispatch({ type: ACTIONS.CLEAR })}
      >
        AC
      </button>
      <button onClick={() => dispatch({ type: ACTIONS.DELETE_DIGIT })}>
        DEL
      </button>
      <OperationButton operation="÷" dispatch={dispatch} />
      <DigitButton digit="1" dispatch={dispatch} />
      <DigitButton digit="2" dispatch={dispatch} />
      <DigitButton digit="3" dispatch={dispatch} />
      <OperationButton operation="*" dispatch={dispatch} />
      <DigitButton digit="4" dispatch={dispatch} />
      <DigitButton digit="5" dispatch={dispatch} />
      <DigitButton digit="6" dispatch={dispatch} />
      <OperationButton operation="+" dispatch={dispatch} />
      <DigitButton digit="7" dispatch={dispatch} />
      <DigitButton digit="8" dispatch={dispatch} />
      <DigitButton digit="9" dispatch={dispatch} />
      <OperationButton operation="-" dispatch={dispatch} />
      <DigitButton digit="." dispatch={dispatch} />
      <DigitButton digit="0" dispatch={dispatch} />
      <button
        className="span-two"
        onClick={() => dispatch({ type: ACTIONS.EVALUATE })}
      >
        =
      </button>
    </div>
  );
}

export default App;
