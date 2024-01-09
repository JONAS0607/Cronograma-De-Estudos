let tasks = [] // Estrutura para armazenar tarefas e subtarefas
let totalTime = 0

function updateTotalTime() {
  let totalSeconds = totalTime
  let hours = Math.floor(totalSeconds / 3600)
  let minutes = Math.floor((totalSeconds % 3600) / 60)
  let seconds = totalSeconds % 60

  hours = hours < 10 ? '0' + hours : hours
  minutes = minutes < 10 ? '0' + minutes : minutes
  seconds = seconds < 10 ? '0' + seconds : seconds

  document.getElementById(
    'totalTime'
  ).textContent = `${hours}:${minutes}:${seconds}`
}

function resetTotalTime() {
  totalTime = 0
  updateTotalTime()
  saveTasksToLocalStorage()
}

function formatTime(time) {
  let minutes = parseInt(time / 60, 10)
  let seconds = parseInt(time % 60, 10)

  minutes = minutes < 10 ? '0' + minutes : minutes
  seconds = seconds < 10 ? '0' + seconds : seconds
  return minutes + ':' + seconds
}

function startTimer(taskIndex) {
  if (tasks[taskIndex].intervalId) {
    return // Já está rodando
  }

  tasks[taskIndex].intervalId = setInterval(() => {
    if (tasks[taskIndex].time > 0) {
      tasks[taskIndex].time--
      totalTime++
      updateTotalTime()
      document.getElementById(`timer${taskIndex}`).textContent = formatTime(
        tasks[taskIndex].time
      )
    } else {
      clearInterval(tasks[taskIndex].intervalId)
      tasks[taskIndex].intervalId = null
    }
  }, 1000)
}

function pauseTimer(taskIndex) {
  if (tasks[taskIndex].intervalId) {
    clearInterval(tasks[taskIndex].intervalId)
    tasks[taskIndex].intervalId = null
  }
}

function resetTimer(taskIndex) {
  if (tasks[taskIndex].intervalId) {
    clearInterval(tasks[taskIndex].intervalId)
    tasks[taskIndex].intervalId = null
  }
  tasks[taskIndex].time = 60 * 30 // Exemplo: resetar para 30 minutos
  document.getElementById(`timer${taskIndex}`).textContent = formatTime(
    tasks[taskIndex].time
  )
}

function addTask() {
  let taskName = document.getElementById('newTaskName').value
  let taskTime = parseInt(document.getElementById('newTaskTime').value, 10)

  if (taskName && taskTime) {
    let newTask = {
      name: taskName,
      time: taskTime * 60,
      subTasks: [],
      intervalId: null
    }
    tasks.push(newTask)
    displayTasks()
    saveTasksToLocalStorage()
  }
}

function addSubTask(taskIndex) {
  let subTaskName = prompt('Nome da Subtarefa:')
  if (subTaskName) {
    let newSubTask = {
      name: subTaskName
    }
    tasks[taskIndex].subTasks.push(newSubTask)
    displayTasks()
    saveTasksToLocalStorage()
  }
}

function deleteTask(taskIndex) {
  clearInterval(tasks[taskIndex].intervalId)
  tasks.splice(taskIndex, 1)
  displayTasks()
  saveTasksToLocalStorage()
}

function deleteSubTask(taskIndex, subTaskIndex) {
  tasks[taskIndex].subTasks.splice(subTaskIndex, 1)
  displayTasks()
  saveTasksToLocalStorage()
}

function displayTasks() {
  let tasksContainer = document.getElementById('tasks')
  tasksContainer.innerHTML = ''

  tasks.forEach((task, taskIndex) => {
    let taskElement = document.createElement('div')
    taskElement.className = 'task'
    taskElement.id = `task${taskIndex}`
    taskElement.innerHTML = `
        <input type="checkbox" id="checkbox-task-${taskIndex}">
        <label for="checkbox-task-${taskIndex}">${task.name} </label>
        <button onclick="startTimer(${taskIndex})"><i class="fas fa-play"></i></button>
        <button onclick="pauseTimer(${taskIndex})"><i class="fas fa-pause"></i></button>
        <button onclick="resetTimer(${taskIndex})"><i class="fas fa-redo"></i></button>
        <button onclick="deleteTask(${taskIndex})"><i class="fas fa-trash"></i></button>
        
        <button onclick="addSubTask(${taskIndex})"><i class="fas fa-plus"></i></button>
        <span class="timer" id="timer${taskIndex}">${formatTime(
      task.time
    )}</span>
        <div id="subTasksContainer${taskIndex}" class="hidden"></div>
    `
    tasksContainer.appendChild(taskElement)

    let subTasksContainer = document.getElementById(
      `subTasksContainer${taskIndex}`
    )
    task.subTasks.forEach((subTask, subTaskIndex) => {
      let subTaskElement = document.createElement('div')
      subTaskElement.className = 'subtask'
      subTaskElement.innerHTML = `
            <input type="checkbox" id="checkbox-subtask-${taskIndex}-${subTaskIndex}">
            <label for="checkbox-subtask-${taskIndex}-${subTaskIndex}">${subTask.name}</label>
            <button onclick="deleteSubTask(${taskIndex}, ${subTaskIndex})"><i class="fas fa-trash"></i></button>
        `
      subTasksContainer.appendChild(subTaskElement)
    })
  })
}

function toggleSubTasks(taskIndex) {
  let subTasksContainer = document.getElementById(
    `subTasksContainer${taskIndex}`
  )
  subTasksContainer.classList.toggle('hidden')
}

function saveTasksToLocalStorage() {
  let tasksToSave = tasks.map(task => {
    return { ...task, intervalId: null } // Não salvar intervalId
  })

  localStorage.setItem('tasks', JSON.stringify(tasksToSave))
  localStorage.setItem('totalTime', totalTime.toString())
}

function loadTasksFromLocalStorage() {
  let savedTasks = localStorage.getItem('tasks')
  let savedTotalTime = localStorage.getItem('totalTime')
  if (savedTasks) {
    tasks = JSON.parse(savedTasks).map(task => {
      return { ...task, intervalId: null } // Reinicializar intervalId
    })
    totalTime = parseInt(savedTotalTime, 10)
    displayTasks()
    updateTotalTime()
  }
}

document.addEventListener('DOMContentLoaded', function () {
  loadTasksFromLocalStorage()
})
