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
        uint ethPerHour;

        // Array of the Hash of the active meetings
        bytes32[] activeMeetings;

        // Array of the Hash of completed meetings
        bytes32[] completedMeetings;
                
        bool exists;
    }

    // Meeting structure
    struct Meeting {
        address student;
        address teacher;
        string description;
        uint32 timeInEpoch; // When the session's gonna happen
        uint8 meetingDuration; // How long is the meeting going to be        
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

    mapping(address => Meeting[]) public myMeetings;

    // Arrays to store all known teachers, students, and tags
    string[] public tagsList;
    address[] public studentList;
    address[] public teacherList;

    // Initializes self as a teacher, or student
    // Once set you can't change this
    function initSelf(bool isTeacher, string name, string description, uint ethPerHour) public {
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

        // Can set rest via setPerson
        setPerson(msg.sender, name, description, ethPerHour);
    }

    // Sets person attribute
    function setPerson(address addr, string name, string description, uint ethPerHour) public {
        require(addr == msg.sender);

        Person storage user = users[addr];

        user.name = name;
        user.description = description;
        user.ethPerHour = ethPerHour;
    }

    // Get person attributes
    function getPerson(address addr) public constant returns (string, string, uint) {
        Person memory user = users[addr];
        return (user.name, user.description, user.ethPerHour);
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
        
        for (uint i = 0; i < ts.length; i++) {
            // Remove all existing association with tag
            prunePersonFromTag(addr, ts[i]);

            // Add new tags
            tags[ts[i]][users[addr].personType == PersonType.Teacher].push(addr);
        }        
    }

    // Prunes a person from a tag
    function prunePersonFromTag(address addr, bytes32 tag) private {
        // Get the address associated with the tags
        address[] storage addrOfTags = tags[tag][users[addr].personType == PersonType.Teacher];

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
}