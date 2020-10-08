const database = firebase.database();
const userRef = database.ref('users');
const chatRef = database.ref('messages');

// ==============================
// PAGE_INDEX
// ==============================

if (currentPage == 'index') {

    // ==============================
    // VARIABLES
    // ==============================

    const userForm = document.querySelector('#userForm');

    const uuid = document.querySelector('#uuid');
    const apiId = document.querySelector('#apiId');

    const firstName = document.querySelector('#firstName');
    const lastName = document.querySelector('#lastName');
    const age = document.querySelector('#age');
    const gender = document.querySelector('#gender');

    const removeBtn = document.querySelector('#removeBtn');
    const addBtn = document.querySelector('#addBtn');
    const updateBtn = document.querySelector('#updateBtn');

    // ==============================
    // LISTENERS
    // ==============================

    addBtn.addEventListener('click', (e) => {
        e.preventDefault();
        addUser();
    })

    updateBtn.addEventListener('click', (e) => {
        e.preventDefault();
        updateUser();
    })

    removeBtn.addEventListener('click', (e) => {
        e.preventDefault();
        removeUser();
    })

    // ==============================
    // FUNCTIONS
    // ==============================

    function addUser() {
        const autoId = 'user' + userRef.push().key
        userRef.child(uuid.value ? uuid.value : autoId).set({
            api_id: apiId.value,
            first_name: firstName.value,
            last_name: lastName.value,
            age: age.value,
            gender: gender.value
        })
        userForm.reset();
    }

    function updateUser() {
        const newData = {
            age: age.value,
            api_id: apiId.value,
            first_name: firstName.value,
            last_name: lastName.value,
            age: age.value,
            gender: gender.value
        };
        const updates = {};
        updates['/users/' + uuid.value] = newData;
        // updates['/super-users/' + uuid.value] = newData;
        database.ref().update(updates);
        userForm.reset();
    }

    function removeUser() {
        userRef.child(uuid.value).remove().then(() => {
            window.alert('User was deleted')
        })
            .catch(error => {
                console.log(error);
            });
        // database.ref('/super-users').child(uuid.value).remove().then();
        userForm.reset();
    }

}

// ==============================
// PAGE_USERS
// ==============================

if (currentPage == 'users') {

    // ==============================
    // VARIABLES
    // ==============================

    const userList = document.querySelector('.userList');

    const name = document.querySelector('#name');
    const age = document.querySelector('#age');
    const gender = document.querySelector('#gender');

    // ==============================
    // QUERIES
    // ==============================

    userRef.on('value', (snapshot) => {
        userList.innerHTML = '';
        snapshot.forEach((child) => {
            const snap_name = child.child('first_name').val() + ' ' + child.child('last_name').val();
            const snap_age = child.child('age').val();
            const snap_gender = child.child('gender').val();

            const element = `
                <li class="userCard">
                    <p class="name">${snap_name}</p>
                    <p class="age">Age: ${snap_age}</p>
                    <p class="gender">Gender: ${snap_gender}</p>
                </li>
                `
            userList.innerHTML += element
        });
    })
}

// ==============================
// PAGE_CHATS
// ==============================

if (currentPage == 'chats') {

    // ==============================
    // VARIABLES
    // ==============================

    const chatList = document.querySelector('.chatList');
    const chatForm = document.querySelector('#chatForm');
    const loginModal = document.querySelector('.loginModal');
    const messageInput = document.querySelector('#messageInput');
    const sendBtn = document.querySelector('#send');

    const uuid = document.querySelector('#uuid');
    const login = document.querySelector('#login');

    // ==============================
    // LISTENERS
    // ==============================

    login.addEventListener('click', (e) => {
        e.preventDefault();
        loadChats(uuid.value);
    })

    sendBtn.addEventListener('click', (e) => {
        e.preventDefault();
        const autoId = 'message' + userRef.push().key
        database.ref('messages/thread-MJ5J0647jY6BCWJKW62-MJ5H5ZCtmYCwIXRD8Og').child(autoId).set({
            sender: uuid.value,
            message_text: messageInput.value,
            timestamp: firebase.database.ServerValue.TIMESTAMP
        })
        chatForm.reset();
    })

    // ==============================
    // FUNCTIONS
    // ==============================

    function loadChats(clientUUID) {
        console.log(`Logging in as \n ${clientUUID}`);
        loginModal.hidden = true;

        database.ref('messages/thread-MJ5J0647jY6BCWJKW62-MJ5H5ZCtmYCwIXRD8Og').orderByChild('timestamp').on('value', (snapshot) => {
            chatList.style.display = 'flex';
            chatForm.style.display = 'flex';
            chatList.innerText = '';

            snapshot.forEach((child) => {
                const snap_messageText = child.child('message_text').val();
                const snap_timestamp = child.child('timestamp').val();
                const snap_uuid = child.child('sender').val();

                userRef.child(snap_uuid).on('value', snapshot => {

                    if (snapshot.key == uuid.value) {
                        var isOwnMessage = 'sent';
                    } else {
                        var isOwnMessage = 'received';
                    }

                    const snap_name = snapshot.child('first_name').val();

                    const element = `
                    <li class="userCard ${isOwnMessage}">
                        <p class="messageText">${snap_messageText}</p>
                        <p class="timestamp">${isOwnMessage == 'sent' ? snap_timestamp : snap_name + ' • ' + snap_timestamp}</p>
                    </li>
                    `
                    chatList.innerHTML += element;
                })
            });
        })
    }

    decideNodeName('-MJ5H5ZCtmYCwIXRD8Og', '-MJ5J0647jY6BCWJKW62')
    function decideNodeName(uuid1, uuid2) {
        uuid1 > uuid2 ? nodeTitle = uuid1 + uuid2 : nodeTitle = uuid2 + uuid1;
        // console.log(nodeTitle);
    }
}