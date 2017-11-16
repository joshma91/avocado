const Avocado = artifacts.require("./Avocado.sol");
const { fromAscii, prettyLog } = require("./utils");

contract("Avocado", accounts => {
  const [josh, kendrick, adrian] = accounts;

  // Test to set and retrieve teacher/student
  it("should return the teacher & student names", async () => {
    const instance = await Avocado.deployed();

    const teacher = {
      address: josh,
      name: "josh",
      description: "don't let Josh teach",
      weiPerHour: 1000000000000000, // 0.001ETH
      tags: ["Japanese", "Biology", "Memes"],
    };
    const student = {
      address: kendrick,
      name: "kendrick",
    };

    // Setting the teacher and student respectively
    instance.initSelf(
      true,
      teacher.name,
      teacher.description,
      teacher.weiPerHour,
      { from: teacher.address }
    );
    instance.initSelf(false, student.name, "", null, { from: student.address });

    // Placing some tags in for next test
    const tagsInBytes32 = teacher.tags.map(fromAscii);
    instance.setPersonTags(teacher.address, tagsInBytes32, { from: josh });

    // Fetch the persons back
    const teacherRes = await instance.getPerson(teacher.address);
    // console.log("teacherRes");
    // prettyLog(teacherRes);

    const studentRes = await instance.getPerson(student.address);
    // console.log("studentRes");
    // prettyLog(studentRes);

    // getPerson returns [String name, String, description, weiPerHour]
    assert.equal("josh", teacherRes[0]);
  });

  // This tests the tags system
  it("should return addresses with specified tag", async () => {
    const instance = await Avocado.deployed();

    // Make adrian an instructor so he can input tag
    instance.initSelf(true, "adrian", "adrian desc", 0, { from: adrian });
    instance.setPersonTags(adrian, [fromAscii("Japanese")], { from: adrian });

    // Get the instructor address with tag 'Japanese'
    const tagAddresses = await instance.filterByTag(
      fromAscii("Japanese"),
      true
    );
    console.log("the addresses with tag 'Japanese' are: ");
    prettyLog(tagAddresses);

    assert.deepEqual([josh, adrian], tagAddresses);
  });

  // This portion tests meetings creation/retrieval
  it("should return the meeting ID & description", async () => {
    const instance = await Avocado.deployed();
    const timestamp = 1510820193;

    instance.newMeeting(
      josh,
      kendrick,
      "learning japanese",
      timestamp,
      {value: 1000000000000000000}
    );

    // Retrieve meetingID by obtaining the sha256 hash
    const meetingID = await instance.convertToMeetingId(
      josh, 
      kendrick, 
      timestamp
    );
    console.log("the meetingID is: " + meetingID);

    // TODO: Complete the meeting 
    const completeMeeting = await instance.completeMeeting(meetingID, {from: josh, value: 1000000000000});

    // Check if the meeting is under josh's completed meetings
    const completedMeetingID = await instance.getCompletedMeetingIds(josh);
    assert.equal(completedMeetingID, meetingID);
    
    // PaymentSuccess Event returns args meetingID, teacher addr, student addr, payment amount and duration
    const meetingResult = completeMeeting.logs.find(function(x){return(x.event == "PaymentSuccess")});

    console.log("wei payed: " + meetingResult.args.value.toNumber());
    console.log("meeting duration in minutes: " + meetingResult.args.duration.toNumber()/60);
    
    // Check if the meeting description is the same as the one we used
    // getMeeting returns [address teacher, address student, string description, uint duration, uint weiSpent]
    const meetingDetails = await instance.getMeeting(meetingID);
    console.log("retrieved meeting description: " + meetingDetails[2]);

    assert.equal(meetingDetails[2], "learning japanese");
  });
});
