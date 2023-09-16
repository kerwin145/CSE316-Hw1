import Model from './model.js';

//TODO Add question tag click filter functionality

const main = document.querySelector('#main')
const content = document.querySelector('.content')

const questionList = document.querySelector("#questionList")
const questionCount = document.querySelector("#questionNumber")
const questionsEmptyAlert = document.querySelector("#questionList-emptyAlert")

const sortNewest = document.querySelector('#sortNewest')
const sortActive = document.querySelector('#sortActive')
const sortUnanswered = document.querySelector('#sortUnanswered')
const askQuestion = document.querySelector('.content-askquestion')

const searchbarForm = document.querySelector('#searchbar-form') //we need this for the onsubmit listener to work correctly
const searchbar = document.querySelector('.searchbar')

let searchStr = "" 

const SortEnum = {
  NEWEST: "newest",
  ACTIVE: "active",
  UNANSWERED: "unanswered",
};

let selectedSort = SortEnum.NEWEST;
const filterTags = document.querySelector('#tagFilters')
let tagFilters = [] //filter questions based on tags

const model = new Model()
const data = model.data
//Initailize default array based on newset sort (default newest)
let questions = data.questions.sort((a,b) => b.askDate.getTime() - a.askDate.getTime())


function sortQuestionsByNew(){
  selectedSort = SortEnum.NEWEST
  questions =  data.questions.sort((a,b) => b.askDate.getTime() - a.askDate.getTime())
  filterQuestions()
  searchQuestions()
  loadHomeQuestions()
}

function sortQuestionsByActive(){
  selectedSort = SortEnum.ACTIVE
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
  filterQuestions()
  searchQuestions()
  loadHomeQuestions()
}

function sortQuestionsByUnanswered(){
  selectedSort = SortEnum.UNANSWERED
  questions = data.questions.filter((x) => x.ansIds.length == 0)
  filterQuestions()
  searchQuestions()
  loadHomeQuestions()
}

function deleteTagFilter(tagName, tagId){
  const target = document.querySelector(`#tag_${tagId}`)
  target.remove()

  tagFilters = tagFilters.filter(tag => tag.id != tagId)

  if(tagFilters.length == 0)
    filterTags.innerHTML = ""

    sortFilterSearchQuestions()
    loadHomeQuestions()
}
function addTagFilter(tagName, tagId){
    // Prevent duplicate tag filter
    if (tagFilters.some((element) => element.name == tagName)) return;

    if (tagFilters.length == 0) {
      filterTags.innerHTML = `<h3>Applied Tag Filters</h3>`;
    }
  
    tagFilters.push({ name: tagName, id: tagId });
  
    const tagContainer = document.createElement("div");
    tagContainer.classList.add("tagFilter");
    tagContainer.id = `tag_${tagId}`;
  
    const tagSpan = document.createElement("span");
    tagSpan.textContent = tagName;
  
    const deleteButton = document.createElement("button");
    deleteButton.classList.add("tagFilter-delete");
    deleteButton.innerHTML = '<i class="fa fa-close"></i>';
    deleteButton.addEventListener("click", () => deleteTagFilter(tagName, tagId));
  
    tagContainer.appendChild(tagSpan);
    tagContainer.appendChild(deleteButton);
  
    filterTags.appendChild(tagContainer);
  
    sortFilterSearchQuestions()
    loadHomeQuestions()
}

window.onload = function() {
  sortFilterSearchQuestions()
  loadHomeQuestions()
  
  sortNewest.addEventListener('click', sortQuestionsByNew)
  sortActive.addEventListener('click', sortQuestionsByActive)
  sortUnanswered.addEventListener('click', sortQuestionsByUnanswered)
  searchbarForm.addEventListener('submit', (e) => {
    e.preventDefault()
    searchStr = searchbar.value
    sortFilterSearchQuestions()
    loadHomeQuestions()
  })
  askQuestion.addEventListener('click', askQuestionPrompt)
}
  
