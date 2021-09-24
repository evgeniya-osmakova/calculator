import { uniqueId } from 'lodash';
import './App.css';
import { useState } from 'react';

const operatorsMapping = {
  '+': { priority: 1, calc: (a, b) => a + b },
  '-': { priority: 1, calc: (a, b) => a - b },
  '*': { priority: 2, calc: (a, b) => a * b },
  '/': { priority: 2, calc: (a, b) => a / b },
};

const Types = {
  Number: "number" ,
  Operator: "operator" ,
  LeftBracket: "left bracket" ,
  RightBracket: "right bracket",
};

const errorText = 'Введите только корректные символы (цифрры, пробелы, символы: . , ( ) / + - )'

function App() {
  const [value, setValue] = useState('');
  const [history, setHistory] = useState([]);
  const [error, setError] = useState(null);

  const onInputChange = (e) => {
    setValue(e.target.value)
  }

  const onDeleteClick = (deleteId) => {
    const newHistory = history.filter(({ id }) => id !== deleteId);
    setHistory(newHistory);
  }

  const onCalcClick = () => {
    setError('')

    if (!value) {
      return;
    }

    let incorrectInput

    if (Object.keys(operatorsMapping).includes(value)) {
      setError(errorText)
      incorrectInput = true
    }

    if (incorrectInput) {
      return
    }

    let stack = [];

    let tokenCodes = value.replace(/\s+/g, "")
      .replace(/(?<=\d+),(?=\d+)/g, ".")
      .replace(/^\-/g, "0-")
      .replace(/\(\-/g, "(0-")
      .replace(new RegExp ('[\\+\\-\\*\\/\\^\\(\\)\\;]', "g"), "&$&&")
      .split("&")
      .filter(item => item !== "");

    tokenCodes.forEach((tokenCode) => {
      if ( tokenCode in operatorsMapping ) {
        stack.push({type: Types.Operator, tokenCode});
      }
      else if ( tokenCode === "(" ) {
        stack.push ( { type: Types.LeftBracket, tokenCode } );
      }
      else if ( tokenCode === ")" )
        stack.push ( { type: Types.RightBracket, tokenCode } );
      else if ( tokenCode.match(/^\d+$/g) !== null ) {
        stack.push({type: Types.Number, tokenCode: Number(tokenCode)});
      }
      else {
        setError(errorText)
        incorrectInput = true
      }
    });

    if (incorrectInput) {
      return
    }

    let operators = [];
    let operands = [];

    const calcExpression = (minPriority) => {
      while ( operators.length && (operators[operators.length-1].priority ) >= minPriority) {
        let rightOperand = operands.pop().tokenCode;
        let leftOperand = operands.pop().tokenCode;
        let operator = operators.pop();
        let result = operator.calc(leftOperand, rightOperand);
        if ( isNaN(result) || !isFinite(result) ) {
          result = 0;
        }
        operands.push({ type: Types.Number, tokenCode: result });
      }
    }

    stack.forEach( (token) => {
      switch(token.type) {
        case Types.Number :
          operands.push(token);
          break;
        case Types.Operator :
          calcExpression(operatorsMapping[token.tokenCode].priority);
          operators.push({ ...token, ...operatorsMapping[token.tokenCode] });
          break;
        case Types.LeftBracket :
          operators.push(token);
          break;
        case Types.RightBracket :
          calcExpression(1);
          operators.pop();
          break;
      }
    });

    calcExpression(0);
    const calculationResult = operands.pop().tokenCode;
    const newHistory = [...history, { id: uniqueId(), input: value, result: `= ${calculationResult}`}]
    setHistory(newHistory)
    setValue('')
  }

  return (
    <div className="App">
      <div className="calculating-area">
        <input type="text" className="calculating-area__input" name="data" value={value} onChange={onInputChange} placeholder='Введите выражение...' />
        <button type="submit" className="calculating-area__btn" onClick={onCalcClick}>Посчитать</button>
      </div>
      <div className="error">{error}</div>
      {history.map(({ id, input, result }) => (
        <div key={id} className="historyItem">
          <div className="historyItem__data">
            <div className="historyItem__input">{input}</div>
            <div className="historyItem__result">{result}</div>
          </div>
          <button className="historyItem__btn" onClick={() => onDeleteClick(id)}>Удалить</button>
        </div>
      ))}
    </div>
  );
}

export default App;
