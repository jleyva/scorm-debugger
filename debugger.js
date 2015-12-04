
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

    });
})();

