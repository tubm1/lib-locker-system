console.log("Library Locker System initialized");

const LOGINFORM = document.getElementById("loginForm");

// Load saved locker data, or create the initial demo state.
let LOCKERS = [];

let CURRENTSTUDENT = null;
let SELECTEDLOCKER = null;

console.log(LOGINFORM);


LOGINFORM.addEventListener("submit", async function(event) {
    event.preventDefault();

    const USERNAME = document.getElementById("inputUsername").value.trim();
    const PASSWORD = document.getElementById("inputPassword").value;
    const LOGINMESSAGE = document.getElementById("loginMessage");

    try {
        const RESPONSE = await fetch("/api/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                username: USERNAME,
                password: PASSWORD
            })
        });

        const DATA = await RESPONSE.json();

        if (!RESPONSE.ok) {
            LOGINMESSAGE.textContent =
                DATA.message || "Đăng nhập thất bại. Vui lòng thử lại.";
            return;
        }

        if (DATA.user.role !== "student") {
            LOGINMESSAGE.textContent =
                "Tài khoản hợp lệ nhưng chức năng admin chưa được kết nối.";
            return;
        }

        CURRENTSTUDENT = DATA.user.username;

        LOGINMESSAGE.textContent = "Đăng nhập thành công.";

        const MYLOCKER = LOCKERS.find(function(locker) {
            return locker.owner === CURRENTSTUDENT;
        });

        if (MYLOCKER) {
            SELECTEDLOCKER = MYLOCKER;

            document.getElementById("lockerSection").hidden = false;
            document.getElementById("lockerGrid").hidden = true;
            document.getElementById("lockerAction").hidden = true;

            document.getElementById("existingLockerAction").hidden = false;
            document.getElementById("existingLockerTitle").textContent =
                "Bạn đang sở hữu Locker " + MYLOCKER.id;
        } else {
            document.getElementById("lockerSection").hidden = false;
            document.getElementById("lockerGrid").hidden = false;
            document.getElementById("lockerAction").hidden = true;
            document.getElementById("existingLockerAction").hidden = true;

            renderLockers();
        }
    } catch (error) {
        console.error("Login request failed:", error);
        LOGINMESSAGE.textContent =
            "Không thể kết nối đến máy chủ. Vui lòng thử lại.";
    }
});

const LOCKERGRID = document.getElementById("lockerGrid");

async function loadLockers() {
    try {
        const RESPONSE = await fetch("/api/lockers");
        const DATA = await RESPONSE.json();

        if (!RESPONSE.ok) {
            throw new Error("Không thể tải danh sách tủ.");
        }

        LOCKERS = DATA;
        renderLockers();

        console.log("Đã tải danh sách tủ từ database:", LOCKERS);
    } catch (error) {
        console.error("Lỗi khi tải danh sách tủ:", error);
        alert("Không thể tải danh sách tủ. Vui lòng thử lại.");
    }
}

function renderLockers() {
    LOCKERGRID.innerHTML = "";

    LOCKERS.forEach(function(locker) {
        const LOCKERBUTTON = document.createElement("button");

        LOCKERBUTTON.textContent = `Locker ${locker.id}`;
        LOCKERBUTTON.type = "button";
        LOCKERBUTTON.classList.add("locker");

        if (locker.status === "FREE") {
            LOCKERBUTTON.classList.add("locker-free");
        } else if (locker.status === "OCCUPIED") {
            LOCKERBUTTON.classList.add("locker-occupied");
        } else {
            LOCKERBUTTON.classList.add("locker-locked");
        }

        LOCKERBUTTON.addEventListener("click", function() {
            if (locker.status === "OCCUPIED") {
                alert("TỦ NÀY ĐÃ CÓ NGƯỜI GỬI, BẤM CLOSE ĐỂ ĐÓNG HỘP THOẠI");
                return;
            }

            if (locker.status === "LOCKED") {
                alert("TỦ HIỆN ĐANG KHÓA");
                return;
            }

            const LOCKERACTION = document.getElementById("lockerAction");
            const SELECTEDLOCKERTITLE = document.getElementById("selectedLockerTitle");

            SELECTEDLOCKER = locker;

            SELECTEDLOCKERTITLE.textContent = "Bạn đã chọn Locker " + locker.id;
            LOCKERACTION.hidden = false;
        });

        LOCKERGRID.appendChild(LOCKERBUTTON);
    });
}

loadLockers();



const STOREDDONEBUTTON = document.getElementById("storedDoneButton");


STOREDDONEBUTTON.addEventListener("click", function() {
    if (!CURRENTSTUDENT || !SELECTEDLOCKER) {
        alert("Please log in and select a locker first.");
        return;
    }

    // Save the student as the owner of this locker.
    SELECTEDLOCKER.status = "OCCUPIED";
    SELECTEDLOCKER.owner = CURRENTSTUDENT;

    saveLockers();
    renderLockers();

    alert("You have finished storing your belongings. You will now be logged out.");

    // Hide the locker interface.
    document.getElementById("lockerAction").hidden = true;
    document.getElementById("lockerSection").hidden = true;

    // Clear login information.
    document.getElementById("inputUsername").value = "";
    document.getElementById("inputPassword").value = "";
    document.getElementById("loginMessage").textContent = "";

    // Reset the current session.
    CURRENTSTUDENT = null;
    SELECTEDLOCKER = null;
});

