pragma solidity ^0.4.17;

contract Avocado {
    address owner;

    // Constructor to initialize contract owner
    function Avocado() public {
        owner = msg.sender;
    }

    // Fallback function to send eth back if no data
    function () public payable {
        msg.sender.transfer(msg.value);
    }

    enum PersonType { Teacher, Student }

    // Person Structure
    struct Person {
        // Teacher or Student
        PersonType personType;        
        string name;        
        string description;                        
        uint weiPerHour;

        // Array of the Hash of the active meetings
        bytes32[] activeMeetings;

        // Array of the Hash of completed meetings
        bytes32[] completedMeetings;

        bool exists;
    }

    // Meeting structure
    struct Meeting {
        bytes32 meetingID; // sha256(concat(student, teacher, timestamp))
        address student;
        address teacher;
        string description;
        uint timestamp; // In epoch land
        uint meetingDuration; // How long is the meeting going to be  
        uint maxSpend;   // In wei
        uint weiSpent;   // In wei     
    }

    // Reviews
    struct Ratings {
        address addr;
        uint rating; // out of 5
        string description; // Short review description
    }

    // Hash of Meeting -> IsTeacher (Based on UserType) -> Review Object
    mapping(bytes32 => mapping(bool => Ratings[])) public ratings;

    // Users using the platform
    mapping(address => Person) public users;

    // Tags to filter out users
    // string -> isTeacher (Based on user types) -> Addresses
    mapping(bytes32 => mapping(bool => address[])) public tags;

    // Top level Meeting mapping
    mapping(bytes32 => Meeting) public meetings;

    // Tracking meetingIDs by address
    mapping(address => bytes32[]) public activeMeetingsByUser;
    mapping(address => bytes32[]) public completedMeetingsByUser;

    // Arrays to store all known teachers, students, and tags
    string[] public tagsList;
    address[] public studentList;
    address[] public teacherList;

    // Initializes self as a teacher, or student
    // Once set you can't change this
    function initSelf(bool isTeacher, string name, string description, uint weiPerHour) public {
        Person storage user = users[msg.sender];        

        // If user doesn't exist then append it to the global list
        require(!user.exists);
        
        // Push to globals
        if (isTeacher) {
            teacherList.push(msg.sender);
        } else {
            studentList.push(msg.sender);
        }
        
        // PersonType
        user.personType = (isTeacher) ? PersonType.Teacher : PersonType.Student;
        user.exists = true;

        // Can set rest via setPerson
        setPerson(msg.sender, name, description, weiPerHour);
    }

    // Sets person attribute
    function setPerson(address addr, string name, string description, uint weiPerHour) public {
        require(addr == msg.sender);

        Person storage user = users[addr];

        user.name = name;
        user.description = description;
        user.weiPerHour = weiPerHour;
    }

    function newMeeting (address teacher, address student, string description, uint maxSpend) public payable {
        Meeting memory m;
        m.meetingID = sha256(teacher, student, now);
        m.teacher = teacher;
        m.student = student;
        m.description = description;
        m.timestamp = now;  // uses block.timestamp - easier to use, but each block is ~20s so not the most accurate
        m.maxSpend = maxSpend;

        // Set the top level meeting mapping, then the children teacher/student
        meetings[m.meetingID] = m;
        activeMeetingsByUser[teacher].push(m.meetingID);
        activeMeetingsByUser[student].push(m.meetingID);

        // TODO: make function payable, and accept a max ETH spend from student
    }

    // Modifier allowing only the teacher or student to call
    modifier teacherOrStudentOnly(bytes32 meetingID) {
        Meeting memory m = meetings[meetingID];
        require(msg.sender == m.teacher || msg.sender == m.student);
        _;
    }

    function completeMeeting (bytes32 meetingID) public teacherOrStudentOnly(meetingID) {
        
        Meeting storage m = meetings[meetingID];
        address teacher = m.teacher;
        address student = m.student;
        // Set the length of the meeting after completion in seconds
        m.meetingDuration = now - m.timestamp;  

        // Calculate cost
        // This probably produces a stupid high number, but will do time calcs later
        m.weiSpent = users[teacher].weiPerHour * m.meetingDuration/3600;

        pruneMeetingFromActive(meetingID, teacher);
        pruneMeetingFromActive(meetingID, student);

        completedMeetingsByUser[teacher].push(meetingID);
        completedMeetingsByUser[student].push(meetingID);

        // Transfer weis 
        teacher.transfer(m.weiSpent);
        if (m.weiSpent < m.maxSpend) {
            student.transfer(m.maxSpend - m.weiSpent);
        }
    }

    function pruneMeetingFromActive(bytes32 meetingToDelete, address addr) public {
        
        bytes32[] storage meetingIDs = activeMeetingsByUser[addr];

        // Pop meetingID from active list
        for (uint i = 0; i < meetingIDs.length; i++) {
            if (meetingIDs[i] == meetingToDelete) {
                delete meetingIDs[i]; 
                break;               
            }
        }
    }

    // Get person attributes
    function getPerson(address addr) public constant returns (string, string, uint) {
        Person memory user = users[addr];
        return (user.name, user.description, user.weiPerHour);
    }

    // Gets addresses associated with a certain tag
    function filterByTag(bytes32 t, bool isTeacher) public constant returns (address[]) {
        return tags[t][isTeacher];
    }

    // Sets Person tag
    // Reason why this is a separate operation
    // Is because it's expensive (Is this the right way?)
    function setPersonTags(address addr, bytes32[] ts) public {        
        require(addr == msg.sender);
        
        bool isTeacher = users[addr].personType == PersonType.Teacher;

        for (uint i = 0; i < ts.length; i++) {
            // Remove all existing association with tag
            prunePersonFromTag(addr, ts[i]);

            // Add new tags
            tags[ts[i]][isTeacher].push(addr);
        }        
    }

    // Prunes a person from a tag
    function prunePersonFromTag(address addr, bytes32 tag) private {
        // Get the address associated with the tags
        bool isTeacher = users[addr].personType == PersonType.Teacher;

        address[] storage addrOfTags = tags[tag][isTeacher];

        // Pop user from it
        for (uint i = 0; i < addrOfTags.length; i++) {
            if (addrOfTags[i] == addr) {
                // Account for last element                
                addrOfTags[i] = addrOfTags[addrOfTags.length - 1];
                delete addrOfTags[i]; 
                break;               
            }
        }
    }
    
    // Getting list of completed meetings - size 10 array is arbitrary but must be fixed size
    function getCompletedMeetings(address addr) public constant returns (bytes32[10]) {
        bytes32[] completedMeetings = completedMeetingsByUser[addr];
        bytes32[10] memory outputArray;
        for (uint i = 0; i < completedMeetings.length; i++) {
            outputArray[i] = completedMeetings[i];
        }
        return outputArray; 
    }

    // Dump meeting details given a meetingID
    function getMeeting(bytes32 meetingID) public constant returns (address teacher, address student, string description, uint meetingDuration, uint weiSpent) {
        Meeting memory m = meetings[meetingID];
        teacher = m.teacher;
        student = m.student;
        description = m.description;
        meetingDuration = m.meetingDuration;
        weiSpent = m.weiSpent;
    }
     
}