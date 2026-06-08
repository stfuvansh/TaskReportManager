let prev = document.getElementById("prev")
let next = document.getElementById("next")
let month_year = document.querySelector(".month-year")
let ownersList = document.getElementById("ownersList")
let ownerInput = document.getElementById("ownerInput")
let addOwner = document.getElementById("addOwner")
let addTaskID = document.getElementById("addTaskID")
let owners = document.getElementById("owners")
let taskDescription = document.getElementById("taskDescription")
let dateTimeInput = document.getElementById("dateTimeInput")
let status = document.getElementById("status")
let completionTimeInput = document.getElementById("completionTimeInput")
let dependency = document.getElementById("dependency")
let hrsLogged = document.getElementById("hrsLogged")
let clearBtn = document.getElementById("clearBtn")
let addTask = document.getElementById("addTask")
let totalCount = document.getElementById("totalCount")
let completedCount = document.getElementById("completedCount")
let inProgressCount = document.getElementById("inProgressCount")
let pendingCount = document.getElementById("pendingCount")
let notStartedCount = document.getElementById("notStartedCount")
let totalHrs = document.getElementById("totalHrs")
let GenerateReport = document.getElementById("GenerateReport")
let tableBody = document.getElementById("tableBody")

let currentDate = new Date()
let tasks = []
let ownerNames = []

function getCurrentMonthKey() {
    let year = currentDate.getFullYear()
    let month = currentDate.getMonth() + 1
    return `${year}-${String(month).padStart(2, '0')}`
}

function updateMonthLabel() {
    let mmyy = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric'})
    month_year.textContent = mmyy
}

function saveData() {
    let key = getCurrentMonthKey()
    let data = {
        tasks: tasks,
        ownerNames: ownerNames
    }
    localStorage.setItem(key, JSON.stringify(data))
}

function loadData() {
    let key = getCurrentMonthKey()
    let stored = localStorage.getItem(key)
    if (stored) {
        let data = JSON.parse(stored)
        tasks = data.tasks
        ownerNames = data.ownerNames
    } else {
        tasks = []
        ownerNames = []
    }
}

function renderOwners() {
    ownersList.innerHTML = ""
    owners.innerHTML = ""
    ownerNames.forEach(function(name) {
        let tag = document.createElement("div")
        tag.className = "owner-tag"
        tag.innerHTML = `${name} <span>×</span>`
        ownersList.appendChild(tag)

        tag.querySelector("span").addEventListener("click", function() {
            let index = ownerNames.indexOf(name)
            ownerNames.splice(index, 1)
            saveData()
            renderOwners()
        })

        let option = document.createElement("option")
        option.value = name
        option.textContent = name
        owners.appendChild(option)
    })
}

function addOwnerName() {
    let owner = ownerInput.value.trim()
    if (owner === "") return
    ownerNames.push(owner)
    ownerInput.value = ""
    saveData()
    renderOwners()
}

addOwner.addEventListener("click", addOwnerName)

function addTaskItem() {
    let taskID = addTaskID.value.trim()
    let owner = owners.value
    let description = taskDescription.value.trim()
    let assignedDate = dateTimeInput.value
    let taskStatus = status.value
    let completionDate = completionTimeInput.value
    let dep = dependency.value.trim()
    let hrs = hrsLogged.value

    if (taskID === "" || description === "") return
    let task = {
        taskID: taskID,
        owner: owner,
        description: description,
        assignedDate: assignedDate,
        taskStatus: taskStatus,
        completionDate: completionDate,
        dep: dep,
        hrs: hrs
    }
    tasks.push(task)
    saveData()
    renderTable()
    updateSummary()
    
    addTaskID.value = ""
    owners.value = ""
    taskDescription.value = ""
    dateTimeInput.value = ""
    status.value = "Completed"
    completionTimeInput.value = ""
    dependency.value = ""
    hrsLogged.value = ""
}

addTask.addEventListener("click", addTaskItem)

function renderTable() {
    tableBody.innerHTML = ""
    tasks.forEach(function(task, index) {
        let tr = document.createElement("tr")
        tr.innerHTML = `
            <td>${task.taskID}</td>
            <td>${task.description}</td>
            <td>${task.owner}</td>
            <td>${task.assignedDate}</td>
            <td>${task.taskStatus}</td>
            <td>${task.completionDate || "-"}</td>
            <td>${task.dep || "-"}</td>
            <td>${task.hrs || "-"}</td>
            <td><button onclick="deleteTask(${index})">✕</button></td>
        `
        tableBody.appendChild(tr)
    })
}

function updateSummary() {
    let total = tasks.length
    let completed = tasks.filter(function(task) { return task.taskStatus === "Completed" }).length
    let inProgress = tasks.filter(function(task) { return task.taskStatus === "In Progress" }).length
    let pending = tasks.filter(function(task) { return task.taskStatus === "Pending" }).length
    let notStarted = tasks.filter(function(task) { return task.taskStatus === "Not Started" }).length
    let hrs = tasks.reduce(function(sum, task) { return sum + (Number(task.hrs) || 0) }, 0)

    totalCount.textContent = total
    completedCount.textContent = completed
    inProgressCount.textContent = inProgress
    pendingCount.textContent = pending
    notStartedCount.textContent = notStarted
    totalHrs.textContent = hrs
}

function deleteTask(index) {
    tasks.splice(index, 1)
    saveData()
    renderTable()
    updateSummary()
}

clearBtn.addEventListener("click", function(){
    addTaskID.value = ""
    owners.value = ""
    taskDescription.value = ""
    dateTimeInput.value = ""
    status.value = "Completed"
    completionTimeInput.value = ""
    dependency.value = ""
    hrsLogged.value = ""
})

