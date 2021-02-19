function submitPsychSheet() {
    const pdfInput = document.querySelector("#pdfInput");
    const teamMappingInput = document.querySelector("#relayMappings");

    if (!pdfInput.files[0]) {
        alert("No file submitted!");
        return;
    }

    const teamMappingLines = teamMappingInput.value.split("\n");
    const teamMappings = [];

    teamMappingLines.forEach(textLine => {
        if (textLine.trim() === "") return;
        const split = textLine.split(":");
        const individualName = split[0].trim();
        const relayName = split[1] ? split[1].trim() : undefined;
        teamMappings.push({
            teamID: individualName,
            individualName,
            relayName
        });
    });

    const meetInfo = {
        teamInfo: teamMappings
    };

    const formData = new FormData();
    formData.append("meetInfo", JSON.stringify(meetInfo));
    formData.append("psychsheet", pdfInput.files[0]);

    fetch("http://localhost:3000/analysis/psychsheet", {
        method: "POST",
        body: formData
    })
        .then(response => response.json())
        .then(result => {
            showResults(result);
        })
        .catch(error => {
            alert("Error sending API request");
            console.log(error);
        });

    return false;
}

function showResults(meetData) {
    const eventEntriesHtml = [];
    const outputHtml = [];
    for (let i = 0; i < meetData.meet.eventEntries.length; i++) {
        const eventEntry = meetData.meet.eventEntries[i];
        const event = eventEntry.event;
        const headerString = `Event ${event.eventNum}: ${event.gender} ${event.distance} ${event.stroke} ${event.isRelay ? "Relay" : ""}`;
        const readableEntries = eventEntry.entries.map(getReadableFormat);
        const table = buildHtmlTable(readableEntries.sort((a, b) => { return a.position - b.position; })).outerHTML;
        const cardHtml = `
            <h5>
                ${headerString}
            </h5>
            ${table}
        `;
        eventEntriesHtml.push(cardHtml);
    }
    const entryElement = document.querySelector("#entries");
    entryElement.innerHTML = eventEntriesHtml.join("\n");

    outputHtml.push("<h5>Team Points</h5>");
    for (const [gender, value] of Object.entries(meetData.teamPoints)) {
        if (value.length === 0) continue;
        const table = buildHtmlTable(value.sort((a, b) => { return b.points - a.points; })).outerHTML;
        outputHtml.push(`
            <h6>${gender}</h6>
            ${table}
        `);
    }

    outputHtml.push("<h5>Errors</h5>");
    outputHtml.push(`<p>${JSON.stringify(meetData.errors, undefined, 2)}</p>`);

    const outputElement = document.querySelector("#output");
    outputElement.innerHTML = outputHtml.join("\n");
}

function getReadableFormat(entry) {
    const result = { ...entry };
    if (entry.name) result.name = `${entry.name.lastName}, ${entry.name.firstName}`;
    if (entry.seedTime && result.seedTime !== "NT") result.seedTime = `${entry.seedTime.min !== 0 ? entry.seedTime.min + ":" : ""}${entry.seedTime.sec.toString().padStart(2, 0)}.${entry.seedTime.frac.toString().padStart(2, 0)}`;
    return result;
}

// Below code comes from StackOverflow at https://stackoverflow.com/questions/5180382/convert-json-data-to-a-html-table

var _table_ = document.createElement("table"),
    _tr_ = document.createElement("tr"),
    _th_ = document.createElement("th"),
    _td_ = document.createElement("td");

// Builds the HTML Table out of myList json data from Ivy restful service.
function buildHtmlTable(arr) {
    var table = _table_.cloneNode(false),
        columns = addAllColumnHeaders(arr, table);
    table.setAttribute("class", "table");
    for (var i = 0, maxi = arr.length; i < maxi; ++i) {
        var tr = _tr_.cloneNode(false);
        for (var j = 0, maxj = columns.length; j < maxj; ++j) {
            var td = _td_.cloneNode(false);
            cellValue = arr[i][columns[j]];
            td.appendChild(document.createTextNode(arr[i][columns[j]] || ""));
            tr.appendChild(td);
        }
        table.appendChild(tr);
    }
    return table;
}

// Adds a header row to the table and returns the set of columns.
// Need to do union of keys from all records as some records may not contain
// all records
function addAllColumnHeaders(arr, table) {
    var columnSet = [],
        tr = _tr_.cloneNode(false);
    for (var i = 0, l = arr.length; i < l; i++) {
        for (var key in arr[i]) {
            if (arr[i].hasOwnProperty(key) && columnSet.indexOf(key) === -1) {
                columnSet.push(key);
                var th = _th_.cloneNode(false);
                th.setAttribute("scope", "col");
                th.appendChild(document.createTextNode(key));
                tr.appendChild(th);
            }
        }
    }
    table.appendChild(tr);
    return columnSet;
}
