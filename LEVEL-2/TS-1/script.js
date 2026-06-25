const screen = document.getElementById('screen');
const history = document.getElementById('history');
const keys = document.querySelector('.keys');

let expression = '';

function updateDisplay(value = expression){
    screen.textContent = value || '0';
}

function isOperator(value){
    return ['+','-','*','/','%'].includes(value);
}

function addValue(value){
    const last = expression.slice(-1);

    if(value === '.' && expression.split(/[+\-*/%]/).pop().includes('.')){
        return;
    }

    if(isOperator(value) && (expression === '' || isOperator(last))){
        expression = expression.slice(0,-1) + value;
    }else{
        expression += value;
    }

    updateDisplay();
}

function calculate(){
    if(!expression || isOperator(expression.slice(-1))){
        return;
    }

    try{
        const answer = Function(`"use strict"; return (${expression})`)();
        history.textContent = expression.replaceAll('*','x');
        expression = Number.isFinite(answer) ? String(Number(answer.toFixed(8))) : '';
        updateDisplay(expression || 'Error');
    }catch(error){
        expression = '';
        history.textContent = 'Invalid expression';
        updateDisplay('Error');
    }
}

keys.addEventListener('click', function(event){
    const button = event.target.closest('button');
    if(!button) return;

    const value = button.dataset.value;
    const action = button.dataset.action;

    if(value) addValue(value);
    if(action === 'clear'){
        expression = '';
        history.textContent = 'Ready';
        updateDisplay();
    }
    if(action === 'delete'){
        expression = expression.slice(0,-1);
        updateDisplay();
    }
    if(action === 'equals') calculate();
});
