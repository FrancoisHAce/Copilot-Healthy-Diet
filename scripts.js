document.getElementById("date").value = new Date().toLocaleDateString();
let dailyTotal = JSON.parse(localStorage.getItem('dailyTotal')) || {
    calories: 0,
    protein: 0,
    fat: 0,
    carbs: 0,
    sugar: 0
};
let records = JSON.parse(localStorage.getItem('records')) || [];
let historyRecords = JSON.parse(localStorage.getItem('historyRecords')) || [];
let targetValues = JSON.parse(localStorage.getItem('targetValues')) || {};

// 恢复记录
window.onload = function() {
    records.forEach(record => addIntakeListItem(record));
    updateCumulative();
    historyRecords.forEach(record => addHistoryListItem(record));
    restoreTargetValues();
};

function calculate() {
    const foodName = document.getElementById("foodName").value;
    const amount = parseFloat(document.getElementById("amount").value) || 0;
    const energy = parseFloat(document.getElementById("energy").value) || 0;
    const protein = parseFloat(document.getElementById("protein").value) || 0;
    const fat = parseFloat(document.getElementById("fat").value) || 0;
    const carbs = parseFloat(document.getElementById("carbs").value) || 0;
    const sugar = parseFloat(document.getElementById("sugar").value) || 0;
    const ratio = parseFloat(document.getElementById("ratio").value) || 1;
    const measure = document.getElementById("measure").value;

    let calories, proteinOutput, fatOutput, carbsOutput, sugarOutput;

    if (measure === "perServing") {
        calories = energy * 0.2389 * ratio;
        proteinOutput = protein * ratio;
        fatOutput = fat * ratio;
        carbsOutput = carbs * ratio;
        sugarOutput = sugar * ratio;
    } else {
        calories = energy * 0.2389 * amount * ratio / 100;
        proteinOutput = protein * amount * ratio / 100;
        fatOutput = fat * amount * ratio / 100;
        carbsOutput = carbs * amount * ratio / 100;
        sugarOutput = sugar * amount * ratio / 100;
    }

    document.getElementById("calories").value = calories.toFixed(2);
    document.getElementById("proteinOutput").value = proteinOutput.toFixed(2);
    document.getElementById("fatOutput").value = fatOutput.toFixed(2);
    document.getElementById("carbsOutput").value = carbsOutput.toFixed(2);
    document.getElementById("sugarOutput").value = sugarOutput.toFixed(2);
}

function includeRecord() {
    const foodName = document.getElementById("foodName").value;
    const calories = parseFloat(document.getElementById("calories").value);
    const proteinOutput = parseFloat(document.getElementById("proteinOutput").value);
    const fatOutput = parseFloat(document.getElementById("fatOutput").value);
    const carbsOutput = parseFloat(document.getElementById("carbsOutput").value);
    const sugarOutput = parseFloat(document.getElementById("sugarOutput").value);

    const record = {
        foodName: foodName,
        calories: calories,
        protein: proteinOutput,
        fat: fatOutput,
        carbs: carbsOutput,
        sugar: sugarOutput
    };

    addIntakeListItem(record);
    records.push(record);
    localStorage.setItem('records', JSON.stringify(records));

    dailyTotal.calories += calories;
    dailyTotal.protein += proteinOutput;
    dailyTotal.fat += fatOutput;
    dailyTotal.carbs += carbsOutput;
    dailyTotal.sugar += sugarOutput;
    localStorage.setItem('dailyTotal', JSON.stringify(dailyTotal));

    updateCumulative();
}

function addIntakeListItem(record) {
    const intakeList = document.getElementById("intakeList");
    const listItem = document.createElement("li");
    listItem.className = "list-group-item";
    const sugarText = record.sugar ? record.sugar.toFixed(2) + " g" : "糖量未知";
    listItem.textContent = `序号 ${intakeList.children.length + 1}: ${record.foodName} 热量 ${record.calories.toFixed(2)} kcal, 蛋白质 ${record.protein.toFixed(2)} g, 脂肪 ${record.fat.toFixed(2)} g, 碳水 ${record.carbs.toFixed(2)} g, 糖 ${sugarText}`;
    intakeList.appendChild(listItem);
}

function updateCumulative() {
    document.getElementById("totalCalories").textContent = dailyTotal.calories.toFixed(2);
    document.getElementById("totalProtein").textContent = dailyTotal.protein.toFixed(2);
    document.getElementById("totalFat").textContent = dailyTotal.fat.toFixed(2);
    document.getElementById("totalCarbs").textContent = dailyTotal.carbs.toFixed(2);
    document.getElementById("totalSugar").textContent = dailyTotal.sugar.toFixed(2);

    if (targetValues.calories) updateProgress("calories", dailyTotal.calories, targetValues.calories);
    if (targetValues.protein) updateProgress("protein", dailyTotal.protein, targetValues.protein);
    if (targetValues.fat) updateProgress("fat", dailyTotal.fat, targetValues.fat);
    if (targetValues.carbs) updateProgress("carbs", dailyTotal.carbs, targetValues.carbs);
}

