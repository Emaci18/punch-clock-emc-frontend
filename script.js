// Key varibles
let authenticationData = {};
let timeCardID = null;
let activeProjects = null;
let names = null;
let selectedName = null;
let selectedProjectId = null;
let selectedProjectName = null;
let authenticationStatus = null
let userCoordinates = null;
let timeCardOption = null;
const baseUrl = "http://147.182.249.99"
const company = "EMC"

//  --------------------------------  Utilities --------------------------------

function getSelectedDropdownValue(dropdownId) {
    const dropdown = document.getElementById(dropdownId);

    if (!dropdown) {
        console.error(`Dropdown with id "${dropdownId}" not found.`);
        return null;
    }

    const selectedValue = dropdown.value;
    const selectedText = dropdown.options[dropdown.selectedIndex].text;

    return {
        value: selectedValue,
        text: selectedText
    };
}
function getCapturedImageAsBase64() {
    const canvas = document.getElementById('captureCanvas');

    if (!canvas) {
        console.error("Canvas element not found.");
        return null;
    }

    const base64Image = canvas.toDataURL('image/jpeg', 0.92);  // or 'image/jpeg'

    return base64Image;
}
async function dynamicFetch(url, data = {}, method = 'POST') {
    try {
        const options = {
            method: method.toUpperCase(),
            headers: {
                'Content-Type': 'application/json',
                'Company': company
            }
        };

        if (method.toUpperCase() !== 'GET') {
            options.body = JSON.stringify(data);
        }

        const response = await fetch(url, options);

        

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const result = await response.json();



        return result;

    } catch (error) {
        console.error('Fetch failed:', error);
        return null;
    }
}

function getUserLocation() {
    if (!navigator.geolocation) {
        console.error("Geolocation is not supported by this browser.");
        return;
    }

    navigator.geolocation.getCurrentPosition(
        (position) => {
            userCoordinates = {
                latitude: position.coords.latitude,
                longitude: position.coords.longitude
            };
            const latitude = userCoordinates.latitude.toString().slice(0, -5)
            const longitude = userCoordinates.longitude.toString().slice(0, -5)

            userCoordinates = latitude + "," + longitude

            console.log(userCoordinates)

        },
        (error) => {
            console.error("Error getting location:", error.message);
        }
    );
}

function getCurrentTime() {
    const now = new Date();

    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');

    return `${hours}:${minutes}:${seconds}`;
}



function getCurrentDate() {
    const now = new Date();

    const pad = (n, z = 2) => String(n).padStart(z, '0');

    const year = now.getFullYear();
    const month = pad(now.getMonth() + 1);
    const day = pad(now.getDate());
    return `${year}-${month}-${day}`;
}





// ##############################################################################

//  --------------------------------  Projects UI --------------------------------
// Get the projects data avaible 
async function getActiveProjects(url) {
    try {
        // const response = await fetch(url);
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Company': company
            }
        });


        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        activeProjects = data.responsiveProjects; // assuming backend returns { projects: [ {value, name}, ... ] }
        return activeProjects;
    } catch (error) {
        console.error('Fetch failed:', error);
        return null;
    }
}

async function listProjectsForUi() {
    await getActiveProjects(baseUrl + "/activeProjects");

    console.log("Active Projects:", activeProjects);
}
function createProjectOption(value, name) {
    const option = document.createElement('option');
    option.value = value;
    option.textContent = name;
    return option;
}
function createProjectSelectionUI(projects) {
    // Create main containers
    const mainContainer = document.createElement('div');
    mainContainer.className = 'mainContainer';
    mainContainer.id = 'projectSelectionUI';


    // Authentication status p
    const locationConfrimationStatus = document.createElement('p');
    locationConfrimationStatus.id = 'locationConfrimationStatus';
    locationConfrimationStatus.className = 'locationConfrimationStatusCs';


    const authContainer = document.createElement('div');
    authContainer.className = 'authenticationContainer';

    const projectContainer = document.createElement('div');
    projectContainer.className = 'projectSelectionContainer';

    // Label
    const label = document.createElement('label');
    label.id = 'projectSecetionLabel';
    label.setAttribute('for', 'projects');
    label.textContent = 'Choose your project:';

    // Select
    const select = document.createElement('select');
    select.id = 'project_list';
    select.name = 'projects';
    select.setAttribute('onchange', 'checkProjectSelection()');

    const defaultOption = document.createElement('option');
    defaultOption.value = '';
    defaultOption.disabled = true;
    defaultOption.selected = true;
    defaultOption.textContent = '-- Choose project --';
    select.appendChild(defaultOption);

    // Add dynamic project options
    projects.forEach(project => {
        select.appendChild(createProjectOption(project.value, project.name));
    });

    // Button
    const button = document.createElement('button');
    button.id = 'projectConfirmationBtn';
    button.textContent = 'Confirm';
    button.disabled = true;
    button.setAttribute('onclick', 'confirmProjectSelection()');

    // Assemble the structure
    projectContainer.appendChild(label);
    projectContainer.appendChild(select);
    projectContainer.appendChild(button);
    

    authContainer.appendChild(projectContainer);
    mainContainer.appendChild(locationConfrimationStatus)
    mainContainer.appendChild(authContainer);

    // Append to body (or any container)
    document.body.appendChild(mainContainer);
}


