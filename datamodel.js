
var CMIString256 = '^[\\u0000-\\uFFFF]{0,255}$';
var CMIString4096 = '^[\\u0000-\\uFFFF]{0,4096}$';
var CMITime = '^([0-2]{1}[0-9]{1}):([0-5]{1}[0-9]{1}):([0-5]{1}[0-9]{1})(\.[0-9]{1,2})?$';
var CMITimespan = '^([0-9]{2,4}):([0-9]{2}):([0-9]{2})(\.[0-9]{1,2})?$';
var CMIInteger = '^\\d+$';
var CMISInteger = '^-?([0-9]+)$';
var CMIDecimal = '^-?([0-9]{0,3})(\.[0-9]*)?$';
var CMIIdentifier = '^[\\u0021-\\u007E]{0,255}$';
var CMIFeedback = CMIString256; // This must be redefined
var CMIIndex = '[._](\\d+).';

// Vocabulary Data Type Definition.
var CMIStatus = '^passed$|^completed$|^failed$|^incomplete$|^browsed$';
var CMIStatus2 = '^passed$|^completed$|^failed$|^incomplete$|^browsed$|^not attempted$';
var CMIExit = '^time-out$|^suspend$|^logout$|^$';
var CMIType = '^true-false$|^choice$|^fill-in$|^matching$|^performance$|^sequencing$|^likert$|^numeric$';
var CMIResult = '^correct$|^wrong$|^unanticipated$|^neutral$|^([0-9]{0,3})?(\.[0-9]*)?$';
var NAVEvent = '^previous$|^continue$';

// Children lists.
var cmi_children = 'core,suspend_data,launch_data,comments,objectives,student_data,student_preference,interactions';
var core_children = 'student_id,student_name,lesson_location,credit,lesson_status,entry,score,total_time,lesson_mode,exit,session_time';
var score_children = 'raw,min,max';
var comments_children = 'content,location,time';
var objectives_children = 'id,score,status';
var correct_responses_children = 'pattern';
var student_data_children = 'mastery_score,max_time_allowed,time_limit_action';
var student_preference_children = 'audio,language,speed,text';
var interactions_children = 'id,objectives,time,type,correct_responses,weighting,student_response,result,latency';

// Data ranges.
var score_range = '0#100';
var audio_range = '-1#100';
var speed_range = '-100#100';
var weighting_range = '-100#100';
var text_range = '-1#1';

