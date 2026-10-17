console.log("Library Locker System initialized");

const LOGINFORM = document.getElementById("loginForm");

console.log(LOGINFORM);

LOGINFORM.addEventListener("submit", function(event) {
    event.preventDefault();
    const USERNAME = document.getElementById("inputUsername").value;
    const PASSWORD = document.getElementById("inputPassword").value;
    const LOGINMESSAGE = document.getElementById("loginMessage");
    const STUDENT_IDS = ["1023402", "1023752", "1023847", "1023731", "1023227",	"1023327", "1023530", "1023256", "1023164", "1023887", "1023750", "1023288", "1023337", "1023772", "1023721", "1023117"];
    if (STUDENT_IDS.includes(USERNAME) && PASSWORD === "LIBDEFAULT") {
        console.log("Student login accepted!");
        LOGINMESSAGE.textContent = "Student login accepted";

        document.getElementById("lockerSection").hidden = false;
    }
    console.log("Username: ", USERNAME);
    console.log("Login form submitted");
});

const LOCKERGRID = document.getElementById("lockerGrid");

for (let i = 1; i<= 24; i++) {
    const LOCKER = document.createElement("button");

    LOCKER.textContent = `Locker ${i}`;
    LOCKER.type = "button";
    LOCKER.classList.add("locker");

    if (i % 3 === 1) {
        LOCKER.classList.add("locker-free");
    } else if (i % 3 === 2) {
        LOCKER.classList.add("locker-occupied");
    } else {
        LOCKER.classList.add("locker-locked");
    }

    LOCKERGRID.appendChild(LOCKER);

    LOCKER.addEventListener("click", function() {
        if (LOCKER.classList.contains("locker-occupied")) {
            alert("THIS LOCKER IS BEING USED BY SOMEONE, OPT CLOSE TO CANCEL THE ALERT!");
        } else if (LOCKER.classList.contains("locker-locked")) {
            alert("THIS LOCKER IS NOW UNAVAILABLE AT THE MOMENT");
        } else {
                    const LOCKERACTION = document.getElementById("lockerAction");
        const SELECTEDLOCKERTITLE = document.getElementById("selectedLockerTitle");

        SELECTEDLOCKERTITLE.textContent = "You have chosen " + LOCKER.textContent;
        LOCKERACTION.hidden = false;
        }
    });

}


const STOREDDONEBUTTON = document.getElementById("storedDoneButton");

STOREDDONEBUTTON.addEventListener("click", function() {
    alert("You have finished to rent a locker, the system automatically kick your account now!");

    document.getElementById("lockerAction").hidden = true;
    document.getElementById("lockerSection").hidden = true;

    document.getElementById("inputUsername").value = "";
    document.getElementById("inputPassword").value = "";
    document.getElementById("loginMessage").textContent = "";
});