const ADDMOREITEMSBUTTON = document.getElementById("addMoreItemsButton");


STOREDDONEBUTTON.addEventListener("click", async function() {
    if (!CURRENTSTUDENT || !SELECTEDLOCKER) {
        alert("Vui lòng đăng nhập và chọn tủ trước.");
        return;
    }

    try {
        const RESPONSE = await fetch(
            `/api/lockers/${SELECTEDLOCKER.id}/claim`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                }
            }
        );

        const DATA = await RESPONSE.json();

        if (!RESPONSE.ok) {
            alert(DATA.message || "Không thể nhận tủ.");
            await loadLockers();
            return;
        }

        await loadLockers();

        alert("Bạn đã gửi đồ xong. Hệ thống sẽ đăng xuất bạn.");

        document.getElementById("lockerAction").hidden = true;
        document.getElementById("lockerSection").hidden = true;

        document.getElementById("inputUsername").value = "";
        document.getElementById("inputPassword").value = "";
        document.getElementById("loginMessage").textContent = "";

        CURRENTSTUDENT = null;
        SELECTEDLOCKER = null;

    } catch (error) {
        console.error("Claim locker failed:", error);
        alert("Không thể kết nối đến máy chủ. Vui lòng thử lại.");
    }
});


const RETURNLOCKERBUTTON = document.getElementById("returnLockerButton");

RETURNLOCKERBUTTON.addEventListener("click", function() {
    if (!CURRENTSTUDENT || !SELECTEDLOCKER ||
        SELECTEDLOCKER.owner !== CURRENTSTUDENT) {
        alert("Không tìm thấy tủ thuộc về tài khoản này.");
        return;
    }

    // Release the locker.
    SELECTEDLOCKER.status = "FREE";
    SELECTEDLOCKER.owner = null;

    saveLockers();

    alert("Bạn đã trả tủ thành công!");

    // Reset the current session.
    CURRENTSTUDENT = null;
    SELECTEDLOCKER = null;

    document.getElementById("existingLockerAction").hidden = true;
    document.getElementById("lockerAction").hidden = true;
    document.getElementById("lockerGrid").hidden = false;
    document.getElementById("lockerSection").hidden = true;

    document.getElementById("inputUsername").value = "";
    document.getElementById("inputPassword").value = "";
    document.getElementById("loginMessage").textContent = "";

    renderLockers();
});

const NEEDRETRIEVEBUTTON = document.getElementById("needRetrieveButton");

let RETRIEVETIMER = null;
let RETRIEVEREMAINING = 30;
let RETRIEVEENDTIME = null;

function logoutStudent(message) {
    clearInterval(RETRIEVETIMER);
    RETRIEVETIMER = null;

    CURRENTSTUDENT = null;
    SELECTEDLOCKER = null;

    document.getElementById("retrieveDialog").hidden = true;
    document.getElementById("lockerAction").hidden = true;
    document.getElementById("existingLockerAction").hidden = true;
    document.getElementById("lockerGrid").hidden = false;
    document.getElementById("lockerSection").hidden = true;

    document.getElementById("inputUsername").value = "";
    document.getElementById("inputPassword").value = "";
    document.getElementById("loginMessage").textContent = "";

    if (message) {
        alert(message);
    }
}

function startRetrieveTimer() {
    clearInterval(RETRIEVETIMER);

    RETRIEVEREMAINING = 30;
    RETRIEVEENDTIME = Date.now() + 30000;

    document.getElementById("retrieveCountdown").textContent = "30";
    document.getElementById("retrieveMessage").textContent =
        "Vui lòng lấy đồ của bạn.";

    document.getElementById("lockerAction").hidden = true;
    document.getElementById("existingLockerAction").hidden = true;
    document.getElementById("lockerGrid").hidden = true;
    document.getElementById("retrieveDialog").hidden = false;

    RETRIEVETIMER = setInterval(function() {
        RETRIEVEREMAINING = Math.max(
            0,
            Math.ceil((RETRIEVEENDTIME - Date.now()) / 1000)
        );

        document.getElementById("retrieveCountdown").textContent =
            RETRIEVEREMAINING;

        if (RETRIEVEREMAINING <= 0) {
            logoutStudent("Hết thời gian lấy đồ. Bạn đã được đăng xuất.");
        }
    }, 250);
}

NEEDRETRIEVEBUTTON.addEventListener("click", function() {
    if (!CURRENTSTUDENT || !SELECTEDLOCKER ||
        SELECTEDLOCKER.owner !== CURRENTSTUDENT) {
        alert("Bạn chưa có tủ thuộc tài khoản này.");
        return;
    }

    startRetrieveTimer();
});
