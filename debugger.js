
(function() {
    // Elements table.
    var elementsTable;

    // SCORM API object.
    var API;
    function FindAPI(win) {
        var nFindAPITries = 0;
        var API = null;
        while ((win.API == null) && (win.parent != null) && (win.parent != win)) {
            nFindAPITries ++;
            if (nFindAPITries > 500) {
                alert("Error in finding API -- too deeply nested.");
                return null;
            }
            win = win.parent;
        }
        return win.API;
    }

    function initAPI() {
        if ((window.parent) && (window.parent != window)){
            API = FindAPI(window.parent);
        }
        if ((API == null) && (window.opener != null)){
            API = FindAPI(window.opener);
        }
        if (API == null) {
            alert("No API adapter found");
        }
        else {
            API.LMSInitialize("");
        }
    }

    // Load elements for auto-completion.
    var availableElements = [];
    $.each(dataModel, function(element, properties) {
        availableElements.push(element);
    });

    /**
     * Load the remote (only read) element values
     */
    function loadReadElements() {
        var value, description;
        $.each(dataModel, function(element, properties) {
            if (element.indexOf('.n.') === -1 && (properties.mod == 'rw' || properties.mod == 'r')) {
                if (typeof  dataModelDescription[element] != 'undefined') {
                    description = dataModelDescription[element].description;
                } else {
                    description = '';
                }
                value = getElement(element);
                if (typeof value == "string") {
                    value = value.replace(/,/g, ", ");
                }

                elementsTable.row.add([element, value, description]).draw();
            }
        });
        var objectivesCount = getElement("cmi.objectives._count");
        if (objectivesCount > 0) {
            for (var i = 0; i < objectivesCount; i++) {
                var objEl = ["id", "score.raw", "score.min", "score.max", "status"];
                objEl.forEach(function(child) {
                    element = "cmi.objectives." + i + "." + child;
                    value = getElement(element);
                    if (typeof value == "string") {
                        value = value.replace(/,/g, ", ");
                    }
                    elementsTable.row.add([element, value, ""]).draw();
                });
            }
        }
    }

    function displayElementInfo(element) {
        // Normalize element (replace .X. elements with .n. ones).
        element = element.replace(/.\d+./,".n.");
        $("#debugger-element-description").html('');
        if (typeof dataModel[element] != 'undefined') {
            var info = "<p><strong>Element information</strong></p>";
            if (typeof dataModelDescription[element] != 'undefined') {
                info += "<p>Data type: " + dataModelDescription[element].datatype + "</p>";
                info += "<p>Permissions: " + dataModelDescription[element].permissions + "</p>";
                info += "<p>Description: " + dataModelDescription[element].description + "</p>";
                $("#debugger-element-description").html(info);
            }
        }
    }

    function log(data, error) {
        var timeNow = new Date().toLocaleTimeString();
        // Error information.
        var errorString = "";
        if (error != "0") {
            errorString = " ERROR: " + API.LMSGetErrorString(error);
        }
        $("#log").prepend("<p>" + timeNow + ": " + data + errorString + "</p>");
    }

    /**
     * Get an element from the LMS
     * @param  {string} element element name
     * @return {number}         error number, 0 means OK
     */
    function getElement(element) {
        var result = API.LMSGetValue(element);
        var error = API.LMSGetLastError();
        log("Get element: " + element + " returned value was: " + result, error);
        return result;
    }

    /**
     * Save element in the LMS (not commiting the results)
     * @param  {string} element element name
     * @param  {string} value   element value
     * @return {number}         error number, 0 means OK
     */
    function setElement(element, value) {
        var result = API.LMSSetValue(element, value);
        var error = API.LMSGetLastError();
        log("Save element:" + element + " with value: " + value, error);
        return result;
    }

    function commitValues() {
        var result = API.LMSCommit("");
        var error = API.LMSGetLastError();
        log("LMSCommit called, returned: " + result, error);
        return;
    }

    function randomNumber(min, max) {
        return Math.floor(Math.random() * (max - min) + min);
    }

    function randomString() {
        return (Math.random() + 1).toString(36).substring(10);
    }

    function checkExpectedValues(output, values) {
        var value, error;

        for (var el in values) {
            value = API.LMSGetValue(el);
            error = API.LMSGetLastError();
            if (error != '0') {
                output.append('<p style="color: red">Error getting: ' + el +' with value ' + values[el] + '. ' + API.LMSGetErrorString(error) + '</p>');
            }
            if (value !== API.LMSGetValue(el)) {
                output.append('<p style="color: red">Error getting: ' + el +' expected value was' + values[el] + ', returned is: ' + value + '</p>');
            }
        }
    }

    function launchTests() {
        var output = $('#tests-output');
        // Get last error.
        if (API.LMSGetLastError() == '0') {
            output.append('<p>Last error OK</p>');
        }
        // Set some values.
        var statuses = ['passed', 'completed', 'failed', 'incomplete', 'browsed', 'not attempted'];
        var values = {
            'cmi.core.lesson_location': randomString(),
            'cmi.core.lesson_status': statuses[randomNumber(0, 5)],
            'cmi.core.score.raw': randomNumber(1, 10),
            'cmi.core.score.min': 0,
            'cmi.core.score.max': 10,
            'cmi.suspend_data': randomString(),
            'cmi.comments': randomString(),
            'cmi.student_preference.audio': randomNumber(1, 10),
            'cmi.student_preference.language': 'en',
            'cmi.student_preference.speed': randomNumber(1, 10),
            'cmi.student_preference.text': randomNumber(0, 1)
        };
        var value, error;

        for (var el in values) {
            API.LMSSetValue(el, values[el]);
            error = API.LMSGetLastError();

            if (error != '0') {
                output.append('<p style="color: red">Error setting: ' + el +' with value ' + values[el] + '. ' + API.LMSGetErrorString(error) + '</p>');
            }
        }
        output.append('<p>All values set</p>');

        // Get the values (and check everything is correct).
        checkExpectedValues(output, values);
        output.append('<p>All values retrieved</p>');

        // Commit the changes.
        API.LMSCommit("");
        error = API.LMSGetLastError();
        if (error != '0') {
            output.append('<p style="color: red">Error calling LMSCommit. ' + API.LMSGetErrorString(error) + '</p>');
        }
        output.append('<p>Values commited</p>');

        // Get again after commiting the changes.
        checkExpectedValues(output, values);
        output.append('<p>All values retrieved</p>');

        // Create some objectives.
        var objectivesCount = randomNumber(4, 10);
        var objectivesIds = {};

        values = {};
        for (var i=0; i<objectivesCount; i++) {
            values['cmi.objectives.' + i + '.id'] = randomString();
            objectivesIds[i] = values['cmi.objectives.' + i + '.id'];
            values['cmi.objectives.' + i + '.score.raw'] = randomNumber(1, 10);
            values['cmi.objectives.' + i + '.score.min'] = 0;
            values['cmi.objectives.' + i + '.score.max'] = 10;
            values['cmi.objectives.' + i + '.status'] = statuses[randomNumber(0, 5)];
        }

        for (el in values) {
            API.LMSSetValue(el, values[el]);
            error = API.LMSGetLastError();

            if (error != '0') {
                output.append('<p style="color: red">Error setting: ' + el +' with value ' + values[el] + '. ' + API.LMSGetErrorString(error) + '</p>');
            }
        }

        // Test the number of objectives created is correct.
        var lmsCount = API.LMSGetValue('cmi.objectives._count');
        if (lmsCount !== objectivesCount) {
            output.append('<p style="color: red">Expecting ' + objectivesCount+ ' objectives found ' + lmsCount + '</p>');
        } else {
            output.append('<p>Objectives count correct: ' + objectivesCount + '</p>');
        }

        // Check retrieved values.
        checkExpectedValues(output, values);
        output.append('<p>All objectives retrieved</p>');

        // Create some interactions.
        var interactionsCount = randomNumber(4, 10);
        var interactionsObjectivesCount = {};

        values = {};
        var types = ['true-false', 'choice', 'fill-in', 'matching', 'performance', 'sequencing', 'likert', 'numeric'];
        var results = ['correct', 'wrong', 'unanticipated', 'neutral'];
        for (var i=0; i<interactionsCount; i++) {
            values['cmi.interactions.' + i + '.id'] = randomString();
            values['cmi.interactions.' + i + '.time'] = randomNumber(10, 20) + ':' + randomNumber(10, 59) + ':' + randomNumber(10, 59);
            values['cmi.interactions.' + i + '.type'] = types[randomNumber(0, 7)];
            values['cmi.interactions.' + i + '.weighting'] = randomNumber(0, 1);
            values['cmi.interactions.' + i + '.student_response'] = randomNumber(0, 5);
            values['cmi.interactions.' + i + '.result'] = results[randomNumber(0, 3)];
            values['cmi.interactions.' + i + '.latency'] = randomNumber(10, 20) + ':' + randomNumber(10, 59) + ':' + randomNumber(10, 59);

            var tmpCount = randomNumber(0, objectivesCount);
            interactionsObjectivesCount[i] = tmpCount;
            for (var j=0; j < tmpCount; j++) {
                values['cmi.interactions.' + i + '.objectives.' + j + '.id'] = objectivesIds[j];
                values['cmi.interactions.' + i + '.correct_responses.' + j + '.pattern'] = randomString();
            }

        }

        for (el in values) {
            API.LMSSetValue(el, values[el]);
            error = API.LMSGetLastError();

            if (error != '0') {
                output.append('<p style="color: red">Error setting: ' + el +' with value ' + values[el] + '. ' + API.LMSGetErrorString(error) + '</p>');
            }
        }

        // Test the number of interactions created is correct.
        var lmsCount = API.LMSGetValue('cmi.interactions._count');
        if (lmsCount !== interactionsCount) {
            output.append('<p style="color: red">Expecting ' + interactionsCount+ ' interactions found ' + lmsCount + '</p>');
        } else {
            output.append('<p>Interactions count correct: ' + interactionsCount + '</p>');
        }

        for (i=0; i < interactionsCount; i++) {
            var lmsCount = API.LMSGetValue('cmi.interactions.'+i+'.objectives._count');
            if (lmsCount !== interactionsObjectivesCount[i]) {
                output.append('<p style="color: red">Expecting ' + interactionsObjectivesCount[i] + ' objectives in the interaction found ' + lmsCount + '</p>');
            } else {
                output.append('<p>Interaction objectives count correct: ' + interactionsObjectivesCount[i] + '</p>');
            }

            lmsCount = API.LMSGetValue('cmi.interactions.'+i+'.correct_responses._count');
            if (lmsCount !== interactionsObjectivesCount[i]) {
                output.append('<p style="color: red">Expecting ' + interactionsObjectivesCount[i] + ' correct responses in the interaction found ' + lmsCount + '</p>');
            } else {
                output.append('<p>Interaction correct responses count correct: ' + interactionsObjectivesCount[i] + '</p>');
            }
        }

    }

    // Set-up everything.
    $(document).ready(function(){
        initAPI();
        $("#options-tabs").tabs();

        logDialog = $("#log-dialog").dialog({
          position: { my: "right bottom", at: "right bottom", of: window },
          height: '300'
        });

        // Load remote elements (this can be slow).
        elementsTable = $('#elementstable').DataTable({paging: false});
        loadReadElements();

        $("#reload").button({
          icons: {
            primary: "ui-icon-refresh"
          }
        }).on('click', function(e) {
            elementsTable.clear();
            loadReadElements();
        });

        $("#show-log").button({
          icons: {
            primary: "ui-icon-info"
          }
        }).on('click', function(e) {
            if (logDialog.dialog("isOpen")) {
                logDialog.dialog("close");
            } else {
                logDialog.dialog("open");
            }
        });

        // Prepare the debugging tab.
        $("#element").autocomplete({
          source: availableElements
        });
        $("#set-value, #commit-value, #get-value").button({});

        $("#element").on("autocompleteselect", function(event, ui) {
            displayElementInfo($(this).val());
        });

        // Request value dialog.
        var dialog = $("#requestvalue").dialog({
            autoOpen: false,
            height: 200,
            width: 300,
            buttons: {
                "Save": function() {
                    setElement($("#element").val(), $("#element-value").val());
                    dialog.dialog( "close" );
                },
                Cancel: function() {
                    dialog.dialog( "close" );
                }
            },
        });

        // Auto submit on enter pressed.
        $("#element-value").keypress(function(e) {
            if(e.which == 13) {
                setElement($("#element").val(), $(this).val());
                dialog.dialog( "close" );
            }
        });

        // Save action
        $("#set-value").on('click', function(e) {
            dialog.dialog("open");
        });

        // Commit action
        $("#commit-value, #commit-common, #commit-interactions").on('click', function(e) {
            commitValues();
        });


        $("#get-value").on('click', function(e) {
            var val =  getElement($("#element").val());
            $("#debugger-element-value").html("<strong>Value: </strong>" + val);
        });

        // Commom operations.
        $( "#set-lesson-status" ).selectmenu({
            change: function( event, data ) {
                setElement('cmi.core.lesson_status', data.item.value);
            }
        });

        $( "#set-score" ).selectmenu({
            change: function( event, data ) {
                setElement('cmi.core.score.min', 0);
                setElement('cmi.core.score.max', 10);
                setElement('cmi.core.score.raw', data.item.value);
            }
        });

        $( "#set-exit" ).selectmenu({
            change: function( event, data ) {
                setElement('cmi.core.exit', data.item.value);
            }
        });

        $( "#set-nav-event" ).selectmenu({
            change: function( event, data ) {
                if (data.item.value) {
                    setElement('nav.event', data.item.value);
                    API.LMSFinish("");
                }
            }
        });

        // Interactions and objectives.
        var interactionsDialog = $("#new-interaction").dialog({
            autoOpen: false,
            height: 500,
            width: 400,
            buttons: {
                "Save": function() {
                    var prefix = "cmi.interactions." + $("#interaction-number").val() + ".";
                    setElement(prefix + "id", $("#interaction-id").val());
                    setElement(prefix + "time", $("#interaction-time").val());
                    setElement(prefix + "type", $("#interaction-type").val());
                    setElement(prefix + "weighting", $("#interaction-weighting").val());
                    setElement(prefix + "student_response", $("#interaction-student_response").val());
                    setElement(prefix + "result", $("#interaction-result").val());
                    setElement(prefix + "latency", $("#interaction-latency").val());
                    var i = 0;
                    $("#interaction-objectives").val().split(',').forEach(function (objectiveId) {
                        setElement(prefix + "objectives." + i + ".id", $.trim(objectiveId));
                        i++;
                    });
                    i = 0;
                    $("#interaction-correct-responses").val().split(',').forEach(function (pattern) {
                        setElement(prefix + "correct_responses." + i + ".pattern", $.trim(pattern));
                        i++;
                    });
                    interactionsDialog.dialog( "close" );
                },
                Cancel: function() {
                    interactionsDialog.dialog( "close" );
                }
            },
        });

        $("#create-interactions").on('click', function(e) {
            interactionsDialog.dialog("open");
            $("#interaction-number").val(getElement("cmi.interactions._count"));
        });

        var objectivesDialog = $("#new-objective").dialog({
            autoOpen: false,
            height: 500,
            width: 400,
            buttons: {
                "Save": function() {
                    var prefix = "cmi.objectives." + $("#objective-number").val() + ".";
                    setElement(prefix + "id", $("#objective-id").val());
                    setElement(prefix + "score.raw", $("#objective-score-raw").val());
                    setElement(prefix + "score.min", $("#objective-score-min").val());
                    setElement(prefix + "score.max", $("#objective-score-max").val());
                    setElement(prefix + "status", $("#objective-status").val());

                    objectivesDialog.dialog( "close" );
                },
                Cancel: function() {
                    objectivesDialog.dialog( "close" );
                }
            },
        });
        $("#create-objectives").on('click', function(e) {
            objectivesDialog.dialog("open");
            $("#objective-number").val(getElement("cmi.objectives._count"));
        });

        $("#launch-tests").button().on('click', function(e) {
            launchTests()
        });

    });
})();

