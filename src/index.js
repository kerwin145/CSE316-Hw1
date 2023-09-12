import Model from './model.js';

const questionList = document.querySelector("#questionList")
const questionCount = document.querySelector("#questionNumber")

const filterNewest = document.querySelector('#filterNewest')
const filterActive = document.querySelector('#filterActive')
const filterUnanswered = document.querySelector('#filterUnanswered')

const model = new Model()
const data = model.data
//Initailize default array based on newset sort (default newest)
let questions = data.questions.sort((a,b) => b.askDate.getTime() - a.askDate.getTime())


function filterQuestionsByNew(){
  questions =  data.questions.sort((a,b) => b.askDate.getTime() - a.askDate.getTime())
  loadHomePageView()
}

function filterQuestionsActive(){
  //first filter questions without answers.
  questions = data.questions.filter((x) => x.ansIds.length > 0)
  
  //lambdas go brrrr
  //we map the answer id to their corresponding times in the answers array, found with the .find() lambda, and then get its minimum, and use that as the comparator for this sort method
  questions = questions.sort((a, b) =>
    Math.min(...b.ansIds.map((x) =>
        data.answers.find((element) => x === element.aid).ansDate.getTime()
      )) 
    -  Math.min(...a.ansIds.map((x) =>
        data.answers.find((element) => x === element.aid).ansDate.getTime()
      ))
  )  
  loadHomePageView()
}

function filterQuestionsByUnanswered(){
  questions = data.questions.filter((x) => x.ansIds.length == 0)
  loadHomePageView()
}

window.onload = function() {
  loadHomePageView()
  
  filterNewest.addEventListener('click', filterQuestionsByNew)
  filterActive.addEventListener('click', filterQuestionsActive)
  filterUnanswered.addEventListener('click', filterQuestionsByUnanswered)
};
  
function loadHomePageView(){
  //CLEAR OUT CHILDREN FROM QUESTIONLIST
  questionList.innerHTML = ""
  //INITIALIZE COUNT
  questionCount.innerHTML = data.questions.length
  //----------------------------------------INITIALIZE BODY
  //needed for timestamp
  const timeNow = new Date()
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
  questions.forEach((question) => {
    let questionContainer = document.createElement('div')
    questionContainer.className = "question-container"
    
    questionList.appendChild(questionContainer)

    //Question stats
    let questionStats = document.createElement('div')
    questionStats.className = "question-stats"

    let questionStatsAnswers = document.createElement('sub')
    let questionStatsViews = document.createElement('sub')

    questionStatsAnswers.innerHTML = question.ansIds.length + " answers"
    questionStatsViews.innerHTML = question.views + " views"

    questionStats.appendChild(questionStatsAnswers)
    questionStats.appendChild(questionStatsViews)
    questionContainer.appendChild(questionStats)

    //Question main part
    let questionBody = document.createElement('div')
    questionBody.className = "question-body"
    
    let questionText = document.createElement('p')
    questionText.innerHTML = question.title

    let questionTags = document.createElement('div')
    questionTags.className = "question-tags"

    question.tagIds.forEach((tagId) =>{
      let questionTag = document.createElement('div')
      questionTag.innerHTML = data.tags.find((element)=> element.tid == tagId).name
      questionTags.appendChild(questionTag)
    })

    questionBody.appendChild(questionText)
    questionBody.appendChild(questionTags)

    questionContainer.appendChild(questionBody)

    //Time stamps
    let questionUsername = document.createElement('span')
    questionUsername.innerHTML = question.askedBy 
    questionUsername.className = "question-username"

    let timestr = " asked "
    let date = question.askDate
    let difTime = (timeNow - date)/1000 //1000 is to get rid of milliseconds

    
    if(difTime < 60){
      //less than a minute
      if (difTime == 1) //plural check >:(
        timestr += difTime + "second ago"
      else
        timestr += difTime + "seconds ago"
    } 
    else if (difTime < 60 * 60){ 
      //less than an hour
      if(difTime/60 == 1)
        timestr += difTime/60 + "minute ago"
      else
        timestr += difTime/60 + "minutes ago"
    }
    else if (difTime < 60 * 60 * 24){ 
      //less than a day ago
      if (difTime/(60 * 24) == 1)
        timestr += difTime/(60 * 24) + "hour ago"
      else 
        timestr += difTime/(60 * 24) + "hours ago"
    }
    else{
      let suffix = ""
      switch(date.getDate()%10){ 
        case 1:
          suffix = "st"
          break;
        case 2:
          suffix = "nd"
          break;
        case 3: 
          suffix = "rd"
          break;
        default:
          suffix = "th"
          break;
      }
      if(difTime < 365 * 24 * 60 * 60)
        timestr += months[date.getMonth()] + " " + date.getDate() + suffix + " at" + date.getHours() + ":" + date.getMinutes()
      else
        timestr += months[date.getMonth()] + " " + date.getDate() + suffix + ", " + date.getFullYear(), + " at " + date.getHours() + ":" + date.getMinutes() 
    }

    let questionTime = document.createElement('small')
    questionTime.innerHTML = timestr

    let questionTimestamp = document.createElement('small')

    questionTimestamp.appendChild(questionUsername)
    questionTimestamp.appendChild(questionTime)

    questionContainer.appendChild(questionTimestamp)
  })
}
