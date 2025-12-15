// A. ส่วนเครื่องคิดเลขพื้นฐาน
// ==========================================================

// 1. ดึงองค์ประกอบจาก HTML
const display = document.getElementById('display');
const buttons = document.querySelectorAll('.buttons .btn');
const equalButton = document.getElementById('equal');
const clearButton = document.getElementById('clear');

let currentExpression = '';
let isResultDisplayed = false; // Flag เพื่อติดตามว่าผลลัพธ์เพิ่งถูกแสดงหรือไม่

// ฟังก์ชันอัปเดตช่องแสดงผล
function updateDisplay(value) {
    if (value === '') {
        display.value = '0';
    } else {
        display.value = value;
    }
}

// Event Listener หลักสำหรับปุ่มทั้งหมด
buttons.forEach(button => {
    button.addEventListener('click', () => {
        const value = button.value;
        
        // กรองปุ่ม '=' และ 'C' เพราะมี Listener แยก
        if (value === '=' || value === 'C') {
            return;
        }

        // หากผลลัพธ์เพิ่งแสดง และปุ่มที่กดไม่ใช่ Operator ให้เริ่มนิพจน์ใหม่
        if (isResultDisplayed && !button.classList.contains('operator')) {
            currentExpression = value;
            isResultDisplayed = false;
        } else {
            // ป้องกัน Operator ซ้ำซ้อนหลัง Operator อื่น
            const lastChar = currentExpression.slice(-1);
            if (button.classList.contains('operator') && ['+', '-', '*', '/'].includes(lastChar)) {
                // แทนที่ Operator ตัวเก่าด้วย Operator ตัวใหม่
                currentExpression = currentExpression.slice(0, -1) + value;
            } else {
                currentExpression += value;
            }
            isResultDisplayed = false;
        }
        
        updateDisplay(currentExpression);
    });
});

// Event Listener สำหรับปุ่ม 'C'
clearButton.addEventListener('click', () => {
    currentExpression = '';
    isResultDisplayed = false;
    updateDisplay('');
});

// Event Listener สำหรับปุ่ม '='
equalButton.addEventListener('click', () => {
    try {
        if (currentExpression === '') return; 

        // 1. แทนที่สัญลักษณ์และเตรียมคำนวณ
        let expressionToEvaluate = currentExpression.replace(/×/g, '*').replace(/÷/g, '/');
        
        // 2. ป้องกันนิพจน์จบด้วย Operator (เช่น '5+')
        const lastChar = expressionToEvaluate.slice(-1);
        if (['+', '-', '*', '/'].includes(lastChar)) {
            expressionToEvaluate = expressionToEvaluate.slice(0, -1);
        }
        
        // 3. คำนวณ
        let result = eval(expressionToEvaluate); 

        // 4. จัดการทศนิยมและการแสดงผล
        if (typeof result === 'number' && !Number.isFinite(result)) {
            updateDisplay('Error');
        } else if (typeof result === 'number' && result % 1 !== 0) {
             result = parseFloat(result.toFixed(10));
        }

        updateDisplay(result);
        currentExpression = String(result);
        isResultDisplayed = true;
    } catch (error) {
        // แสดงข้อความ Error และรีเซ็ต
        updateDisplay('Syntax Error');
        currentExpression = '';
        isResultDisplayed = true;
    }
});

// ==========================================================
// B. ฟังก์ชันวิเคราะห์ตัวเลข (แยกตัวประกอบ / แปลงฐาน)
// ==========================================================

// --- 1. การแยกตัวประกอบเฉพาะ (Prime Factorization) ---

function primeFactorization(n) {
    if (n <= 1 || !Number.isInteger(n)) {
        return "โปรดใส่จำนวนเต็มบวกที่มากกว่า 1";
    }

    let factors = new Map();
    let tempN = n;

    while (tempN % 2 === 0) {
        factors.set(2, (factors.get(2) || 0) + 1);
        tempN /= 2;
    }

    let d = 3;
    while (d * d <= tempN) {
        while (tempN % d === 0) {
            factors.set(d, (factors.get(d) || 0) + 1);
            tempN /= d;
        }
        d += 2;
    }

    if (tempN > 1) {
        factors.set(tempN, (factors.get(tempN) || 0) + 1);
    }
    
    let parts = [];
    for (let [base, exponent] of factors.entries()) {
        if (exponent === 1) {
            parts.push(`${base}`);
        } else {
            parts.push(`${base}^${exponent}`);
        }
    }
    return parts.join(' × ');
}

// เชื่อมโยงปุ่ม 'analyze-prime'
document.getElementById('analyze-prime').addEventListener('click', () => {
    const inputVal = parseInt(document.getElementById('prime-input').value);
    const resultSpan = document.getElementById('prime-result');

    if (isNaN(inputVal) || inputVal <= 1) {
        resultSpan.textContent = "โปรดใส่จำนวนเต็มบวกที่มากกว่า 1";
        return;
    }
    
    resultSpan.textContent = primeFactorization(inputVal);
});

// --- 2. การแปลงฐานตัวเลข (Base Conversion) ---

function convertBase(decimalNumber, newBase) {
    if (newBase < 2 || newBase > 36) {
        return "ฐานต้องอยู่ระหว่าง 2 ถึง 36";
    }
    if (!Number.isInteger(decimalNumber) || decimalNumber < 0) {
        return "ต้องเป็นจำนวนเต็มที่ไม่ติดลบ";
    }
    
    return decimalNumber.toString(newBase).toUpperCase();
}

// เชื่อมโยงปุ่ม 'convert-base'
document.getElementById('convert-base').addEventListener('click', () => {
    const decInput = parseInt(document.getElementById('base-dec-input').value);
    const baseInput = parseInt(document.getElementById('base-n-input').value);
    const resultSpan = document.getElementById('base-result');

    if (isNaN(decInput) || isNaN(baseInput)) {
        resultSpan.textContent = "โปรดใส่ข้อมูลให้ครบถ้วน";
        return;
    }

    if (baseInput < 2 || baseInput > 36) {
        resultSpan.textContent = "ฐานต้องอยู่ระหว่าง 2 ถึง 36";
        return;
    }

    resultSpan.textContent = convertBase(decInput, baseInput);
});