const Avocado = artifacts.require("./Avocado.sol");
const { fromAscii, prettyLog, toAscii } = require("./utils");

contract("Avocado", accounts => {
  const [josh, kendrick, adrian] = accounts;

  it("should set and return the teacher & student names", async () => {
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
      description: "this is a description of a student"
    };

    // Convert teacher tags to bytes32
    const tagsInBytes32 = teacher.tags.map(fromAscii);

    // Setting the teacher and student respectively
    instance.initTeacher(
      teacher.name,
      teacher.description,
      teacher.weiPerHour,
      tagsInBytes32,
      { from: teacher.address }
    );
    
    instance.initStudent(
      student.name, 
      student.description,
      { from: student.address }
    );

    // Fetch the persons back
    const teacherRes = await instance.getPerson(teacher.address);
    const studentRes = await instance.getPerson(student.address);

    // getPerson returns [String name, String, description, weiPerHour]
    assert.equal("josh", teacherRes[0]);
    assert.equal("kendrick", studentRes[0]);
  });

  // This tests the tags system
  it("should return addresses with specified tag", async () => {
    const instance = await Avocado.deployed();

    // This is data for Adrian, the teacher
    const adrianObj = {
      isTeacher: true,
      address: adrian,
      name: "adrian",
      description: "adrian teaching description",
      weiPerHour: 1000000000000000, // 0.001ETH
      tags: ["Japanese"],
    };
    const adrianTagsInB32 = adrianObj.tags.map(fromAscii);

    // Create the person object for Adrian
    instance.initTeacher(
      adrianObj.name,
      adrianObj.description,
      adrianObj.weiPerHour,
      adrianTagsInB32,
      { from: adrianObj.address }
    );

    // Get the teacher address with tag 'Japanese'
    const tagAddresses = await instance.filterByTag(
      fromAscii("Japanese", "Memes"),
      true // isTeacher(bool)
    );

    // Note that josh teaches japanese as well
    assert.deepEqual([josh, adrian], tagAddresses);
  });

  // This portion tests meetings creation/retrieval
  it("should return the meetingID & description", async () => {
    const instance = await Avocado.deployed();

    const mtg = {
      teacher: josh,
      student: kendrick,
      description: "learning japanese",
      timestamp: 1510820193,
      maxSpend: 1000000000000000000,
    };

    // Create new meeting object
    instance.newMeeting(
      mtg.teacher,
      mtg.student,
      mtg.description,
      mtg.timestamp,
      { value: mtg.maxSpend }
    );

    // Retrieve meetingID by obtaining the sha256 hash
    const meetingID = await instance.convertToMeetingId(
      mtg.teacher,
      mtg.student,
      mtg.timestamp
    );

    // Complete the meeting (could be teacher or student), returns an event object
    const completeMeeting = await instance.completeMeeting(meetingID, {
      from: josh,
    });

    // Check if the meeting is under josh's completed meetings
    const completedMeetingID = await instance.getCompletedMeetingIds(josh);
    assert.equal(completedMeetingID, meetingID);

    // PaymentSuccess Event returns args meetingID, teacher addr, student addr, payment amount and duration
    const meetingResult = completeMeeting.logs.find(
      x => x.event === "PaymentSuccess"
    );

    // Check weiPayed is below maxSpend
    const weiPayed = meetingResult.args.value.toNumber();
    const belowMaxSpend = weiPayed < mtg.maxSpend;
    assert.equal(belowMaxSpend, true);

    console.log(
      "meeting duration in minutes: " +
        meetingResult.args.duration.toNumber() / 60
    );

    // Check if meeting description is the same as the one we used
    // getMeeting returns [address teacher, address student, string description, uint duration, uint weiSpent]
    const meetingDetails = await instance.getMeeting(meetingID);
    assert.equal(meetingDetails[2], mtg.description);
  });

  // Testing the messaging system
  it("should return the sent messages", async () => {
    const instance = await Avocado.deployed();

    const msg1 = {
      to: josh,
      from: kendrick,
      msg: "Yo, I want my lesson",
    };

    const msg2 = {
      to: kendrick,
      from: josh,
      msg: "Chill yo tits dawg, I gotchu",
    };

    const msg3 = {
      to: josh,
      from: kendrick,
      msg: "It's a hackathon fam",
    };

    instance.sendMessage(msg1.to, msg1.msg, { from: msg1.from });
    instance.sendMessage(msg2.to, msg2.msg, { from: msg2.from });
    instance.sendMessage(msg3.to, msg3.msg, { from: msg3.from });

    const joshMessageCount = await instance.getTotalMessages({ from: josh });
    assert.equal(joshMessageCount, 2);

    let joshMessages = [];
    // Retrieve Josh's messages
    for (i = 0; i < joshMessageCount; i++) {
      // Returns array of messages, first element is string, second is from address
      joshMessages[i] = await instance.getMessage(i, { from: josh });
    }

    const secondMsgSentToJosh = joshMessages[1][0];
    assert.equal("It's a hackathon fam", secondMsgSentToJosh);
  });

  it("should return a list of unique tags", async () => {
    const instance = await Avocado.deployed();
    
    const tagsInB32 = await instance.getTagsList();

    // There were 5 total tags entered above: 2 were duplicates
    // Initial tag in tagList is empty string 
    //so we expect 3+1 = 4 unique tags
    assert.equal(tagsInB32.length, 4)
  });
});