// async function verifyLocation() {

    
// }

// These functions help the site not move on until a project is selectied
function confirmProjectSelection() {
    const dropdown = document.getElementById("project_list");
    selectedProjectId = dropdown.value;
    
    selectedProjectName = dropdown.options[dropdown.selectedIndex].text;

    authenticationData["projectId"] = selectedProjectId

    url = baseUrl + "/projectLocations"

    dynamicFetch(url, {}, "GET").then(locations => {
    if (locations[selectedProjectId] == userCoordinates){

        data = {
            "name": selectedName,
            "projectID": selectedProjectName, 
            "timeCardAction": timeCardOption,
            "ts": getCurrentTime(),
            "date": getCurrentDate(),
            "activeTimeCardId": timeCardID
        }
        url = baseUrl + "/timeCard"
        dynamicFetch(url, data, "POST").then(()=>{
            document.getElementById('projectSelectionUI').remove()
            thankyouVisual()
        })
        


        // replace console message with taking the user to a thank you and ask to punch another then going to home screen again.

        console.log("Yeah, you're there")
    }
    else {document.getElementById("locationConfrimationStatus").textContent = "Unable to cofirm you are onsite"}
    
    });


    console.log(selectedProjectId )
}
function checkProjectSelection(){
    const dropdown = document.getElementById("project_list");
        selectedProjectId = dropdown.value;
        if (selectedProjectId != ''){
            document.getElementById('projectConfirmationBtn').disabled = false
        }


}
// Main Project UI init
async function intializeProjectsAvaibleView() {
    const url = baseUrl + "/activeProjects";
    const projects = await getActiveProjects(url);
    if (projects) {
        createProjectSelectionUI(projects);
        getUserLocation()
        document.getElementById('project_list').addEventListener('click', checkProjectSelection);

    } else {
        console.error("Could not load projects.");
    }
}

// ##############################################################################

//  --------------------------------  Names UI --------------------------------
async function getNamesAvaible(url) {
    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Company': company

            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        names = data.names; // assuming backend returns { projects: [ {value, name}, ... ] }
        return names;
    } catch (error) {
        console.error('Fetch failed:', error);
        return null;
    }
}


function createNameSelector(users) {

    // Outer container
    const outerContainer = document.createElement('div');
    outerContainer.id = 'FScontainer';
    outerContainer.className = 'facialScanContainer';

    // Inner container
    const innerContainer = document.createElement('div');
    innerContainer.className = 'facialScanContainer';

    // Authentication status p
    const waitingForAuthentication = document.createElement('p');
    waitingForAuthentication.id = 'waitingForAuthentication';
    waitingForAuthentication.className = 'waitingForAuthenticationCs';

    // Name selection wrapper
    const nameSelection = document.createElement('div');
    nameSelection.className = 'names_selection';

    // Dropdown select
    const select = document.createElement('select');
    select.name = 'names';
    select.id = 'nameAuthSelecton';

    const defaultOption = document.createElement('option');
    defaultOption.value = '';
    defaultOption.disabled = true;
    defaultOption.selected = true;
    defaultOption.textContent = '-- Choose Your Name --';
    select.appendChild(defaultOption);

    // Dynamically populate names
    users.forEach(name => {
        const option = document.createElement('option');
        option.className = 'selections';
        option.value = name;
        option.textContent = name;
        select.appendChild(option);
    });

    // Append select to wrapper
    nameSelection.appendChild(select);

    // Camera button
    const button = document.createElement('button');
    button.id = 'intializeCameraBtn';
    button.textContent = 'Take authentication Photo';
    button.disabled = true;

    // Assemble the UI
    outerContainer.append(waitingForAuthentication)
    innerContainer.appendChild(nameSelection);
    innerContainer.appendChild(button);
    outerContainer.appendChild(innerContainer);

    // Add to body or another parent container
    document.body.appendChild(outerContainer);
}


