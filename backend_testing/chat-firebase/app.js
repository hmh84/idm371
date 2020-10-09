const time_stamp = firebase.firestore.Timestamp.fromDate(new Date());

function toggle_page(new_form) {
    new_form = document.querySelector(`form#${new_form}`);

    all_forms = document.querySelectorAll('form');
    all_forms.forEach(form => {
        form.reset();
        form == new_form ? form.style.display = 'block' : form.style.display = 'none';
    });
}

const home_button = document.querySelector('#home_button');

home_button.addEventListener('click', (e) => {
    e.preventDefault();
    window.current_uuid = '';
    window.match_uuid = '';
    console.log('Logging out');
    toggle_page('login_form');
})

function decipher_uuid(uuid) {
    // console.log('working on ' + uuid);
    var docRef = db.collection('users').doc(uuid);
    docRef.get()
        .then(function (doc) {
            if (doc.exists) {
                name = doc.data().first_name;
                // return name;
                return;
            } else {
                console.log("User doesn't exist");
            }
        }).catch(function (error) {
            console.log(error);
        });
}

// ==============================
// login_form
// ==============================

const uuid_input = document.querySelector('#uuid_input');
const login_button = document.querySelector('#login_button');

login_button.addEventListener('click', (e) => {
    e.preventDefault();
    window.current_uuid = uuid_input.value;
    console.log(`Logging in as: ${current_uuid}`);
    toggle_page('pick_match_form');
    list_matches(current_uuid);
})

// ==============================
// pick_match_form
// ==============================

const pick_match_button = document.querySelector('#pick_match_button');
const pick_match_form = document.querySelector('#pick_match_form');
const match_input = document.querySelector('#match_input');

pick_match_button.addEventListener('click', (e) => {
    e.preventDefault();
    window.match_uuid = match_input.value;
    console.log(`Chatting with: ${match_uuid}`);
    toggle_page('chat_form');
    refresh_chat();
})

// ==============================
// chat_form
// ==============================

const title = document.querySelector('#title');
const message_input = document.querySelector('#message_input');
const send_button = document.querySelector('#send_button');
const chat_box = document.querySelector('.chat_box');

send_button.addEventListener('click', (e) => {
    e.preventDefault();
    send_message();
})

function send_message() {
    const thread_id = set_thread_id(current_uuid, match_uuid);

    db.collection("chats").doc().set({
        content: message_input.value,
        thread_id: thread_id,
        from: current_uuid,
        to: match_uuid,
        when: ''
    })
        .then(function () {
            console.log("Message Sent!");
            chat_form.reset(); // Clear input(s)
        })
        .catch(function (error) {
            console.error(error);
        });
}

function refresh_chat() {
    const thread_id = set_thread_id(current_uuid, match_uuid);
    console.log('This Thread ID: ' + thread_id);

    const doc = db.collection('chats');
    const observer = doc.onSnapshot(docSnapshot => {
        // Do stuff
        console.log('An event occured..');
        doc.where("thread_id", "==", thread_id)
            .get()
            .then(function (querySnapshot) {
                const name = decipher_uuid(match_uuid);
                title.innerText = 'Chatting w/ ' + name;
                chat_box.innerHTML = '';
                querySnapshot.forEach(function (doc) {
                    const content = (doc.id, " => ", doc.data().content);
                    const from = (doc.id, " => ", doc.data().from);

                    const element = `
                    <li class="message ${who_sent(from)}">
                        <p class="name">${content}</p>
                    </li>
                    `
                    chat_box.innerHTML += element;
                });
            })
            .catch(function (error) {
                console.log("Error getting documents: ", error);
            });
    }, err => {
        console.log(`Encountered error: ${err}`);
    });
}

function set_thread_id(uuid1, uuid2) {
    uuid1 > uuid2 ? thread_id = uuid1 + '-' + uuid2 : thread_id = uuid2 + '-' + uuid1;
    return thread_id;
}

function who_sent(from) {
    from == current_uuid ? sender = 'from_me' : sender = 'from_them';
    return sender;
}

function list_matches(uuid) {
    const doc = db.collection('users').doc(uuid).collection('matches');
    const observer = doc.onSnapshot(docSnapshot => {
        // Do stuff
        console.log('An event occured..');
        doc.get()
            .then(function (querySnapshot) {
                title.innerText = 'Chatting w/ ' + name;
                match_input.innerHTML = '';
                querySnapshot.forEach(function (doc) {

                    const element = `
                        <option value="${doc.id}">${doc.id}</option>
                    `
                    match_input.innerHTML += element;
                });
            })
            .catch(function (error) {
                console.log("Error getting documents: ", error);
            });
    }, err => {
        console.log(err);
    });
}