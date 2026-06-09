let prev = document.getElementById("prev")
let next = document.getElementById("next")
let month_year = document.querySelector(".month-year")
let ownersList = document.getElementById("ownersList")
let ownerInput = document.getElementById("ownerInput")
let addOwner = document.getElementById("addOwner")
let owners = document.getElementById("owners")
let totalCount = document.getElementById("totalCount")
let completedCount = document.getElementById("completedCount")
let inProgressCount = document.getElementById("inProgressCount")
let pendingCount = document.getElementById("pendingCount")
let notStartedCount = document.getElementById("notStartedCount")
let totalHrs = document.getElementById("totalHrs")
let GenerateReport = document.getElementById("GenerateReport")
let tableBody = document.getElementById("tableBody")

const TOTAL_ROWS = 100

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
    let data = { tasks: tasks, ownerNames: ownerNames }
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
        tasks = Array.from({ length: TOTAL_ROWS }, () => ({
            taskID: "", owner: "", description: "", assignedDate: "",
            taskStatus: "Not Started", completionDate: "", dep: "", hrs: ""
        }))
        ownerNames = []
    }
    if (tasks.length < TOTAL_ROWS) {
        let extra = Array.from({ length: TOTAL_ROWS - tasks.length }, () => ({
            taskID: "", owner: "", description: "", assignedDate: "",
            taskStatus: "Not Started", completionDate: "", dep: "", hrs: ""
        }))
        tasks = [...tasks, ...extra]
    }
}

