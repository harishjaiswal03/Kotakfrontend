function connectHsm(token,sid)
{
    let url = "wss://mlhsm.kotaksecurities.com"; 
    userWS = new HSWebSocket(url);
    console.log(document.getElementById('channel_number').value)


    userWS.onopen = function () {
        consoleLog('[Socket]: Connected to "' + url + '"\n');
        let jObj = {};
        jObj["Authorization"] = token;
        jObj["Sid"] = sid; 
        jObj["type"] = "cn";
        userWS.send(JSON.stringify(jObj));
    }

    userWS.onclose = function () {
        consoleLog("[Socket]: Disconnected !\n");
    }

    userWS.onerror = function () {
        consoleLog("[Socket]: Error !\n");
    }


    userWS.onmessage = function (msg) {
        const result= JSON.parse(msg);
        consoleLog('[Res]: ' + msg + "\n");

        // Process the received data and update the HTML table
        displayData(result);
    }
}

// Maintain a map to store and update displayed data
const displayedDataMap = {};

let tkValues = []; // Array to store tk values

resumeandpause = function(typeRequest,channel_number) {
    let jObj = {};
    jObj["type"] = typeRequest;
    jObj["channelnums"] = channel_number.split(',').map(function (val) { return parseInt(val, 10); })
    if (userWS != null) {
        let req = JSON.stringify(jObj);
       userWS.send(req);
    }
}
let lowestSumDivValue = Infinity; // Set initial lowest value to positive infinity


// Function to update the lowest sum div
function updateLowestSumDiv(newValue) {
    const lowestSumDiv = document.getElementById('lowest-sum');
    lowestSumDiv.textContent = `${newValue.toFixed(2)}`;
}
 
function displayData(data) {
    let totalLtpSum = 0;

    // Assuming data is an array of objects with 'tk,' 'ltp,' and 'ftm0' properties
    const tableBody = document.querySelector('#data-table tbody');

    // Iterate through the data and update the displayedDataMap and totalLtpSum
    data.forEach(record => {
        const tk = record.tk;

        // Initialize the displayedDataMap if not already present
        if (!displayedDataMap[tk]) {
            tkValues.push(tk); // Collect tk values in the array

            displayedDataMap[tk] = {
                ltp: 0,
                time: '',
                checkboxChecked: false // Add a checkboxChecked property
            };
        }

        // Update the "ltp" and "time" in displayedDataMap
        if (record.iv)
            displayedDataMap[tk].ltp = record.iv ? parseFloat(record.iv) : displayedDataMap[tk].ltp;
        else
            displayedDataMap[tk].ltp = record.ltp ? parseFloat(record.ltp) : displayedDataMap[tk].ltp;

        displayedDataMap[tk].time = record.ftm0;
        // Restore checkbox state
        displayedDataMap[tk].checkboxChecked = displayedDataMap[tk].checkboxChecked || false;

        // Update the totalLtpSum
        //totalLtpSum += displayedDataMap[tk].ltp;
    });


    //tkValues.forEach(record => {
       
    //    // Update the totalLtpSum
    //    totalLtpSum += displayedDataMap[record].ltp;
    //});




    // Clear existing rows
    tableBody.innerHTML = '';

    // Iterate through the displayedDataMap and add rows to the table
    Object.entries(displayedDataMap).forEach(([tk, data]) => {
        // Skip if tk is undefined
        
        const row = document.createElement('tr');
        const tkCell = document.createElement('td');
        const ltpCell = document.createElement('td');
        const ltpSumCell = document.createElement('td');
        const timeCell = document.createElement('td');
        const checkboxCell = document.createElement('td');

        // Create a checkbox and set its id and checked property
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.id = `checkbox_${tk}`;
        checkbox.checked = data.checkboxChecked; // Restore checkbox state

        // Add an event listener to update the displayedDataMap when checkbox state changes
        checkbox.addEventListener('change', () => {
            displayedDataMap[tk].checkboxChecked = checkbox.checked;
            // You can add additional logic here based on checkbox state change
        });


        

        if (tk === 'undefined') {
            //return;


            tkCell.textContent = 'Sum';
            ltpCell.textContent = '';
            
            ltpSumCell.textContent = totalLtpSum.toFixed(2);
            timeCell.textContent = '';

            checkboxCell.appendChild(checkbox);
            row.appendChild(tkCell);
            row.appendChild(ltpCell);
            row.appendChild(ltpSumCell);
            row.appendChild(timeCell);
            row.appendChild(checkboxCell);
        }
        else {

            tkCell.textContent = tk;
            ltpCell.textContent = data.ltp.toFixed(2);
            if (displayedDataMap[tk].checkboxChecked)
                totalLtpSum += displayedDataMap[tk].ltp;
            ltpSumCell.textContent = '';
            timeCell.textContent = data.time;

            checkboxCell.appendChild(checkbox);

            row.appendChild(tkCell);
            row.appendChild(ltpCell);
            row.appendChild(ltpSumCell);
            row.appendChild(timeCell);
            row.appendChild(checkboxCell);
        }

        tableBody.appendChild(row);


       
    });




    tkValues.forEach((record, index) => {
        if (record === undefined) {
            return;
        }

        // Check if the checkbox is ticked for the current record
        const checkbox = document.getElementById(`checkbox_${record}`);

        if (checkbox.checked) {
            // Update the totalLtpSum only if the checkbox is ticked
            totalLtpSum += displayedDataMap[record].ltp;
        }


        // Check if the current record is the last one
        if (index === tkValues.length - 2) {
            let lowestSumDivValue = parseFloat(document.getElementById('lowest-sum').textContent) || 0;

            // Check if the new totalLtpSum is the lowest, update the value and display
            if (lowestSumDivValue == 0) {
                lowestSumDivValue = totalLtpSum;
                //updateLowestSumDiv(lowestSumDivValue);
                document.getElementById('lowest-sum').textContent = lowestSumDivValue;
            }

            if (totalLtpSum < lowestSumDivValue) {
                lowestSumDivValue = totalLtpSum;
                //updateLowestSumDiv(lowestSumDivValue);
                document.getElementById('lowest-sum').textContent = lowestSumDivValue;

            }
        }
    });
}


//// Function to update the lowest sum div
//function updateLowestSumDiv(value) {
//    document.getElementById('lowest-sum').textContent = value.toFixed(2); // Display the value with two decimal places
//}

function subscribe_scrip(typeRequest,scrips,channel_number)
{
	//  mws ifs dps	
    let jObj = {"type":typeRequest, "scrips":scrips, "channelnum":channel_number};
    userWS.send(JSON.stringify(jObj));
}

function connectHsi(token,sid,handshakeServerId)
{
    let url = "wss://mlhsi.kotaksecurities.com/realtime?sId="+handshakeServerId;  
    hsWs = new HSIWebSocket(url);

    hsWs.onopen = function () {
        consoleLog1('[Socket]: Connected to "' + url + '"\n');

        let hsijObj = {};
        hsijObj["type"] = "cn";
        hsijObj["Authorization"] = token;
        hsijObj["Sid"] = sid;
        hsijObj["source"] = "WEB";
        hsWs.send(JSON.stringify(hsijObj));
    }

    hsWs.onclose = function () {
        consoleLog1("[Socket]: Disconnected !\n");
    }

    hsWs.onerror = function () {
        consoleLog1("[Socket]: Error !\n");
    }

    hsWs.onmessage = function (msg) {
        consoleLog1('[Res]: ' + msg + "\n");
    }
}
