// 定義所有課程
const allCourses = [
    "微積分(上)",
    "普通物理",
    "普通化學",
    "醫工物理",
    "微積分(下)",
    "電路學",
    "電子學(一)",
    "電子實驗(一)",
    "普通生物學",
    "解剖生理學(一)",
    "解剖生理學(二)",
    "有機化學",
    "訊號與系統",
    "程式語言",
    "普通物理實驗",
    "普通化學實驗",
    "工程數學(一)",
    "工程數學(二)",
    "電子實驗(二)",
    "生物化學",
    "解剖生理學實驗(一)",
    "解剖生理學實驗(二)",
    "生物材料",
    "生物輸送原理",
    "生醫訊號處理",
    "生醫感測模組整合應用"
];

// 定義擋修規則
const blockingRules = {
    "微積分(下)": {
        prerequisites: ["微積分(上)"],
        type: "taken" // 更改為"taken"表示"曾修"
    },
    "普通物理實驗": {
        prerequisites: ["普通物理"],
        type: "concurrent"
    },
    "普通化學實驗": {
        prerequisites: ["普通化學"],
        type: "concurrent"
    },
    "有機化學": {
        prerequisites: ["普通化學"],
        type: "taken"
    },
    "電路學": {
        prerequisites: ["醫工物理"],
        type: "taken"
    },
    "工程數學(一)": {
        prerequisites: ["微積分(下)"],
        type: "taken"
    },
    "工程數學(二)": {
        prerequisites: ["微積分(下)"],
        type: "taken"
    },
    "電子實驗(一)": {
        prerequisites: ["電路學"],
        type: "concurrent"
    },
    "電子實驗(二)": {
        prerequisites: ["電子學(一)", "電子實驗(一)"],
        type: "mixed",
        concurrentCourses: ["電子學(一)"],
        takenCourses: ["電子實驗(一)"]
    },
    "生物化學": {
        prerequisites: ["普通化學"],
        type: "taken"
    },
    "解剖生理學(一)": {
        prerequisites: ["普通生物學"],
        type: "taken"
    },
    "解剖生理學(二)": {
        prerequisites: ["解剖生理學(一)"],
        type: "taken"
    },
    "解剖生理學實驗(一)": {
        prerequisites: ["解剖生理學(一)"],
        type: "concurrent"
    },
    "解剖生理學實驗(二)": {
        prerequisites: ["解剖生理學(二)"],
        type: "concurrent"
    },
    "生物材料": {
        prerequisites: ["有機化學"],
        type: "taken"
    },
    "生物輸送原理": {
        prerequisites: ["普通物理", "微積分(上)"],
        type: "taken"
    },
    "生醫訊號處理": {
        prerequisites: ["訊號與系統"],
        type: "taken"
    },
    "生醫感測模組整合應用": {
        prerequisites: ["程式語言"],
        type: "taken"
    }
};

// 檢查課程是否被擋修
function checkCourseBlocking(course, courseStatuses, rules) {
    const rule = rules[course];
    if (!rule) return null;

    const courseStatus = courseStatuses.get(course);
    
    switch (rule.type) {
        case "taken": // 更改"taken"的判斷邏輯
            const missingTaken = rule.prerequisites.filter(prereq => {
                const prereqStatus = courseStatuses.get(prereq);
                // 只要不是"not_taken"就算是曾修過
                return prereqStatus === "not_taken";
            });
            if (missingTaken.length > 0) {
                return `需要曾修：${missingTaken.join('、')}`;
            }
            break;
            
        case "concurrent":
            const concurrentMissing = rule.prerequisites.filter(prereq => 
                courseStatuses.get(prereq) === "not_taken"
            );
            if (courseStatus !== "not_taken" && concurrentMissing.length > 0) {
                return `不得先修於：${rule.prerequisites.join('、')}`;
            }
            break;

        case "mixed":
            const missingTakenCourses = rule.takenCourses.filter(prereq => {
                const prereqStatus = courseStatuses.get(prereq);
                // 同樣更新"曾修"的判斷邏輯
                return prereqStatus === "not_taken";
            });
            
            const missingConcurrent = rule.concurrentCourses.filter(prereq => 
                courseStatuses.get(prereq) === "not_taken"
            );
            
            if (courseStatus !== "not_taken") {
                if (missingConcurrent.length > 0) {
                    return `不得先修於：${rule.concurrentCourses.join('、')}`;
                }
            }
            
            if (missingTakenCourses.length > 0) {
                return `需要曾修：${missingTakenCourses.join('、')}`;
            }
            break;
    }
    return null;
}

// 初始化頁面和更新顏色的函數保持不變
function initializePage() {
    const courseList = document.getElementById('courseList');
    
    allCourses.forEach(course => {
        const courseItem = document.createElement('div');
        courseItem.className = 'course-item status-not-taken';
        
        const select = document.createElement('select');
        select.id = course;
        
        select.addEventListener('change', function(e) {
            updateCourseColor(e);
            updateBlockedCourses();
        });
        
        const options = [
            { value: "not_taken", text: "未修過" },
            { value: "failed", text: "曾修" },
            { value: "passed", text: "修過" }
        ];
        
        options.forEach(option => {
            const optionElement = document.createElement('option');
            optionElement.value = option.value;
            optionElement.textContent = option.text;
            select.appendChild(optionElement);
        });
        
        const label = document.createElement('label');
        label.htmlFor = course;
        label.textContent = course;
        
        courseItem.appendChild(select);
        courseItem.appendChild(label);
        courseList.appendChild(courseItem);
    });
}

function updateCourseColor(event) {
    const select = event.target;
    const courseItem = select.parentElement;
    
    courseItem.classList.remove('status-not-taken', 'status-failed', 'status-passed');
    
    switch(select.value) {
        case 'not_taken':
            courseItem.classList.add('status-not-taken');
            break;
        case 'failed':
            courseItem.classList.add('status-failed');
            break;
        case 'passed':
            courseItem.classList.add('status-passed');
            break;
    }
}

// 更新擋修課程列表
function updateBlockedCourses() {
    const courseStatuses = new Map(
        Array.from(document.querySelectorAll('select'))
            .map(select => [select.id, select.value])
    );

    const resultArea = document.getElementById('resultArea');
    const blockedResults = new Map();

    allCourses.forEach(course => {
        const blockingMessage = checkCourseBlocking(course, courseStatuses, blockingRules);
        if (blockingMessage) {
            blockedResults.set(course, blockingMessage);
        }
    });

    let resultHTML = '';
    if (blockedResults.size > 0) {
        resultHTML += '<h2 class="section-title">目前被擋修的課程：</h2>';
        blockedResults.forEach((message, course) => {
            resultHTML += `
                <div class="blocked-course">
                    <strong>${course}</strong><br>
                    ${message}
                </div>
            `;
        });
    } else {
        resultHTML += `
            <div class="success-message">
                <strong>恭喜！</strong><br>
                根據您目前的課程狀態，沒有被擋修的課程。
            </div>
        `;
    }

    resultArea.innerHTML = resultHTML;
}

document.addEventListener('DOMContentLoaded', initializePage);