function loadHomeQuestions(){
  //CLEAR OUT CHILDREN FROM QUESTIONLIST
  questionList.innerHTML = ""
  //INITIALIZE COUNT
  questionCount.innerHTML = data.questions.length
 
  //----------------------------------------INITIALIZE BODY
  //needed for timestamp
  const timeNow = new Date()
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
  
  if (questions.length == 0)
    questionsEmptyAlert.style.display = 'block'
  else 
    questionsEmptyAlert.style.display = 'none'

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
      let tagName = data.tags.find((element)=> element.tid == tagId).name
      questionTag.innerHTML = tagName

      questionTag.addEventListener('click', () => addTagFilter(tagName, tagId))

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


function sortFilterSearchQuestions(){
  sortQuestions()
  filterQuestions()
  searchQuestions()
}

function sortQuestions(){
  //filter question list based off of tag filters
  if(selectedSort == SortEnum.NEWEST)
    sortQuestionsByNew()
  else if (selectedSort == SortEnum.ACTIVE)
    sortQuestionsByActive()
  else if (selectedSort == SortEnum.UNANSWERED)
    sortQuestionsByUnanswered()
}

function filterQuestions(){
  questions = questions.filter(question => {
    for(var i = 0; i < tagFilters.length; i++) {
      //if there is a tag that is not in our question, we return false
      if (!question.tagIds.includes(tagFilters[i].id))
        return false
    }
    return true
  }) 
}

function searchQuestions(){
  //tokens in brackets are tag searches. everythign else is title substring search
  //If any token matches (be it tag or substring) then the question is returned
  
  let searchstr = searchStr //copy searchStr
  if (searchstr.length < 1)
    return

  let searchTags = []
  let searchTerms = []
  //input handling
  let tagStart = -2, tagEnd = -1
  for(let i = 0; i < searchstr.length; i++){
    let c = searchstr[i]

    //this means that we haven't yet started the window for parsing the tag and should begin
    if(c == '[' && tagEnd > tagStart){
      tagStart = i
    }
    //this means we ahve started the window, and should close the tag
    else if( c== ']' && tagEnd < tagStart){
      tagEnd = i
      if(tagEnd - tagStart <= 1) //empty string check
        continue;
      
      searchTags.push(searchstr.substring(tagStart+1, tagEnd))

      //modify our searchstr to get rid of the tag and replace it with a space adjust i accordingly. 
      searchstr = searchstr.substring(0, tagStart) + " " +  searchstr.substring(tagEnd+1, searchstr.length) 
      i -= (tagEnd-tagStart)
      tagEnd = -1
      tagStart = -2
    }
    else if( c == '[' || c == ']'){
      window.alert("malformed brackets in search bar.")
      return
    }
  }

  //remapping tag to their proper id
  for(let i = 0; i < searchTags.length; i++){
    let tag = searchTags[i]
    let tagId = data.tags.find(x => x.name == tag)
    if (tagId == undefined){
      window.alert(`\"${tag}\" is not a valid registered tag, or no entries with that tag exist. Note that tags are case sensitive.`)
      return
    }
    
    searchTags[i] = tagId.tid
  }
  
  searchTerms = searchstr.split(' ').filter(x => x.length > 0)

  questions = questions.filter(question => 
    question.tagIds.some(tag => searchTags.includes(tag))
    || searchTerms.some(token => question.title.includes(token))
  ) 

}

function askQuestionPrompt(){
	//changes from current page to new question prompt page
	content.style.display = 'none'
	
	//ask question page
	let askQuestionContainer = document.createElement('div')
	askQuestionContainer.className = 'askQuestion-container'
	askQuestionContainer.style.display = 'flex'
	
	let askQuestionTitle = document.createElement('h2')
	askQuestionTitle.className = 'askQuestion-directions'
	askQuestionTitle.innerHTML = 'Question Title*'
	
	let askQuestionTitleDetails = document.createElement('p')
	askQuestionTitleDetails.className = 'askQuestion-details'
	askQuestionTitleDetails.innerHTML =  'Limit title to 100 characters or less'
	
	askQuestionContainer.appendChild(askQuestionTitle)
	askQuestionContainer.appendChild(askQuestionTitleDetails)
	
	main.appendChild(askQuestionContainer)
}