prev.addEventListener("click", function() {
    currentDate.setMonth(currentDate.getMonth() - 1)
    loadData()
    renderTable()
    renderOwners()
    updateSummary()
    updateMonthLabel()
})

next.addEventListener("click", function() {
    currentDate.setMonth(currentDate.getMonth() + 1)
    loadData()
    renderTable()
    renderOwners()
    updateSummary()
    updateMonthLabel()
})

loadData()
renderOwners()
renderTable()
updateSummary()
updateMonthLabel()

GenerateReport.addEventListener("click", function() {
    const { Document, Paragraph, Table, TableRow, TableCell, TextRun, WidthType, AlignmentType, BorderStyle, Packer, ShadingType } = docx

    const borderStyle = {
        top: { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" },
        bottom: { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" },
        left: { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" },
        right: { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" },
    }

    const headerCellStyle = {
        borders: borderStyle,
        shading: { fill: "F2F2F2", type: ShadingType.CLEAR }
    }

    const summaryCellStyle = {
        borders: borderStyle,
        shading: { fill: "FFF3E0", type: ShadingType.CLEAR }
    }

    function makeCell(text, bold = false, style = {}) {
        return new TableCell({
            ...style,
            children: [new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [new TextRun({ text: String(text), bold, size: 20, font: "Calibri" })]
            })]
        })
    }

    const summaryRow = new TableRow({
        children: [
            makeCell(`${tasks.length} Total Tasks`, true, summaryCellStyle),
            makeCell(`${tasks.filter(t => t.taskStatus === "Completed").length} Completed`, true, summaryCellStyle),
            makeCell(`${tasks.filter(t => t.taskStatus === "In Progress").length} In Progress`, true, summaryCellStyle),
            makeCell(`${tasks.filter(t => t.taskStatus === "Pending").length} Pending`, true, summaryCellStyle),
            makeCell(`${tasks.filter(t => t.taskStatus === "Not Started").length} Not Started`, true, summaryCellStyle),
            makeCell(`${tasks.reduce((sum, t) => sum + (Number(t.hrs) || 0), 0)} Total Hrs`, true, summaryCellStyle),
        ]
    })

    const headerRow = new TableRow({
        children: ["Task ID", "Task Description", "Owner", "Assigned Date", "Status", "Completion Date", "Dependency", "Hrs Logged"]
            .map(text => makeCell(text, true, headerCellStyle))
    })

    const dataRows = tasks.map(function(task) {
        return new TableRow({
            children: [
                makeCell(task.taskID, true, { borders: borderStyle }),
                makeCell(task.description, false, { borders: borderStyle }),
                makeCell(task.owner || "-", false, { borders: borderStyle }),
                makeCell(task.assignedDate || "-", false, { borders: borderStyle }),
                makeCell(task.taskStatus, true, { borders: borderStyle }),
                makeCell(task.completionDate || "-", false, { borders: borderStyle }),
                makeCell(task.dep || "-", false, { borders: borderStyle }),
                makeCell(task.hrs || "-", true, { borders: borderStyle }),
            ]
        })
    })

    const doc = new Document({
        sections: [{
            properties: {
                page: { margin: { top: 720, bottom: 720, left: 900, right: 900 } }
            },
            children: [
                new Paragraph({
                    children: [
                        new TextRun({ text: "PROJECT TASK REPORT", bold: true, size: 28, font: "Calibri", color: "1a1a2e" }),
                        new TextRun({ text: `   |   Generated: ${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`, size: 20, font: "Calibri", color: "888888" })
                    ]
                }),
                new Paragraph({ text: "" }),
                new Paragraph({
                    children: [new TextRun({ text: "Task Management Report", bold: true, size: 36, font: "Calibri", color: "1a1a2e" })]
                }),
                new Paragraph({ text: "" }),
                new Paragraph({
                    children: [new TextRun({ text: "This report provides a consolidated view of all project tasks, their current status, assigned owners, and logged hours.", size: 20, font: "Calibri", color: "444444" })]
                }),
                new Paragraph({ text: "" }),
                new Paragraph({
                    children: [new TextRun({ text: "Summary Overview", bold: true, size: 24, font: "Calibri", color: "1a1a2e" })]
                }),
                new Paragraph({ text: "" }),
                new Table({
                    width: { size: 100, type: WidthType.PERCENTAGE },
                    rows: [summaryRow]
                }),
                new Paragraph({ text: "" }),
                new Paragraph({
                    children: [new TextRun({ text: "Task Details", bold: true, size: 24, font: "Calibri", color: "1a1a2e" })]
                }),
                new Paragraph({ text: "" }),
                new Table({
                    width: { size: 100, type: WidthType.PERCENTAGE },
                    rows: [headerRow, ...dataRows]
                }),
                new Paragraph({ text: "" }),
                new Paragraph({
                    children: [
                        new TextRun({ text: "Notes: ", bold: true, size: 18, font: "Calibri" }),
                        new TextRun({ text: "Pending and Not Started tasks require follow-up. Hours logged reflect actuals as of the report date. Dependencies must be resolved before downstream tasks can begin.", size: 18, font: "Calibri", color: "444444" })
                    ]
                }),
                new Paragraph({ text: "" }),
                new Paragraph({
                    alignment: AlignmentType.CENTER,
                    children: [new TextRun({ text: "Confidential — Internal Use Only", italics: true, size: 18, font: "Calibri", color: "888888" })]
                }),
            ]
        }]
    })

    Packer.toBlob(doc).then(function(blob) {
        const url = URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `Task_Report_${getCurrentMonthKey()}.docx`
        a.click()
        URL.revokeObjectURL(url)
    })
})

