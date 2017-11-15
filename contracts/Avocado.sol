pragma solidity ^0.4.17;


contract Avocado {
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
    struct Meetings {
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
    mapping(bytes32 => mapping(bool => Ratings)) private ratings;

    // Users using the platform
    mapping(address => Person) users;

    // Tags to filter out users
    // string -> isTeacher (Based on user types) -> Addresses
    mapping(string => mapping(bool => address[])) tags;


    // Create a new person
    function setPerson(bool isTeacher, string name, string description, uint ethPerHour) public {
        Person storage user = users[msg.sender];

        require(user.exists == false);

        user.personType = (isTeacher) ? PersonType.Teacher : PersonType.Student;
        user.name = name;
        user.description = description;
        user.ethPerHour = ethPerHour;
        user.exists = true;
    }

    function getPerson() public constant returns (string, string, uint) {
        Person memory user = users[msg.sender];

        return (user.name, user.description, user.ethPerHour);
    }
}