async function intializeNamesAvaibleView() {
    const url = baseUrl + "/employeeNames";
    const avaibleNames = await getNamesAvaible(url);
    if (avaibleNames) {
        createNameSelector(avaibleNames);
        document.getElementById('nameAuthSelecton').addEventListener('change', () => {
        const selected = getSelectedDropdownValue('nameAuthSelecton');
        console.log('Selected dropdown value:', selected);
        document.getElementById('intializeCameraBtn').disabled = false

    });
        document.getElementById('intializeCameraBtn').addEventListener('click', initializeCameraUI);
    } else {
        console.error("Could not load Names.");
    }
}



// ##############################################################################

//  --------------------------------  Camera UI --------------------------------

// Break down into smaller functions when possible



// AUthenticate user veirfication
async function getAuthenticatedResponse(url, data, method) {
    // Show waiting message
    const statusEl = document.getElementById("waitingForAuthentication");
    statusEl.textContent = "⏳ Waiting for response...";

    // Fetch data
    authenticationStatus = await dynamicFetch(url, data, method);

    // Handle response
    if (authenticationStatus.authentication === "y") {
        

        statusEl.textContent = "✅ User has been authenticated";
        timeCardID = authenticationStatus.activeTimeCardId 
        
        if (timeCardID == false){
            console.log("Hello")
            alert("Please sign in first")
            document.getElementById('FScontainer').remove()
            renderTimecardUI()
        }

        else {

        console.log(timeCardID)
        
        document.getElementById('FScontainer').remove()
        if (timeCardOption === "start_shift_btn" | timeCardOption === "end_shift_btn"|
            timeCardOption === "start_lunch_btn" | timeCardOption === "end_lunch_btn" |
            timeCardOption === "work_on_something_else_btn" 

        ){
            // Add the check for active authentication
           
            intializeProjectsAvaibleView()


        }

        }


    } else {
        statusEl.textContent = "❌ User could not be authenticated. Please try again";
        console.log("Authentication failed");
    }
}
function initializeCameraUI() {
    document.getElementById("intializeCameraBtn").style.display = "none"
    
    const container = document.getElementById('FScontainer');
    if (!container) {
        console.error("FScontainer not found in the DOM.");
        return;
    }

    // Reuse or create liveCamera
    let liveCamera = document.getElementById('liveCamera');
    if (!liveCamera) {
        liveCamera = document.createElement('div');
        liveCamera.id = 'liveCamera';
        liveCamera.className = 'liveCameraContainer'; // Apply your desired styles here
        container.appendChild(liveCamera);
    }
    liveCamera.innerHTML = '';
    liveCamera.style.display = 'flex';

    // Reuse or create captured image container
    let capturedImageContainer = document.getElementById('capturedImageContainer');
    if (!capturedImageContainer) {
        capturedImageContainer = document.createElement('div');
        capturedImageContainer.id = 'capturedImageContainer';
        capturedImageContainer.className = 'capturedImageContainer'; // Apply styling
        container.appendChild(capturedImageContainer);
    }
    capturedImageContainer.innerHTML = '';

    // Ask for camera
    navigator.mediaDevices.getUserMedia({ video: true })
        .then(stream => {
            const video = document.createElement('video');
            video.id = 'videoFeed';
            video.autoplay = true;
            video.srcObject = stream;
            video.width = 320;
            video.height = 240;

            const canvas = document.createElement('canvas');
            canvas.id = 'captureCanvas';
            canvas.width = 320;
            canvas.height = 240;
            canvas.style.display = 'none';

            const captureBtn = document.createElement('button');
            captureBtn.id = 'takePictureBtn';
            captureBtn.textContent = 'Capture';
            captureBtn.className = 'cameraButton';

            captureBtn.addEventListener('click', () => {
                // Draw the image
                const context = canvas.getContext('2d');
                context.drawImage(video, 0, 0, canvas.width, canvas.height);

                // Stop the stream
                stream.getTracks().forEach(track => track.stop());

                // Hide camera feed
                liveCamera.style.display = 'none';

                // Show captured image
                canvas.style.display = 'block';

                // Retake Button
                const retakeBtn = document.createElement('button');
                    retakeBtn.id = 'retakePictureBtn';
                    retakeBtn.textContent = 'Retake Picture';
                    retakeBtn.className = 'cameraButton';
                    retakeBtn.addEventListener('click', () => {
                        initializeCameraUI();
                    });
                const sumbitAuthBtn = document.createElement('button')
                sumbitAuthBtn.id = 'sumbitAuthBtn'
                sumbitAuthBtn.textContent = "Submit Photo"
                sumbitAuthBtn.className = 'cameraButton'


                capturedImageContainer.innerHTML = '';
                capturedImageContainer.appendChild(canvas);
                capturedImageContainer.appendChild(retakeBtn);
                capturedImageContainer.appendChild(sumbitAuthBtn)
                // Subit image
                document.getElementById("sumbitAuthBtn").addEventListener('click', () => {
                        const selectedNameOption =  getSelectedDropdownValue('nameAuthSelecton')
                        const base64Image = getCapturedImageAsBase64();
                        if (base64Image) {
                            selectedName = selectedNameOption.value
                            // You could now send this to the backend
                            const authenticationData = {"name": selectedName, "encodedImage":base64Image, "timeCardAction": timeCardOption}
                            console.log(authenticationData)
                            // const url = baseUrl + "/authenticate"
                            const url = baseUrl + "/authenticate"

                            
                            getAuthenticatedResponse(url, authenticationData, "POST")
                        }
                    });
            });

            liveCamera.appendChild(video);
            liveCamera.appendChild(captureBtn);
        })
        .catch(error => {
            console.error('Camera access denied or error:', error);
            alert('Camera permission is required to continue.');
        });
}


