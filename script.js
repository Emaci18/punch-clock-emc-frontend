// Makes the selected radio biutton true when selected

function getTs() {
  const currentTime = new Date();

  // Get the current hours, minutes, and seconds
  const hours = currentTime.getHours();
  const minutes = currentTime.getMinutes();
  const seconds = currentTime.getSeconds();

  // Log the time
  return `${hours}:${minutes}:${seconds}`;
}

function toggleRadioButtonValue(selectedId) {
  const radioButtons = document.querySelectorAll('input[name="color"]');
  radioButtons.forEach((button) => {
    if (button.id === selectedId) {
      button.value = "true";
    } else {
      button.value = "false";
    }
  });
}

// to select items
function nameButtonSelector(selectedId) {
  const radioButtons = document.querySelectorAll(".punch-options");

  radioButtons.forEach((button) => {
    if (button.id === selectedId) {
      button.value = "true";
      button.style.backgroundColor = "lightblue";
    } else {
      button.value = "false";
      button.style.backgroundColor = "darkblue";
    }
  });
}

function verifyCompleteBlockInfo(className) {
  // used to check if the fields have been filled in
  const nameSelections = document.querySelectorAll(className);

  let interationVerification = [];

  let elementIds = [];

  for (let name of nameSelections) {
    elementIds.push(name.id);
  }
  for (let elementId of elementIds) {
    let button = document.getElementById(elementId);

    let buttonStatus = button.value;
    interationVerification.push(buttonStatus);
  }

  if (!interationVerification.includes("true")) {
    if (className == ".punch-name-js") {
      return false;
    } else if (className == ".punch-id-js") {
      return false;
    }
  } else {
    return true;
  }
}

function completeInfromationChecker() {
  const nameVerify = verifyCompleteBlockInfo(".punch-name-js");
  const timeCardAction = verifyCompleteBlockInfo(".punch-id-js");
  if (nameVerify == false && timeCardAction == false) {
    alert("Please fill required fields");
  } else if (nameVerify == false) {
    alert("Please select name");
  } else if (timeCardAction == false) {
    alert("Please select time card action");
  } else if (nameVerify == true && timeCardAction == true) {
    const timeCardData = getTimeCardData(".punch-name-js");
    sendData(timeCardData);
    alert("Thank you");
  }
}

function getTimeCardActio(className) {
  const timeCardSelections = document.querySelectorAll(className);

  let elementIds = [];

  for (let dataSelection of timeCardSelections) {
    elementIds.push(dataSelection.id);
  }
  for (let elementId of elementIds) {
    let button = document.getElementById(elementId);

    let buttonStatus = button.value;
    if (buttonStatus == "true") {
      const timeCardAction = button.id;

      return timeCardAction;
    }
  }
}

function getTimeCardData(className) {
  const nameSelections = document.querySelectorAll(className);

  let elementIds = [];

  for (let nameSelection of nameSelections) {
    elementIds.push(nameSelection.id);
  }
  for (let elementId of elementIds) {
    let button = document.getElementById(elementId);

    let buttonStatus = button.value;
    if (buttonStatus == "true") {
      const nameSelection = button.nextSibling.textContent.trim();

      const timeCardSelection = getTimeCardActio(".punch-id-js");

      const ts = getTs();

      // employee = punch_data["name"]
      // time_card_action = punch_data["timeCardAction"]
      // ts = punch_data["ts"]

      return { name: nameSelection, timeCardAction: timeCardSelection, ts: ts };
    }
  }
}

function sendData(timeCardData) {
  const url = "http://192.168.1.167:5000/addToTimeSheet"; // URL for the API endpoint

  // const timeCardData = {
  //   name: "John Doe",
  //   age: 30,
  // };

  fetch(url, {
    method: "POST", // HTTP method
    headers: {
      "Content-Type": "application/json", // Indicating that the request body contains JSON data
    },
    body: JSON.stringify(timeCardData), // Convert the JavaScript object to a JSON string
  })
    .then((response) => response.json()) // Parse the JSON response
    .then((data) => console.log("Success:", data)) // Handle the response data
    .catch((error) => console.error("Error:", error)); // Handle errors
}

function submitForm() {
  completeInfromationChecker();
  const timeCardData = getTimeCardData(".punch-name-js");
  
}


const getLocationBtn = document.getElementById('getLocationBtn');
const display = document.getElementById('locationDisplay');



const submitBtn = document.getElementById('btn-submit');
submitBtn.disabled = true;
submitBtn.style.backgroundColor = "red";


// Listens for the GPS coordinates

getLocationBtn.addEventListener('click', () => {
  // Check if geolocation is supported
  if (!navigator.geolocation) {
    display.textContent = 'Geolocation is not supported by your browser.';
    return;
  }

  // Request user's location
  navigator.geolocation.getCurrentPosition(
    (position) => {
      const latitude = position.coords.latitude;
      const longitude = position.coords.longitude;
      // Insert desired GPS

      if (latitude == "00.00000" && longitude == "-000.000000"){
        console.log("GPS matches")

        submitBtn.disabled = false;
        submitBtn.style.backgroundColor = "green";
      }

    },
    (error) => {
      // Handle possible errors
      switch(error.code) {
        case error.PERMISSION_DENIED:
          display.textContent = "User denied the request for Geolocation.";
          break;
        case error.POSITION_UNAVAILABLE:
          display.textContent = "Location information is unavailable.";
          break;
        case error.TIMEOUT:
          display.textContent = "The request to get user location timed out.";
          break;
        default:
          display.textContent = "An unknown error occurred.";
          break;
      }
    }
  );
});