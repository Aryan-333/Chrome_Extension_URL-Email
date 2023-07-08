let generateBtn = document.querySelector("#shorturl");
let api = document.querySelector("#myurl");
let toastError = document.querySelector('.toast-error')
let toastSuccess = document.querySelector('.toast-success')
let loader = document.querySelector('.loading')

let scrapeEmails = document.getElementById('scrapeEmails');
let list = document.getElementById('emailList')

const url = new URL("https://t.ly/api/v1/link/shorten");
const headers = {
    "Content-Type": "application/json",
    "Accept": "application/json",
};


generateBtn.addEventListener('click', () => {
    if (api.value) {
        loader.classList.remove('d-hide')
        chrome.storage.local.get(['API'], function(result) {
            fetch(url, {
                method: "POST",
                headers,
                body: JSON.stringify({
                    "long_url": api.value,
                    "domain": "https://t.ly/",
                    "api_token": result.API,
                    "expire_at_datetime": "2035-01-17 15:00:00",
                    "description": "Social Media Link",
                    "public_stats": true,
                    "tags": [
                        132,
                        434,
                        565
                    ],
                    "pixels": [
                        321,
                        567,
                        213
                    ]
                }),
            })
            .then(response => response.json())
            .then(json => {
                loader.classList.add('d-hide')
                toastSuccess.classList.remove('d-hide');
                toastSuccess.textContent = json.short_url;
            }).catch(err => {alert(err)});
        });
    }
    else {
        toastError.classList.remove('d-hide');
        setTimeout(() => {
            toastError.classList.add('d-hide');
        }, 1500);
    }
});

//Button click event listener
scrapeEmails.addEventListener('click',async ()=>{

    //get current active tab 
    let [tab] = await chrome.tabs.query(
        {
            active: true, currentWindow:true
        });
    
    // Execute script to parse emails on page
    chrome.scripting.executeScript({
        target:{tabId: tab.id},
        func: scrapeEmailsFromPage,
    });
})

function scrapeEmailsFromPage() {
    
    //RegEx to parse email
    const emailRegEx = /[\w-\.]+@([\w-]+\.)+[\w-]{2,4}/gim;

    let emails = document.body.innerHTML.match(emailRegEx);

    chrome.runtime.sendMessage({emails});
}

//Handler to recieve emails from content scripts
chrome.runtime.onMessage.addListener((request,sender,sendResponse)=>{
    let emails=request.emails;

    if(emails == null || emails.length ==0){
    //No email
     let li = document.createElement('li');
     li.innerText = "No Email found";
     list.appendChild(li);
    }
    else{
        emails.forEach((email)=>{
            let li = document.createElement('li');
            li.innerText = email;
            list.appendChild(li);
        })
    }

    
})