// SCORM 1.2 data model.
var dataModel = {
    'cmi._children':{'mod':'r', 'writeerror':'402'},
    'cmi._version':{'mod':'r', 'writeerror':'402'},
    'cmi.core._children':{'mod':'r', 'writeerror':'402'},
    'cmi.core.student_id':{'mod':'r', 'writeerror':'403'},
    'cmi.core.student_name':{'mod':'r', 'writeerror':'403'},
    'cmi.core.lesson_location':{'format':CMIString256, 'mod':'rw', 'writeerror':'405'},
    'cmi.core.credit':{'mod':'r', 'writeerror':'403'},
    'cmi.core.lesson_status':{'format':CMIStatus, 'mod':'rw', 'writeerror':'405'},
    'cmi.core.entry':{'mod':'r', 'writeerror':'403'},
    'cmi.core.score._children':{'mod':'r', 'writeerror':'402'},
    'cmi.core.score.raw':{'format':CMIDecimal, 'range':score_range, 'mod':'rw', 'writeerror':'405'},
    'cmi.core.score.max':{'format':CMIDecimal, 'range':score_range, 'mod':'rw', 'writeerror':'405'},
    'cmi.core.score.min':{'format':CMIDecimal, 'range':score_range, 'mod':'rw', 'writeerror':'405'},
    'cmi.core.total_time':{'mod':'r', 'writeerror':'403'},
    'cmi.core.lesson_mode':{'mod':'r', 'writeerror':'403'},
    'cmi.core.exit':{'format':CMIExit, 'mod':'w', 'readerror':'404', 'writeerror':'405'},
    'cmi.core.session_time':{'format':CMITimespan, 'mod':'w', 'readerror':'404', 'writeerror':'405'},
    'cmi.suspend_data':{'format':CMIString4096, 'mod':'rw', 'writeerror':'405'},
    'cmi.launch_data':{'mod':'r', 'writeerror':'403'},
    'cmi.comments':{'format':CMIString4096, 'mod':'rw', 'writeerror':'405'},
    // deprecated evaluation attributes
    'cmi.evaluation.comments._count':{'mod':'r', 'writeerror':'402'},
    'cmi.evaluation.comments._children':{'mod':'r', 'writeerror':'402'},
    'cmi.evaluation.comments.n.content':{'pattern':CMIIndex, 'format':CMIString256, 'mod':'rw', 'writeerror':'405'},
    'cmi.evaluation.comments.n.location':{'pattern':CMIIndex, 'format':CMIString256, 'mod':'rw', 'writeerror':'405'},
    'cmi.evaluation.comments.n.time':{'pattern':CMIIndex, 'format':CMITime, 'mod':'rw', 'writeerror':'405'},
    'cmi.comments_from_lms':{'mod':'r', 'writeerror':'403'},
    'cmi.objectives._children':{'mod':'r', 'writeerror':'402'},
    'cmi.objectives._count':{'mod':'r', 'writeerror':'402'},
    'cmi.objectives.n.id':{'pattern':CMIIndex, 'format':CMIIdentifier, 'mod':'rw', 'writeerror':'405'},
    'cmi.objectives.n.score._children':{'pattern':CMIIndex, 'mod':'r', 'writeerror':'402'},
    'cmi.objectives.n.score.raw':{'pattern':CMIIndex, 'format':CMIDecimal, 'range':score_range, 'mod':'rw', 'writeerror':'405'},
    'cmi.objectives.n.score.min':{'pattern':CMIIndex, 'format':CMIDecimal, 'range':score_range, 'mod':'rw', 'writeerror':'405'},
    'cmi.objectives.n.score.max':{'pattern':CMIIndex, 'format':CMIDecimal, 'range':score_range, 'mod':'rw', 'writeerror':'405'},
    'cmi.objectives.n.status':{'pattern':CMIIndex, 'format':CMIStatus2, 'mod':'rw', 'writeerror':'405'},
    'cmi.student_data._children':{'mod':'r', 'writeerror':'402'},
    'cmi.student_data.mastery_score':{'mod':'r', 'writeerror':'403'},
    'cmi.student_data.max_time_allowed':{'mod':'r', 'writeerror':'403'},
    'cmi.student_data.time_limit_action':{'mod':'r', 'writeerror':'403'},
    'cmi.student_preference._children':{'mod':'r', 'writeerror':'402'},
    'cmi.student_preference.audio':{'format':CMISInteger, 'range':audio_range, 'mod':'rw', 'writeerror':'405'},
    'cmi.student_preference.language':{'format':CMIString256, 'mod':'rw', 'writeerror':'405'},
    'cmi.student_preference.speed':{'format':CMISInteger, 'range':speed_range, 'mod':'rw', 'writeerror':'405'},
    'cmi.student_preference.text':{'format':CMISInteger, 'range':text_range, 'mod':'rw', 'writeerror':'405'},
    'cmi.interactions._children':{'mod':'r', 'writeerror':'402'},
    'cmi.interactions._count':{'mod':'r', 'writeerror':'402'},
    'cmi.interactions.n.id':{'pattern':CMIIndex, 'format':CMIIdentifier, 'mod':'w', 'readerror':'404', 'writeerror':'405'},
    'cmi.interactions.n.objectives._count':{'pattern':CMIIndex, 'mod':'r', 'writeerror':'402'},
    'cmi.interactions.n.objectives.n.id':{'pattern':CMIIndex, 'format':CMIIdentifier, 'mod':'w', 'readerror':'404', 'writeerror':'405'},
    'cmi.interactions.n.time':{'pattern':CMIIndex, 'format':CMITime, 'mod':'w', 'readerror':'404', 'writeerror':'405'},
    'cmi.interactions.n.type':{'pattern':CMIIndex, 'format':CMIType, 'mod':'w', 'readerror':'404', 'writeerror':'405'},
    'cmi.interactions.n.correct_responses._count':{'pattern':CMIIndex, 'mod':'r', 'writeerror':'402'},
    'cmi.interactions.n.correct_responses.n.pattern':{'pattern':CMIIndex, 'format':CMIFeedback, 'mod':'w', 'readerror':'404', 'writeerror':'405'},
    'cmi.interactions.n.weighting':{'pattern':CMIIndex, 'format':CMIDecimal, 'range':weighting_range, 'mod':'w', 'readerror':'404', 'writeerror':'405'},
    'cmi.interactions.n.student_response':{'pattern':CMIIndex, 'format':CMIFeedback, 'mod':'w', 'readerror':'404', 'writeerror':'405'},
    'cmi.interactions.n.result':{'pattern':CMIIndex, 'format':CMIResult, 'mod':'w', 'readerror':'404', 'writeerror':'405'},
    'cmi.interactions.n.latency':{'pattern':CMIIndex, 'format':CMITimespan, 'mod':'w', 'readerror':'404', 'writeerror':'405'},
    'nav.event':{'format':NAVEvent, 'mod':'w', 'readerror':'404', 'writeerror':'405'}
};