// ##############################################################################

//  --------------------------------  Init --------------------------------



function setupButtonListeners(className) {
    const buttons = document.querySelectorAll(`.${className}`);
    if (!buttons.length) {
        console.warn(`No buttons found with class: ${className}`);
        return;
    }

    buttons.forEach(button => {
        button.addEventListener('click', () => {
            timeCardOption = button.id
            
                document.getElementById('homeContainerid').remove();
                intializeNamesAvaibleView();

        });
    });
}



function renderTimecardUI() {
    // Create home container
    const homeContainer = document.createElement('div');
    homeContainer.id = 'homeContainerid';
    homeContainer.className = 'home_container';

    // Create timecard selector container
    const timecardSelector = document.createElement('div');
    timecardSelector.id = 'timecard_selector_id';
    timecardSelector.className = 'timecard_selector';

    // Button configurations
    const buttons = [
        { id: 'start_shift_btn', text: 'Start Shift' },
        { id: 'end_shift_btn', text: 'End Shift' },
        { id: 'start_lunch_btn', text: 'Start Lunch' },
        { id: 'end_lunch_btn', text: 'End Lunch' }, // Fixed duplicate ID from your original HTML
        { id: 'work_on_something_else_btn', text: 'Switch project' }
    ];

    // Create and append buttons
    buttons.forEach(btn => {
        const button = document.createElement('button');
        button.id = btn.id;
        button.className = 'init-btns';
        button.textContent = btn.text;
        timecardSelector.appendChild(button);
    });

    // Nest timecard selector inside home container
    homeContainer.appendChild(timecardSelector);

    // Append home container to body (or any other container)
    document.body.appendChild(homeContainer);

    setupButtonListeners('init-btns')

}









function thankyouVisual(){
    const thankYouConatiner = document.createElement('div')
    thankYouConatiner.id = "thankyouContainer"
    thankYouConatiner.className = "thankyouContainercs"


    const confirmationContainer = document.createElement('div')
    confirmationContainer.id = "confirmationContainer"
    confirmationContainer.className = "confirmationContainercs"

    const thankYouText = document.createElement('p')
    thankYouText.id = "thankyouTextid"
    thankYouText.className = "thankyouTextcs"
    thankYouText.textContent = "Thank you!"

    const punchAgainBtn = document.createElement('button')
    punchAgainBtn.id = "punchAgainBtn"
    punchAgainBtn.className = "punchAgainBtncs"
    punchAgainBtn.textContent = "Punch again"
    punchAgainBtn.addEventListener("click", () => {
        let authenticationData = {};
        let timeCardID = null;
        let activeProjects = null;
        let names = null;
        let selectedName = null;
        let selectedProjectId = null;
        let selectedProjectName = null;
        let authenticationStatus = null
        let userCoordinates = null;
        let timeCardOption = null;
        document.getElementById('thankyouContainer').remove()

        renderTimecardUI()


    })



    thankYouConatiner.appendChild(confirmationContainer)
    confirmationContainer.appendChild(thankYouText)
    confirmationContainer.appendChild(punchAgainBtn)

    
    document.body.appendChild(thankYouConatiner)

    
}




// Conole logs selection


// Make it so that all fet functions are handled by the dynamic fucntion
// Maker it so that theres a load screen whenever 
// Do a dummy "Oh yeah, its you test" to return a "this is the person". If it is, then the punch menu is generated. If not then, it's going to say
// Give it a delay so that we can test the "waiting for verification" loding screen
// Could not identify, please try again

// Gps coordinte revrial and verification
// 

// Intit
renderTimecardUI()
//  thankyouVisual()

// Projects avaible
// intializeProjectsAvaibleView(); // Kick things off when the page loads

// Name and facial scan
// intializeNamesAvaibleView()

 



