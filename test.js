console.log("app is running...");

//import 

// global varible
let user_info_json = localStorage.getItem("sam_user_info");
let pwbp_dom;
let newTabs = [];

// elements
const start_recognition_btn = document.querySelector("#sr");
const stop_recognition_btn = document.querySelector("#nr");
const user_text_ele = document.getElementById("user_reply");
const sam_text_ele = document.getElementById("sam_reply");
const time_ele = document.querySelector("#time").querySelectorAll("*");
const date_ele = document.querySelector("#date").querySelectorAll("*");
const battery_ele = document.getElementById("battery_status");
const online_ele = document.getElementById("online_status");
const startup_ele = document.getElementById("turn_on");
const initsys_ele = document.getElementById("initsys");

// sleep function
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// getting dom of url
function getSourceAsDOM(url) {
    xmlhttp = new XMLHttpRequest();
    xmlhttp.open("GET", url, false);
    xmlhttp.send();
    parser = new DOMParser();
    return parser.parseFromString(xmlhttp.responseText, "text/html");
}

// get element by Xpath
function getElementByXpath(path) {
    return pwbp_dom.evaluate(
        path,
        document,
        null,
        XPathResult.FIRST_ORDERED_NODE_TYPE,
        null
    ).singleNodeValue;
}

// date and time setup
let days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thrusday", "Friday", "Saturday"];
let months = ["January", "Febuary", "March", "April", "May", "June", "July", "August", "September", "November", "December"];
let datetime = new Date();
let hrs = datetime.getHours();
let mins = datetime.getMinutes();
let secs = datetime.getSeconds();
let day = days[datetime.getDay()];
let date = datetime.getDate();
let month = months[datetime.getMonth()];
let year = datetime.getFullYear();
time_ele[0].textContent = `${hrs}:${mins}`;
time_ele[1].textContent = `${secs}`;
time_ele[2].textContent = `${day}`;
date_ele[2].textContent = `${date}`;
date_ele[3].textContent = `${month}`;

// battery status setup
let battery_promise = navigator.getBattery();
battery_promise.then(batteryCallback);

function batteryCallback(batteryObject) {
    print_battery_status(batteryObject);
    setInterval(() => {
        print_battery_status(batteryObject);
    }, 10000);
}

function print_battery_status(batteryObject) {
    battery_text = `Battery Status: ${Math.round((batteryObject.level)*100)}%`;
    if (batteryObject.charging) {
        battery_text = battery_text + " (Charging)";
    }
    battery_ele.textContent = battery_text;
}

// online status setup
let online_text = navigator.onLine ? "Online" : "Offline";
online_ele.textContent = "Online Status: " + online_text;

// weather setup
function weather(location) {
    let loc = location;
    let url = `http://api.openweathermap.org/data/2.5/weather?q=${loc}&appid=48ddfe8c9cf29f95b7d0e54d6e171008`;
    const xhr = new XMLHttpRequest();

    xhr.open("GET", url, true);

    xhr.onload = function() {
        if (this.status === 200) {
            let data = JSON.parse(this.responseText);
            document.getElementById("loc").textContent = `Location : ${data.name}`;
            document.getElementById(
                "wetD"
            ).textContent = `Weather Description : ${data.weather[0].description}`;
            document.getElementById(
                "otemp"
            ).textContent = `Original Temperature : ${ktc(data.main.temp)} °C`;
            document.getElementById("fltemp").textContent = `Feels like : ${ktc(
        data.main.feels_like
      )} °C`;
        } else {
            document.getElementById("loc").textContent = "weather info not found";
        }
    };

    xhr.send();
}

function ktc(k) {
    k = k - 273.15;
    return k.toFixed(2);
}

// user info
function userInfo() {
    let user_info_obj = {
        name: user_info_ele.querySelectorAll("input")[0].value,
        location: user_info_ele.querySelectorAll("input")[1].value,
        instagram: user_info_ele.querySelectorAll("input")[2].value,
        github: user_info_ele.querySelectorAll("input")[3].value,
    };
    console.log(user_info_obj[`location`]);
    let temp = [];
    user_info_ele.querySelectorAll("input").forEach((e) => {
        temp.push(e.value);
    });
    if (temp.includes("")) {
        speak_text("sir enter your complete information");
    } else {
        localStorage.clear();
        localStorage.setItem("sam_user_info", JSON.stringify(user_info_obj));
        user_info_ele.style.display = "none";
        weather(JSON.parse(user_info_json).location);
    }
}