function updateProgress(type, current, target) {
    const percentage = ((current / target) * 100).toFixed(2);
    const progressBar = document.getElementById(`${type}Progress`);
    const progressText = document.getElementById(`${type}ProgressText`);

    if (!progressBar) {
        return;
    }

    progressText.textContent = `${percentage}%`;

    if (percentage > 100) {
        progressBar.className = "progress-bar progress-bar-danger";
        progressText.className = "text-danger";
    } else if (percentage > 80) {
        progressBar.className = "progress-bar progress-bar-warning";
        progressText.className = "text-warning";
    } else {
        progressBar.className = "progress-bar";
        progressText.className = "";
    }

    progressBar.style.width = `${percentage}%`;
}

function showProgress() {
    const targetCalories = parseFloat(document.getElementById("targetCalories").value);
    const targetProtein = parseFloat(document.getElementById("targetProtein").value);
    const targetFat = parseFloat(document.getElementById("targetFat").value);
    const targetCarbs = parseFloat(document.getElementById("targetCarbs").value);

    targetValues = { calories: targetCalories, protein: targetProtein, fat: targetFat, carbs: targetCarbs };
    localStorage.setItem('targetValues', JSON.stringify(targetValues));

    document.getElementById("progressSection").style.display = "block";
    updateCumulative();
}

function restoreTargetValues() {
    if (targetValues.calories) document.getElementById("targetCalories").value = targetValues.calories;
    if (targetValues.protein) document.getElementById("targetProtein").value = targetValues.protein;
    if (targetValues.fat) document.getElementById("targetFat").value = targetValues.fat;
    if (targetValues.carbs) document.getElementById("targetCarbs").value = targetValues.carbs;

    if (Object.keys(targetValues).length > 0) {
        document.getElementById("progressSection").style.display = "block";
        updateCumulative();
    }
}

function confirmDelete() {
    if (confirm("是否确认删除上一条记录？")) {
        deleteLastRecord();
    }
}

function confirmClear() {
    if (confirm("是否确认清空所有记录？")) {
        clearRecords();
    }
}

function deleteLastRecord() {
    const intakeList = document.getElementById("intakeList");
    if (records.length > 0) {
        const lastRecord = records.pop();
        dailyTotal.calories -= lastRecord.calories;
        dailyTotal.protein -= lastRecord.protein;
        dailyTotal.fat -= lastRecord.fat;
        dailyTotal.carbs -= lastRecord.carbs;
        dailyTotal.sugar -= lastRecord.sugar;

        intakeList.removeChild(intakeList.lastChild);
        updateCumulative();

        localStorage.setItem('records', JSON.stringify(records));
        localStorage.setItem('dailyTotal', JSON.stringify(dailyTotal));
    }
}

function clearRecords() {
    const intakeList = document.getElementById("intakeList");
    intakeList.innerHTML = '';
    records = [];
    dailyTotal = {calories: 0, protein: 0, fat: 0, carbs: 0, sugar: 0};
    updateCumulative();

    localStorage.setItem('records', JSON.stringify(records));
    localStorage.setItem('dailyTotal', JSON.stringify(dailyTotal));
}

function addHistoryListItem(record) {
    const historyList = document.getElementById("historyList");
    const historyItem = document.createElement("li");
    historyItem.className = "list-group-item";
    historyItem.textContent = record;
    historyList.appendChild(historyItem);
}

function addDailyRecord() {
    const today = new Date().toLocaleDateString();
    const record = `${today}, 摄入总热量: ${dailyTotal.calories.toFixed(2)} kcal，占目标 ${((dailyTotal.calories / targetValues.calories) * 100).toFixed(2)}%，总蛋白质: ${dailyTotal.protein.toFixed(2)} g，占目标 ${((dailyTotal.protein / targetValues.protein) * 100).toFixed(2)}%，总脂肪: ${dailyTotal.fat.toFixed(2)} g，占目标 ${((dailyTotal.fat / targetValues.fat) * 100).toFixed(2)}%，总碳水: ${dailyTotal.carbs.toFixed(2)} g，占目标 ${((dailyTotal.carbs / targetValues.carbs) * 100).toFixed(2)}%，已知总糖: ${dailyTotal.sugar.toFixed(2)} g`;

    historyRecords.push(record);
    localStorage.setItem('historyRecords', JSON.stringify(historyRecords));
    addHistoryListItem(record);
}

function confirmUndoDailyRecord() {
    if (confirm("是否确认撤销上一条日记录？")) {
        undoDailyRecord();
    }
}

function undoDailyRecord() {
    if (historyRecords.length > 0) {
        historyRecords.pop();
        localStorage.setItem('historyRecords', JSON.stringify(historyRecords));
        const historyList = document.getElementById("historyList");
        historyList.removeChild(historyList.lastChild);
    }
}
