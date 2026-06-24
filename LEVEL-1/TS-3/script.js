const form = document.getElementById('converterForm');
const temperatureInput = document.getElementById('temperature');
const fromUnit = document.getElementById('fromUnit');
const toUnit = document.getElementById('toUnit');
const result = document.getElementById('result');
const formula = document.getElementById('formula');
const message = document.getElementById('message');

const unitLabels = {
    celsius:'C',
    fahrenheit:'F',
    kelvin:'K'
};

function toCelsius(value, unit){
    if(unit === 'fahrenheit'){
        return (value - 32) * 5 / 9;
    }

    if(unit === 'kelvin'){
        return value - 273.15;
    }

    return value;
}

function fromCelsius(value, unit){
    if(unit === 'fahrenheit'){
        return (value * 9 / 5) + 32;
    }

    if(unit === 'kelvin'){
        return value + 273.15;
    }

    return value;
}

function convertTemperature(value, sourceUnit, targetUnit){
    const celsius = toCelsius(value, sourceUnit);
    return fromCelsius(celsius, targetUnit);
}

function formatNumber(value){
    return Number.parseFloat(value.toFixed(2)).toString();
}

form.addEventListener('submit', function(event){
    event.preventDefault();

    const value = Number(temperatureInput.value);
    const sourceUnit = fromUnit.value;
    const targetUnit = toUnit.value;

    message.textContent = '';

    if(temperatureInput.value.trim() === '' || Number.isNaN(value)){
        result.textContent = '--';
        formula.textContent = 'Please enter a valid number.';
        message.textContent = 'Temperature must be a valid number.';
        return;
    }

    if(sourceUnit === 'kelvin' && value < 0){
        result.textContent = '--';
        formula.textContent = 'Kelvin cannot be below absolute zero.';
        message.textContent = 'Kelvin value cannot be negative.';
        return;
    }

    const convertedValue = convertTemperature(value, sourceUnit, targetUnit);
    const formattedInput = formatNumber(value);
    const formattedResult = formatNumber(convertedValue);

    result.textContent = `${formattedResult} deg ${unitLabels[targetUnit]}`;
    formula.textContent = `${formattedInput} deg ${unitLabels[sourceUnit]} equals ${formattedResult} deg ${unitLabels[targetUnit]}.`;
});