// speech utterance
function speak_text(text) {
    const speech_utterance = new SpeechSynthesisUtterance();
    let all_voices = speechSynthesis.getVoices();
    // console.log(all_voices);
    // speech_utterance.voice = all_voices[4];
    speech_utterance.text = text;
    speech_utterance.rate = 1.8;
    speech_utterance.pitch = 1.4;
    window.speechSynthesis.speak(speech_utterance);
}

//sam setup info
if (localStorage.getItem("sam_user_info") !== null) {
    // weather function
    weather(JSON.parse(user_info_json).location);
}
const user_info_ele = document.querySelector(".sam_user_info");
user_info_ele.style.display = "none";
if (localStorage.getItem("sam_user_info") === null) {
    user_info_ele.style.display = "block";
    start_recognition_btn.style.display = "none";
    stop_recognition_btn.style.display = "none";
    user_info_ele.querySelector("button").addEventListener("click", userInfo);
}

// speech recognition
const speech_recognition_obj = window.webkitSpeechRecognition;
const speech_recognition = new speech_recognition_obj();

speech_recognition.onstart = function() {
    console.log("listening...");
};
speech_recognition.onend = function() {
    console.log("recognition stopped.");
};
speech_recognition.continuous = true;
// query
speech_recognition.onresult = function(event) {
    // console.log(event);
    let sam_transcript = "";
    let current = event.resultIndex;
    let user_transcript = event.results[current][0].transcript;
    user_text_ele.textContent = "User: " + user_transcript;
    user_transcript = user_transcript.toLowerCase();
    console.log("User: " + user_transcript);
    // speak_text(user_transcript);
    if (user_transcript.includes("hello")) {
        sam_transcript = "hello sir";
        sam_text_ele.innerHTML = "Sam: " + sam_transcript;
        console.log("Sam: " + sam_transcript);
        speak_text(sam_transcript);
    }
    if (user_transcript.includes("who is your boss")) {
        sam_transcript = "my boss is " + JSON.parse(localStorage.getItem("sam_user_info")).name
        sam_text_ele.innerHTML = "Sam: " + sam_transcript;
        console.log("Sam: " + sam_transcript);
        speak_text(sam_transcript);
    }
    if (user_transcript.includes("shut down") || user_transcript.includes("shutdown")) {
        sam_transcript = "ok sir , i will take a nap";
        sam_text_ele.textContent = "Sam: " + sam_transcript;
        console.log("Sam: " + sam_transcript);
        speak_text(sam_transcript);

        speech_recognition.stop();
    }
    if (user_transcript.includes("sam")) {
        sam_transcript = "at your service, sir";
        sam_text_ele.textContent = "Sam: " + sam_transcript;
        console.log("Sam: " + sam_transcript);
        speak_text(sam_transcript);

    }
    if (user_transcript.includes("open youtube")) {
        sam_transcript = "opening youtube sir";
        sam_text_ele.textContent = "Sam: " + sam_transcript;
        console.log("Sam: " + sam_transcript);
        speak_text(sam_transcript);

        newTabs.push(window.open("https://www.youtube.com/"));
    }
    if (user_transcript.includes("open google")) {
        sam_transcript = "opening google sir";
        sam_text_ele.textContent = "Sam: " + sam_transcript;
        console.log("Sam: " + sam_transcript);
        speak_text(sam_transcript);

        newTabs.push(window.open("https://www.google.com/"));
    }
    if (user_transcript.includes("search for")) {
        sam_transcript = "searching sir";
        sam_text_ele.textContent = "Sam: " + sam_transcript;
        console.log("Sam: " + sam_transcript);
        speak_text(sam_transcript);

        let search_query = user_transcript.split(" ");
        console.log(search_query);
        let l = (search_query[0] === "") ? 3 : 2;
        search_query = search_query.splice(l, search_query.length);
        console.log(search_query);
        search_query = search_query.join("+");
        console.log("search query : ", search_query);
        newTabs.push(
            window.open(`https://www.google.com/search?q=${search_query}`)
        );
    }
    if (user_transcript.includes("search on youtube")) {
        sam_transcript = "searching sir";
        sam_text_ele.textContent = "Sam: " + sam_transcript;
        console.log("Sam: " + sam_transcript);
        speak_text(sam_transcript);

        let search_query = user_transcript.split(" ");
        console.log(search_query);
        let l = (search_query[0] === "") ? 4 : 3;
        search_query = search_query.splice(l, search_query.length);
        console.log(search_query);
        search_query = search_query.join("+");
        console.log("search query : ", search_query);
        newTabs.push(
            window.open(
                `https://www.youtube.com/results?search_query=${search_query}`
            )
        );
    }
    if (user_transcript.includes("open github")) {
        sam_transcript = "opening github";
        sam_text_ele.textContent = "Sam: " + sam_transcript;
        console.log("Sam: " + sam_transcript);
        speak_text(sam_transcript);

        newTabs.push(window.open(`https://www.github.com/`));
    }
    if (
        user_transcript.includes("open my github profile") ||
        user_transcript.includes("open my guitar profile")
    ) {
        sam_transcript = "opening your github profile sir";
        sam_text_ele.textContent = "Sam: " + sam_transcript;
        console.log("Sam: " + sam_transcript);
        speak_text(sam_transcript);

        newTabs.push(
            window.open(`https://www.github.com/${JSON.parse(user_info_json).github}`)
        );
    }
    if (user_transcript.includes("show my repository")) {
        speak_text("as you wish sir");
        repo_xpath = "/html/body/div[4]/main/div[2]/div/div[2]/div[1]/nav/a[2]";
        const repo_ele = getElementByXpath(repo_xpath);
        console.log(repo_ele);
        repo_ele.click();
    }
    if (user_transcript.includes("switch tab")) {
        sam_transcript = "as you wish sir";
        sam_text_ele.textContent = "Sam: " + sam_transcript;
        console.log("Sam: " + sam_transcript);
        speak_text(sam_transcript);

        newTabs[0].focus();
    }
    if (user_transcript.includes("reload")) {
        sam_transcript = "reloading sir";
        sam_text_ele.textContent = "Sam: " + sam_transcript;
        console.log("Sam: " + sam_transcript);
        speak_text(sam_transcript);

        document.location.reload();
    }
    if (user_transcript.includes("close tab")) {
        if (newTabs.length === 0) {
            sam_transcript = "no tabs to close sir";
        } else {
            sam_transcript = "one tab closed sir";
            newTabs[newTabs.length - 1].close();
            newTabs.pop();
            console.log(newTabs);
        }
        sam_text_ele.textContent = "Sam: " + sam_transcript;
        console.log("Sam: " + sam_transcript);
        speak_text(sam_transcript);
    }
    if (user_transcript.includes("close all tab")) {
        if (newTabs.length === 0) {
            sam_transcript = "no tabs to close sir";
        } else {
            sam_transcript = "closing all tab sir";
            for (let i = newTabs.length - 1; i >= 0; i--) {
                newTabs[i].close();
                newTabs.pop();
                console.log(i);
            }
            console.log(newTabs)
        }
        sam_text_ele.textContent = "Sam: " + sam_transcript;
        console.log("Sam: " + sam_transcript);
        speak_text(sam_transcript);
    }
    if (user_transcript.includes("open email")) {
        speak_text("opening your email sir");
        newTabs.push(window.open(`https://mail.google.com/`));
    }
    user_transcript = "";
    sam_text_ele.textContent = "Sam: " + sam_transcript;
};


