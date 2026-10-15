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
        LOGINMESSAGE.textContent = "Student login accepted!";
    } else {
        console.log("Invalid login, try again");
        LOGINMESSAGE.textContent = "Invalid login, try again!";
    }
    console.log("Username: ", USERNAME);
    console.log("Login form submitted");
});
