let triviaBtn = document.querySelector("#new-trivia").addEventListener('click',newTrivia);

let answerBtn = document.querySelector('#answerB').addEventListener('click',newAnswer);

let current = {
    question: "",
    answer: ""
}

const endpoint = "https://trivia.cyberwisp.com/getrandomchristmasquestion";

async function newTrivia() {
    //console.log('Success')

    try {
        const responce = await fetch(endpoint);
        if (!responce.ok) {
            throw Error(responce.statusText);
        }
        const json = await responce.json();
        //console.log(json); 
        displayTrivia(json["question"]);
        current.question = json["question"];
        current.answer = json["answer"];
        console.log(current.question);
        console.log(current.answer);
    }
    catch (err) {
        console.log(err)
        alert('Failed to get new trivia');
    }
}

function displayTrivia(question) {
    const questionText = document.querySelector("#trivia-text");
    const answerText = document.querySelector('#answer-text');
    questionText.textContent = question;
    answerText.textContent = "";

}

function newAnswer() {
    const answerText = document.querySelector('#answer-text');
    answerText.textContent = current.answer;
}

newTrivia()