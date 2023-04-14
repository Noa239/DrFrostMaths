// Dependencies
const got = require('got');
const config = require('./config.json');
const FormData = require('form-data');

// Authentication
var cookieContainer = "";
for (const [key, value] of Object.entries(config.CookieData)){
    cookieContainer += `${key}=${value}; `
};

// Client
const client = got.extend({
    prefixUrl: 'https://www.drfrostmaths.com/',
    headers: {
        "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4183.121 Safari/537.36 OPR/71.0.3770.323",
        "connection": "keep-alive",
        "cookie": cookieContainer 
    },
});

// Get Question
async function GetQuestion(aaid){
    // Set up our data to send
    const options = {
        headers: {
            "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
        },
        searchParams: {
            aaid: aaid
        }
    };

    // Send the request and handle errors
    try {
        const response = await client.get('do-question.php', options);
        return [response, true];
    } catch(error){
        console.log(error);
        return [error, false];
    };
};

// Process Question
async function ProcessQuestion(response, success){
    // Don't process unsuccessful question stuff
    if (!success) return;

    // Variables
    var splitBody = response.body.split("\n");

    var question;
    var qnum;
    var permid;
    var userAnswer = [];

    // Get needed values and set as variables above
    splitBody.forEach(element => {
        if (element.indexOf("var question = {") != -1){
            question = JSON.parse(element.slice(15).slice(0, -1));
        };
        if (element.indexOf("var qnum =") != -1){
            qnum = Number(element.slice(11).slice(0, -1));
        };
        if (element.indexOf("var permid =") != -1){
            permid = Number(element.slice(13).slice(0, -1).replace(/['"]+/g, ''));
        };
    });

    userAnswer.push(eval(question.content.match(/[\d(+)]+/)[0]));

    // Return values
    return [userAnswer, qnum, question.params, permid];
};


async function SendCorrectAnswer(userAnswer, qnum, params, permid, aaid){
    // Make form data
    const form = new FormData();
    form.append("userAnswer", JSON.stringify(userAnswer))
    form.append("qnum", qnum)
    form.append("permid", permid)
    form.append("params", JSON.stringify(params))
    form.append("aaid", aaid);

    // Set up our data to send
    const options = {
        headers: {
            "accept": "application/json, text/javascript, */*; q=0.01",
        },
        body: form
    };

    // Send the request and handle errors
    try {
        const response = await client.post('process-answer-new.php', options);
        return [response, true];
    } catch(error){
        console.log(error);
        return [error, false];
    };
};

// Do question
async function WorkQuestion(aaid){
    // Start time
    const startTime = new Date();
    
    // Get the question
    const result = await GetQuestion(aaid);

    // Get the answer
    const processedResult = await ProcessQuestion(result[0], result[1]);
    
    // Send the correct answer over
    const correctAnswerResponse = await SendCorrectAnswer(processedResult[0], processedResult[1], processedResult[2], processedResult[3], aaid);

    // Output
    if (correctAnswerResponse[1]){
        const correctAnswerJSON = JSON.parse(correctAnswerResponse[0].body);

        if (correctAnswerJSON.isCorrect){
            console.log(`Done in ${Math.round(new Date() - startTime)} milliseconds! New total points: ${correctAnswerJSON.totalPoints}, Number of questions completed: ${correctAnswerJSON.numcompleted}`);
        };
    };
};

// Loop
(async() => {
    while (true){
        await WorkQuestion(AAIDHERE);23533545
        e
    };
})();
