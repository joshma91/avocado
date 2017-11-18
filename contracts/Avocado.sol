pragma solidity ^0.4.17;

contract Avocado {
    address owner;

    // Constructor to initialize contract owner
    function Avocado() public {
        owner = msg.sender;
        // We will use position 0 to store empty tag
        tagsList.push(0x0);
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
        bool exists;
    }

    // Meeting structure
    struct Meeting {
        bytes32 meetingID; // sha256(concat(student, teacher, timestamp))
        address student;
        address teacher;
        string description;
        uint timestamp; // In epoch land
        uint duration; // How long is the meeting going to be  
        uint maxSpend;   // In wei
        uint weiSpent;   // In wei
    }

    // Reviews
    struct Rating {
        address addr;
        uint rating; // out of 5
        string description; // Short review description
    }

    // Private Messages
    struct Message {
        address from;        
        string content; // Can only send messages of 250 bytes long (like a tweet)        
    }

    // Hash of Meeting -> IsTeacher (Based on UserType) -> Review Object
    mapping(bytes32 => mapping(bool => Rating[])) public ratings;

    // Users using the platform
    mapping(address => Person) public users;

    // Tags to filter out users
    // string -> isTeacher (Based on user types) -> Addresses
    mapping(bytes32 => mapping(bool => address[])) public tags;
    mapping(bytes32 => uint) public tagIndex;

    // Private messages
    mapping(address => Message[]) public messages;

    // Top level Meeting mapping
    mapping(bytes32 => Meeting) public meetings;

    // Tracking meetingIDs by address
    mapping(address => bytes32[]) public activeMeetingIdsByUser;
    mapping(address => bytes32[]) public completedMeetingIdsByUser;

    // Arrays to store all known teachers, students, and tags
    bytes32[] public tagsList;
    address[] public studentList;
    address[] public teacherList;

    event PaymentSuccess(bytes32 translationID, address teacher, address student, uint value, uint duration);

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

    function newMeeting (address teacher, address student, string description, uint timestamp) public payable {
        Meeting memory m;
        m.meetingID = convertToMeetingId(teacher, student, timestamp);
        m.teacher = teacher;
        m.student = student;
        m.description = description;
        m.timestamp = timestamp;
        m.maxSpend = msg.value; // Student puts up ETH when creating the meeting = maxSpend

        // Set the top level meeting mapping, then the children teacher/student
        meetings[m.meetingID] = m;
        activeMeetingIdsByUser[teacher].push(m.meetingID);
        activeMeetingIdsByUser[student].push(m.meetingID);
    }

    // Sends message to person
    function sendMessage(address to, string content) public {        
        messages[to].push(
            Message({
                from: msg.sender,
                content: content                
            })
        );
    }

    // Get Message N
    function getMessage(uint128 n) public view returns (string, address) {
        Message[] memory m = messages[msg.sender];
        require(n < m.length);
        return (m[n].content, m[n].from);
    }

    // Gets user's total number of messages
    function getTotalMessages() public view returns (uint) {
        return messages[msg.sender].length;
    }

    // Modifier allowing only the users in the meeting to call
    modifier isUserInMeeting(bytes32 meetingID) {
        Meeting memory m = meetings[meetingID];
        require(msg.sender == m.teacher || msg.sender == m.student);
        _;
    }

    function completeMeeting (bytes32 meetingID) public payable isUserInMeeting(meetingID) {        
        Meeting storage m = meetings[meetingID];
        address teacher = m.teacher;
        address student = m.student;
        // Set the length of the meeting after completion in seconds
        m.duration = now - m.timestamp;  

        // Calculate cost
        // This probably produces a stupid high number, but will do time calcs later
        m.weiSpent = users[teacher].weiPerHour * m.duration/3600;

        pruneMeetingFromActive(meetingID, teacher);
        pruneMeetingFromActive(meetingID, student);

        completedMeetingIdsByUser[teacher].push(meetingID);
        completedMeetingIdsByUser[student].push(meetingID);

        // Transfer weis and deposit
        if (this.balance >= m.weiSpent) {
            teacher.transfer(m.weiSpent);

            PaymentSuccess(meetingID, teacher, student, m.weiSpent, m.duration);

            if (m.weiSpent < m.maxSpend) {
                student.transfer(m.maxSpend - m.weiSpent);
            }
        }
    }

    // Prune meetings
    function pruneMeetingFromActive(bytes32 meetingToDelete, address addr) public {        
        bytes32[] storage meetingIDs = activeMeetingIdsByUser[addr];

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
            addToTagsList(ts[i]);
        }
    }

    // Add unique tags to tagsList
    function addToTagsList(bytes32 tag) private {
        if (!inTagArray(tag)) {
            // Append
            tagIndex[tag] = tagsList.length;
            tagsList.push(tag);
        }
    }

    // Check to see if tag exists in the mapping already
    function inTagArray(bytes32 tag) private view returns (bool) {
        if (tagIndex[tag] > 0) {
            return true;
        }
        return false;
    }

    function getTagsList() public constant returns (bytes32[] ts) {
        ts = tagsList;
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
    
    // Getting list of completed meetings
    function getCompletedMeetingIds(address addr) public constant returns (bytes32[]) {
        return completedMeetingIdsByUser[addr];
    }

    // Dump meeting details given a meetingID
    function getMeeting(bytes32 meetingID) public constant returns (address teacher, address student, string description, uint duration, uint weiSpent) {
        Meeting memory m = meetings[meetingID];
        teacher = m.teacher;
        student = m.student;
        description = m.description;
        duration = m.duration;
        weiSpent = m.weiSpent;
    }
     
    // Get meeting Id given the parameters
    // Doesn't accept a struct as a function parameter, which is why I'm doing it this way
    function convertToMeetingId(address teacherAddr, address studentAddr, uint timestamp) public pure returns (bytes32) {
        return sha256(teacherAddr, studentAddr, timestamp);
    }
}