var dataModelDescription = {
    "cmi.core._children": {
        "datatype": "student_id, student_name, lesson_location, credit, lesson_status, entry, score, total_time, lesson_mode, exit, session_time",
        "permissions": "Read only",
        "description": "Listing of supported data model elements"
    },
    "cmi.core.student_id": {
        "datatype": "CMIString (SPM: 255)",
        "permissions": "Read only",
        "description": "Identifies the student on behalf of whom the SCO was launched"
    },
    "cmi.core.student_name": {
        "datatype": "CMIString (SPM: 255)",
        "permissions": "Read only",
        "description": "Name provided for the student by the LMS"
    },
    "cmi.core.lesson_location": {
        "datatype": "CMIString (SPM: 255)",
        "permissions": "Read and write",
        "description": "The learner's current location in the SCO"
    },
    "cmi.core.credit": {
        "datatype": "'credit', 'no-credit'",
        "permissions": "Read only",
        "description": "Indicates whether the learner will be credited for performance in the SCO"
    },
    "cmi.core.lesson_status": {
        "datatype": "'passed', 'completed', 'failed', 'incomplete', 'browsed', 'not attempted'",
        "permissions": "Read and write",
        "description": "Indicates whether the learner has completed and satisfied the requirements for the SCO"
    },
    "cmi.core.entry": {
        "datatype": "'ab-initio', 'resume', ''",
        "permissions": "Read only",
        "description": "Asserts whether the learner has previously accessed the SCO"
    },
    "cmi.core.score_children": {
        "datatype": "raw,min,max",
        "permissions": "Read only",
        "description": "Listing of supported data model elements"
    },
    "cmi.core.score.raw": {
        "datatype": "CMIDecimal",
        "permissions": "Read and write",
        "description": "Number that reflects the performance of the learner relative to the range bounded by the values of min and max"
    },
    "cmi.core.score.max": {
        "datatype": "CMIDecimal",
        "permissions": "Read and write",
        "description": "Maximum value in the range for the raw score"
    },
    "cmi.core.score.min": {
        "datatype": "CMIDecimal",
        "permissions": "Read and write",
        "description": "Minimum value in the range for the raw score"
    },
    "cmi.core.total_time": {
        "datatype": "CMITimespan",
        "permissions": "Read only",
        "description": "Sum of all of the learner's session times accumulated in the current learner attempt"
    },
    "cmi.core.lesson_mode": {
        "datatype": "'browse', 'normal', 'review'",
        "permissions": "Read only",
        "description": "Identifies one of three possible modes in which the SCO may be presented to the learner"
    },
    "cmi.core.exit": {
        "datatype": "'time-out', 'suspend', 'logout', ''",
        "permissions": "Write only",
        "description": "Indicates how or why the learner left the SCO"
    },
    "cmi.core.session_time": {
        "datatype": "CMITimespan",
        "permissions": "Write only",
        "description": "Amount of time that the learner has spent in the current learner session for this SCO"
    },
    "cmi.suspend_data": {
        "datatype": "CMIString (SPM: 4096)",
        "permissions": "Read and write",
        "description": "Provides space to store and retrieve data between learner sessions"
    },
    "cmi.launch_data": {
        "datatype": "CMIString (SPM: 4096)",
        "permissions": "Read only",
        "description": "Data provided to a SCO after launch, initialized from the dataFromLMS manifest element"
    },
    "cmi.comments": {
        "datatype": "CMIString (SPM: 4096)",
        "permissions": "Read and write",
        "description": "Textual input from the learner about the SCO"
    },
    "cmi.comments_from_lms": {
        "datatype": "CMIString (SPM: 4096)",
        "permissions": "Read only",
        "description": "Comments or annotations associated with a SCO"
    },
    "cmi.objectives._children": {
        "datatype": "id,score,status",
        "permissions": "Read only",
        "description": "Listing of supported data model elements"
    },
    "cmi.objectives._count": {
        "datatype": "non-negative integer",
        "permissions": "Read only",
        "description": "Current number of objectives being stored by the LMS"
    },
    "cmi.objectives.n.id": {
        "datatype": "CMIIdentifier",
        "permissions": "Read and write",
        "description": "Unique label for the objective"
    },
    "cmi.objectives.n.score._children": {
        "datatype": "raw,min,max",
        "permissions": "Read only",
        "description": "Listing of supported data model elements"
    },
    "cmi.objectives.n.score.raw": {
        "datatype": "CMIDecimal",
        "permissions": "Read and write",
        "description": "Number that reflects the performance of the learner, for the objective, relative to the range bounded by the values of min and max"
    },
    "cmi.objectives.n.score.max": {
        "datatype": "CMIDecimal",
        "permissions": "Read and write",
        "description": "Maximum value, for the objective, in the range for the raw score"
    },
    "cmi.objectives.n.score.min": {
        "datatype": "CMIDecimal",
        "permissions": "Read and write",
        "description": "Minimum value, for the objective, in the range for the raw score"
    },
    "cmi.objectives.n.status": {
        "datatype": "'passed', 'completed', 'failed', 'incomplete', 'browsed', 'not attempted'",
        "permissions": "Read and write",
        "description": "Indicates whether the learner has completed or satisfied the objective"
    },
    "cmi.student_data._children": {
        "datatype": "mastery_score, max_time_allowed, time_limit_action",
        "permissions": "Read only",
        "description": "Listing of supported data model elements"
    },
    "cmi.student_data.mastery_score": {
        "datatype": "CMIDecimal",
        "permissions": "Read only",
        "description": "Passing score required to master the SCO"
    },
    "cmi.student_data.max_time_allowed": {
        "datatype": "CMITimespan",
        "permissions": "Read only",
        "description": "Amount of accumulated time the learner is allowed to use a SCO"
    },
    "cmi.student_data.time_limit_action": {
        "datatype": "exit,message,' 'exit,no message',' continue,message', 'continue, no message'",
        "permissions": "Read only",
        "description": "Indicates what the SCO should do when max_time_allowed is exceeded"
    },
    "cmi.student_preference._children": {
        "datatype": "audio,language,speed,text",
        "permissions": "Read only",
        "description": "Listing of supported data model elements"
    },
    "cmi.student_preference.audio": {
        "datatype": "CMISInteger",
        "permissions": "Read and write",
        "description": "Specifies an intended change in perceived audio level"
    },
    "cmi.student_preference.language": {
        "datatype": "CMIString (SPM: 255)",
        "permissions": "Read and write",
        "description": "The student's preferred language for SCOs with multilingual capability"
    },
    "cmi.student_preference.speed": {
        "datatype": "CMISInteger",
        "permissions": "Read and write",
        "description": "The learner's preferred relative speed of content delivery"
    },
    "cmi.student_preference.text": {
        "datatype": "CMISInteger",
        "permissions": "Read and write",
        "description": "Specifies whether captioning text corresponding to audio is displayed"
    },
    "cmi.interactions._children": {
        "datatype": "id,objectives,time,type,correct_responses,weighting,student_response,result,latency",
        "permissions": "Read only",
        "description": "Listing of supported data model elements"
    },
    "cmi.interactions._count": {
        "datatype": "CMIInteger",
        "permissions": "Read only",
        "description": "Current number of interactions being stored by the LMS"
    },
    "cmi.interactions.n.id": {
        "datatype": "CMIIdentifier",
        "permissions": "Write only",
        "description": "Unique label for the interaction"
    },
    "cmi.interactions.n.objectives._count": {
        "datatype": "CMIInteger",
        "permissions": "Read only",
        "description": "Current number of objectives (i.e., objective identifiers) being stored by the LMS for this interaction"
    },
    "cmi.interactions.n.objectives.n.id": {
        "datatype": "CMIIdentifier",
        "permissions": "Write only",
        "description": "Label for objectives associated with the interaction"
    },
    "cmi.interactions.n.time": {
        "datatype": "CMITime",
        "permissions": "Write only",
        "description": "Point in time at which the interaction was first made available to the student for student interaction and response"
    },
    "cmi.interactions.n.type": {
        "datatype": "'true-false', 'choice', 'fill-in', 'matching', 'performance', 'sequencing', 'likert', 'numeric'",
        "permissions": "Write only",
        "description": "Which type of interaction is recorded"
    },
    "cmi.interactions.n.correct_responses._count": {
        "datatype": "CMIInteger",
        "permissions": "Read only",
        "description": "Current number of correct responses being stored by the LMS for this interaction"
    },
    "cmi.interactions.n.correct_responses.n.pattern": {
        "datatype": "format depends on interaction type",
        "permissions": "Write only",
        "description": "One correct response pattern for the interaction"
    },
    "cmi.interactions.n.weighting": {
        "datatype": "CMIDecimal",
        "permissions": "Write only",
        "description": "Weight given to the interaction relative to other interactions"
    },
    "cmi.interactions.n.student_response": {
        "datatype": "format depends on interaction type",
        "permissions": "Write only",
        "description": "Data generated when a student responds to an interaction"
    },
    "cmi.interactions.n.result": {
        "datatype": "'correct', 'wrong', 'unanticipated', 'neutral', 'x.x [CMIDecimal]'",
        "permissions": "Write only",
        "description": "Judgment of the correctness of the learner response"
    },
    "cmi.interactions.n.latency": {
        "datatype": "CMITimespan",
        "permissions": "Write only",
        "description": "Time elapsed between the time the interaction was made available to the learner for response and the time of the first response"
    },
    "nav.event": {
        "datatype": "previous, continue",
        "permissions": "Write only",
        "description": "Force navigation to the previous or next SCO (only supported by Moodle)"
    }
};