window.onload = () => {
    // startup music
    if (localStorage.getItem("sam_user_info") == null) {
        speak_text("please fill out the details and reload sir");
    } else if (online_text == "Offline") {
        sam_text_ele.textContent = "Sam: sorry we are offline sir"
        speak_text("sorry we are offline sir");
    } else {
        startup_ele.play();
        setTimeout(() => {
            speak_text("ready to go sir");
            console.log("ready to go sir");
            if (localStorage.getItem("sam_user_info") == null) {
                speak_text("please fill out the details and reload sir");
            }
            initsys_ele.style.display = "none";
            sam_text_ele.textContent = "Sam: ready to go sir"
            speech_recognition.start();
        }, 10000);
    }

    // speech_recognition.start();

    // date time
    time_ele[0].textContent = `${hrs}:${mins}`;
    time_ele[1].textContent = `${secs}`;
    setInterval(() => {
        let datetime = new Date();
        let hrs = datetime.getHours();
        let mins = datetime.getMinutes();
        let secs = datetime.getSeconds();
        let day = days[datetime.getDay()];
        let date = datetime.getDate();
        let month = months[datetime.getMonth()];
        let year = datetime.getFullYear();
        time_ele[0].innerHTML = `${hrs}:${mins}`;
        time_ele[1].innerHTML = `${secs}`;
        time_ele[2].innerHTML = `${day}`;
        date_ele[2].textContent = `${date}`;
        date_ele[3].textContent = `${month}`;
    }, 1000);
}

// action listener
start_recognition_btn.addEventListener("click", () => {
    speech_recognition.start();
});
stop_recognition_btn.addEventListener("click", () => {
    speech_recognition.stop();
});