function renderOwners() {
    ownersList.innerHTML = ""
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

function renderTable() {
    tableBody.innerHTML = ""
    tasks.forEach(function(task, index) {
        let tr = document.createElement("tr")
        tr.innerHTML = `
            <td contenteditable="true">${task.taskID}</td>
            <td contenteditable="true">${task.description}</td>
            <td>
            <select onchange="updateOwner(${index}, this.value)">
            <option value="">-- Select --</option>
            ${ownerNames.map(name => `<option ${task.owner === name ? 'selected' : ''} value="${name}">${name}</option>`).join("")}
            </select>
            </td>
            <td><input type="datetime-local" value="${task.assignedDate}" onchange="updateAssignedDate(${index}, this.value)"></td>
            <td>
                <select onchange="updateStatus(${index}, this.value)">
                    <option ${task.taskStatus === 'Not Started' ? 'selected' : ''}>Not Started</option>
                    <option ${task.taskStatus === 'In Progress' ? 'selected' : ''}>In Progress</option>
                    <option ${task.taskStatus === 'Pending' ? 'selected' : ''}>Pending</option>
                    <option ${task.taskStatus === 'Completed' ? 'selected' : ''}>Completed</option>
                </select>
            </td>
            <td><input type="datetime-local" value="${task.completionDate}" onchange="updateCompletionDate(${index}, this.value)"></td>
            <td contenteditable="true">${task.dep}</td>
            <td contenteditable="true">${task.hrs}</td>
            <td><button onclick="deleteRow(${index})">✕</button></td>
        `
        tableBody.appendChild(tr)
        let cells = tr.querySelectorAll("td[contenteditable]")
        cells[0].addEventListener("blur", function() { tasks[index].taskID = cells[0].innerText.trim(); saveData(); updateSummary() })
        cells[1].addEventListener("blur", function() { tasks[index].description = cells[1].innerText.trim(); saveData() })
        cells[2].addEventListener("blur", function() { tasks[index].dep = cells[2].innerText.trim(); saveData() })
        cells[3].addEventListener("blur", function() { tasks[index].hrs = cells[3].innerText.trim(); saveData(); updateSummary() })
    })
}

function updateStatus(index, value) {
    tasks[index].taskStatus = value
    saveData()
    updateSummary()
}

function updateOwner(index, value) {
    tasks[index].owner = value
    saveData()
}

function updateAssignedDate(index, value) {
    tasks[index].assignedDate = value
    saveData()
}

function updateCompletionDate(index, value) {
    tasks[index].completionDate = value
    saveData()
}

function deleteRow(index) {
    tasks[index] = { taskID: "", owner: "", description: "", assignedDate: "", taskStatus: "Not Started", completionDate: "", dep: "", hrs: "" }
    saveData()
    renderTable()
    updateSummary()
}

function updateSummary() {
    let filledTasks = tasks.filter(t => t.taskID.trim() !== "")
    let total = filledTasks.length
    let completed = filledTasks.filter(t => t.taskStatus === "Completed").length
    let inProgress = filledTasks.filter(t => t.taskStatus === "In Progress").length
    let pending = filledTasks.filter(t => t.taskStatus === "Pending").length
    let notStarted = filledTasks.filter(t => t.taskStatus === "Not Started").length
    let hrs = filledTasks.reduce((sum, t) => sum + (Number(t.hrs) || 0), 0)
    totalCount.textContent = total
    completedCount.textContent = completed
    inProgressCount.textContent = inProgress
    pendingCount.textContent = pending
    notStartedCount.textContent = notStarted
    totalHrs.textContent = hrs
}

prev.addEventListener("click", function() {
    currentDate.setMonth(currentDate.getMonth() - 1)
    loadData(); renderTable(); renderOwners(); updateSummary(); updateMonthLabel()
})

next.addEventListener("click", function() {
    currentDate.setMonth(currentDate.getMonth() + 1)
    loadData(); renderTable(); renderOwners(); updateSummary(); updateMonthLabel()
})

loadData()
renderOwners()
renderTable()
updateSummary()
updateMonthLabel()

GenerateReport.addEventListener("click", function() {
    const { Document, Paragraph, Table, TableRow, TableCell, TextRun, WidthType, AlignmentType, BorderStyle, Packer, ShadingType } = docx

    let filledTasks = tasks.filter(t => t.taskID.trim() !== "")

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
            makeCell(`${filledTasks.length} Total Tasks`, true, summaryCellStyle),
            makeCell(`${filledTasks.filter(t => t.taskStatus === "Completed").length} Completed`, true, summaryCellStyle),
            makeCell(`${filledTasks.filter(t => t.taskStatus === "In Progress").length} In Progress`, true, summaryCellStyle),
            makeCell(`${filledTasks.filter(t => t.taskStatus === "Pending").length} Pending`, true, summaryCellStyle),
            makeCell(`${filledTasks.filter(t => t.taskStatus === "Not Started").length} Not Started`, true, summaryCellStyle),
            makeCell(`${filledTasks.reduce((sum, t) => sum + (Number(t.hrs) || 0), 0)} Total Hrs`, true, summaryCellStyle),
        ]
    })

    const headerRow = new TableRow({
        children: ["Task ID", "Task Description", "Owner", "Assigned Date", "Status", "Completion Date", "Dependency", "Hrs Logged"]
            .map(text => makeCell(text, true, headerCellStyle))
    })

    const dataRows = filledTasks.map(function(task) {
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

    let total = filledTasks.length
    let completed = filledTasks.filter(t => t.taskStatus === "Completed").length
    let inProgress = filledTasks.filter(t => t.taskStatus === "In Progress").length
    let pending = filledTasks.filter(t => t.taskStatus === "Pending").length
    let notStarted = filledTasks.filter(t => t.taskStatus === "Not Started").length
    let hrs = filledTasks.reduce((sum, t) => sum + (Number(t.hrs) || 0), 0)

    let ownerSummaries = ownerNames.map(function(name) {
        let ownerTasks = filledTasks.filter(t => t.owner === name)
        if (ownerTasks.length === 0) return null
        let done = ownerTasks.filter(t => t.taskStatus === "Completed").length
        let inProg = ownerTasks.filter(t => t.taskStatus === "In Progress").length
        let pend = ownerTasks.filter(t => t.taskStatus === "Pending").length
        return `${name} has ${ownerTasks.length} task(s) — ${done} completed, ${inProg} in progress, ${pend} pending.`
    }).filter(Boolean).join(" ")

    let scrumText = `As of ${month_year.textContent}, the team has ${total} tasks in total. ${completed} task(s) are completed, ${inProgress} are in progress, ${pending} are pending and ${notStarted} have not yet started. Total hours logged stand at ${hrs}. Individual updates: ${ownerSummaries}`

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
                    children: [new TextRun({ text: "Scrum Summary", bold: true, size: 24, font: "Calibri", color: "1a1a2e" })]
                }),
                new Paragraph({ text: "" }),
                new Paragraph({
                    children: [new TextRun({ text: scrumText, size: 20, font: "Calibri", color: "444444", italics: true })]
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