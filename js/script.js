// const { progress } = require("cli");
// const { type } = require("os");

var resultView = new Vue( {
    // Example API Requests
    // Get all users: http://localhost:8001/api/users
    // Get goals: http://localhost:8001/api/user/goals?user_id=1
    // Get logs: http://localhost:8001/api/user/logs?user_id=1
    // Get photos: http://localhost:8001/api/user/photos?user_id=1
    // Login: http://localhost:8001/api/login?username=behrmanz&password=password
    // Create account: http://localhost:8001/api/create/account?username=sjkachru&firstname=SJ&lastname=Kachru&email=sjkachruumich.edu&password=password
    // Create goal:
    // Create log:
    // Create 

    el: '#app',
    data: {
        userId: '',
        
        // LOGIN + SIGNUP VARIABLES
        inputUsername: '',
        inputPassword: '',
        inputFirstname: '',

        // Menu State
        isHome: true,
        isSignup: false,
        isLogin: false,
        isFavorites: false
    },

    methods: {
        logInUser: function() {
            // Send API request to datbase
            var url = "http://localhost:8001/api/login?username=" + this.inputUsername + "&password=" + this.inputPassword;
            axios
            .get(url)
            .then(response => {
               console.log(response);
               // If success, change userId to returned value from the back-end
               if(response.data.request_status === "success") {
                this.userId = response.data.user_id;
                window.location.href = "index.html?userId="+this.userId;
               }
               else {
                if(response.data.error_message.includes("NO USER")) {
                    window.alert("No user could be found with the associated login credentials.");
                } else {
                    // Else, prompt user that log-in failed
                    window.alert("Login Failed");
                }
               }
            });
            // Discard data within inputUsername and inputPassword <---??? Not sure what this means
        },
        
        checkPassword: function() {
            var passw = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,25}$/;
            if(this.inputPassword.match(passw)) { 
                return true;
            }
            else {
                // interpet what?
                //i forgot how to interpret the string, what are the requirements for it
                window.alert("Password must be more than 8 characters, contain one uppercase, one lowercase, and one numeric digit")
                return false;
            }
        },

        signUpUser: function() {
            if(this.inputFirstname === "" || this.inputUsername === "" || this.inputPassword === ""){
                window.alert("Please fill out all fields");
                return;
            }
            if(!this.checkPassword()) {
                return false;
            }
            var url = "http://localhost:8001/api/create/account?username=" + this.inputUsername + "&password=" + this.inputPassword + "&firstname=" + this.inputFirstname; 
            axios
            .get(url)
            .then(response => {
               if (response.data.request_status === "success") {
                this.userId = response.data.user_id;
                window.location.href = "index.html?userId="+this.userId;
               }
               else {
                if(response.data.error_message) {
                    // If Unique is in the error code, that means there's a duplicate DB entry
                    if(response.data.error_message.includes("UNIQUE")) {
                        if(response.data.error_message.includes("username")) {
                            // TODO: This should show up in the actual HTML and not as a window IMO.
                            window.alert("This username has already been taken!");
                        } if(response.data.error_message.includes("email")) {
                            window.alert("This email is already in use!");
                        }
                    } else {
                        window.alert("Signup Failed: " + error_message);
                    }
                } else {
                    window.alert("Signup Failed: Internal Server Error");
                }
               }
            });
        },

        // NAV FUNCTIONS
        updateNavbar: function(menu_section) {
            if(menu_section == "Home") {
                this.isHome = true;
                this.isLogs = false;
                this.isPhotos = false;
                this.isProgress = false;
            }
            else if(menu_section == "Logs") {
                this.getGoals();
                this.isHome = false;
                this.isLogs = true;
                this.isPhotos = false;
                this.isProgress = false;
            }
            else if(menu_section == "Photos") {
                this.getPics();
                this.isHome = false;
                this.isLogs = false;
                this.isPhotos = true;
                this.isProgress = false;
            }
            else if(menu_section == "Progress") {
                this.isHome = false;
                this.isLogs = false;
                this.isPhotos = false;
                this.isProgress = true;
            }
        },
    },

    components: {
        'gallery': VueGallery,
    },

    beforeMount() {
        this.getUserId();
        // userId is set to -1 on Log-in/Sign-up
        /*if(this.userId != -1) {
            this.getGoals().then(this.getLogs()).then(this.updateProgress());
        }*/
        if(this.userId != -1) {
            var url = "http://localhost:8001/api/user/goals?user_id=" + this.userId;
            return axios
            .get(url)
            .then(response => {
                if (response.data.request_status === "success") {
                    this.goals = response.data.data; //user_id, goal_name, goal_operator, goal_value, goal_unit
                }
                else {
                    windows.alert("Goals could not be retrieved");
                }
               //display should update automatically
            }).then(() => {
                var url = "http://localhost:8001/api/user/logs?user_id=" + this.userId;
                return axios
                .get(url)
                .then(response => {
                    if (response.data.request_status === "success") {
                        this.logs = response.data.data;
                    }
                    else {
                        windows.alert("Logs could not be retrieved");
                    }
                    //display should update automatically
                });
            }).then(() => {
                this.updateProgress();
            });
        }
        console.log("Vue started.");
     },
});