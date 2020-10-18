function timestamp() {
    return firebase.firestore.Timestamp.fromDate(new Date());
}

function toggle_page(new_form) {
    new_form == 'login_form' && init_login_form();

    load_back_button(new_form);
    new_form = document.querySelector(`form#${new_form}`);


    all_forms = document.querySelectorAll('form');
    all_forms.forEach(form => {
        form.reset();
        form == new_form ? form.style.display = 'flex' : form.style.display = 'none';
    });
}

const back_button = document.querySelector('#back_button');
const title = document.querySelector('#title');
const chat_box = document.querySelector('#chat_box');
const match_input = document.querySelector('#match_input');

back_button.addEventListener('click', (e) => {
    e.preventDefault();
    title.innerText = '';
    chat_box.innerText = '';
    status.style.color = 'unset';
    toggle_page(back_button.dataset.value);
})

function load_back_button(this_form) {
    if (this_form == 'sign_up_form' || this_form == 'match_form') {
        back_button.dataset.value = 'login_form';
    } else if (this_form == 'chat_form' || this_form == 'profile_form') {
        back_button.dataset.value = 'match_form';
    }
}

function decipher_uuid(uuid) {
    const docRef = db.collection('users').doc(uuid);
    return docRef.get()
        .then(doc => doc.data().first_name)
        .catch(error => console.log(error));
}

// ==============================
// login_form
// ==============================

const uuid_input = document.querySelector('#uuid_input');
const login_button = document.querySelector('#login_button');
const sign_up_button = document.querySelector('#sign_up_button');

const status = document.querySelector('#status');

function init_login_form() {
    match_input.innerText = '';
    back_button.style.display = 'none';
    title.innerText = '';
    chat_box.innerText = '';
    status.innerText = 'Logged out';
    console.log('Logging out');

    login_button.addEventListener('click', (e) => {
        e.preventDefault();
        login_shuffle(uuid_input.value);
    })

    sign_up_button.addEventListener('click', (e) => {
        e.preventDefault();
        toggle_page('sign_up_form');
        init_sign_up_form();
    })
}

function login_shuffle(uuid) { // Logs user into shuffle. 1 param: (the uuid).
    const current_uuid = uuid;

    const docRef = db.collection('users').doc(current_uuid);
    docRef.get().then(function (doc) {
        if (doc.exists) {
            decipher_uuid(current_uuid).then((name) => {
                console.log(`Logged in as: '${name}'`);
                status.innerText = `Logged in as: '${name}'`;
            })

            status.style.color = 'unset';
            toggle_page('match_form');
            init_match_form(current_uuid);
        } else {
            status.innerText = `'${current_uuid}' is not a user!`;
            status.style.color = 'red';
        }
    }).catch(function (error) {
        console.log(error);
    });
}

init_login_form() // First Function

// ==============================
// sign_up_form
// ==============================

const sign_up_form = document.querySelector('#sign_up_form');
const add_account_button = document.querySelector('#add_account_button');

function init_sign_up_form() {
    back_button.style.display = 'unset';
    add_account_button.addEventListener('click', (e) => {
        e.preventDefault();
        create_user();
    })
}

function create_user() {
    // Generate data variable
    const data = {
        first_name: first_name_input.value,
        last_name: last_name_input.value,
        age: age_input.value,
        gender: gender_input.value,
        location: 'Philadelphia, PA',
        looking_for: merge_checkboxes('lf_checkbox'),
        account_created: timestamp()
    };

    // Generate unique id
    var autoID = db.collection('users').doc().id;

    // Push data to FireStore
    db.collection('users').doc(autoID).set(data).then(function () {
        alert(`This uuid = ${autoID}`);
        console.log('Account Created!');
        sign_up_form.reset(); // Clear input(s)
        login_shuffle(autoID);
    }).catch(function (error) {
        console.error(error);
    });
}

function merge_checkboxes(category) {
    const boxes = document.querySelectorAll(`.${category}`);
    const checked = [];
    for (i = 0; boxes[i]; ++i) {
        if (boxes[i].checked) {
            checked.push(boxes[i].value);
        }
    }

    const checked_str = checked.join(', ');
    return checked_str;
}

// ==============================
// match_form
// ==============================

const pick_match_button = document.querySelector('#pick_match_button');
const match_form = document.querySelector('#match_form');
const profile_button = document.querySelector('#profile_button');

function init_match_form(current_uuid) {
    back_button.style.display = 'flex';
    profile_button.style.display = 'flex';
    list_matches(current_uuid);
    pick_match_button.addEventListener('click', (e) => {
        e.preventDefault();
        const match_uuid = match_input.value;
        toggle_page('chat_form');
        const thread_id = set_thread_id(current_uuid, match_uuid);
        init_chat_form(current_uuid, match_uuid);
        recall_chat(current_uuid, match_uuid, thread_id);
    })

    // User profile button
    profile_button.removeEventListener('click', toggle_page);
    profile_button.addEventListener('click', (e) => {
        e.preventDefault();
        toggle_page('profile_form');
        init_profile_form(current_uuid, current_uuid);
    })
}

function list_matches(current_uuid) {
    const doc = db.collection('users').doc(current_uuid).collection('matches');
    doc.onSnapshot(docSnapshot => { // Observer
        doc.get()
            .then(function (querySnapshot) {
                match_input.innerHTML = '';
                querySnapshot.forEach(function (doc) {
                    // Decipher uuid's
                    decipher_uuid(doc.id).then((name) => {
                        const element = `
                            <option value="${doc.id}">${name}</option>
                        `
                        match_input.innerHTML = element;
                    });

                });
            })
            .catch(function (error) {
                console.log('Error getting documents: ', error);
            })
    }, err => {
        console.log(`Encountered error: ${err}`);
    });
}

// ==============================
// chat_form
// ==============================

const message_input = document.querySelector('#message_input');
const send_button = document.querySelector('#send_button');

function init_chat_form(current_uuid, match_uuid) {
    send_button.addEventListener('click', (e) => {
        e.preventDefault();
        send_message(current_uuid, match_uuid);
    });

    // User profile button
    profile_button.style.display = 'flex';
    profile_button.removeEventListener('click', toggle_page);
    profile_button.addEventListener('click', (e) => {
        e.preventDefault();
        toggle_page('profile_form');
        init_profile_form(match_uuid, current_uuid);
    })
}

function send_message(current_uuid, match_uuid) {
    if (message_input.value) {

        const data = {
            content: message_input.value,
            from: current_uuid,
            to: match_uuid,
            when: timestamp()
        };
        db.collection('chats').doc('thread-' + thread_id).collection('messages').doc().set(data).then(function () {
            console.log('Message Sent!');
            chat_form.reset(); // Clear input(s)
        }).catch(function (error) {
            console.error(error);
        });

    }
}

function recall_chat(current_uuid, match_uuid, thread_id) { // gets entire chat at first
    // Decipher match uuid
    decipher_uuid(match_uuid).then((name) => {
        console.log(`Chatting with: ${name} \nThread_id: ${thread_id}`);
    });

    const doc = db.collection('chats').doc('thread-' + thread_id).collection('messages');
    doc.orderBy('when', 'asc') // Index Collection ID: 'chats'
        .get()
        .then(function (querySnapshot) {
            // Decipher ID
            decipher_uuid(match_uuid).then((name) => {
                title.innerText = name;
            });

            chat_box.innerHTML = '';
            querySnapshot.forEach(function (doc) {
                const content = (doc.id, ' => ', doc.data().content);
                const from = (doc.id, ' => ', doc.data().from);
                const time = (doc.id, ' => ', format_fs_tstamp(doc.data().when));

                const element = `
                    <li class="message ${who_sent(from, current_uuid)}">
                        <p class="name">${content}</p>
                        <p class="time">${time}</p>
                    </li>
                    `
                chat_box.innerHTML += element;
            });
            scroll_to_bottom('tell');
            observe_chat(current_uuid, match_uuid, doc);
        })
        .catch(function (error) {
            console.log('Error getting documents: ', error);
        });
}

function observe_chat(current_uuid, match_uuid, doc) {
    doc.onSnapshot(docSnapshot => { // Observer
        doc.orderBy('when', 'asc') // Index Collection ID: 'chats'
            .get()
            .then(function (querySnapshot) {
                // Decipher uuid
                decipher_uuid(match_uuid).then((name) => {
                    title.innerText = name;
                });

                chat_box.innerHTML = '';
                querySnapshot.forEach(function (doc) {
                    const content = (doc.id, ' => ', doc.data().content);
                    const from = (doc.id, ' => ', doc.data().from);
                    const time = (doc.id, ' => ', format_fs_tstamp(doc.data().when));

                    const element = `
                    <li class="message ${who_sent(from, current_uuid)}">
                        <p class="name">${content}</p>
                        <p class="time">${time}</p>
                    </li>
                    `
                    chat_box.innerHTML += element;
                });
                play_tone();
                scroll_to_bottom('ask');
            })
            .catch(function (error) {
                console.log('Error getting documents: ', error);
            });
    }, err => {
        console.log(`Encountered error: ${err}`);
    });
}

// Features/Extras

const message_tone = new Audio('message-tone.mp3');

function play_tone() {
    const last_message = document.querySelector('.message:last-of-type');
    if (last_message) {
        if (last_message.classList.contains('from_them')) {
            message_tone.play();
        }
    }
}

function scroll_to_bottom(command) {
    if (command == 'ask') {
        if ((chat_box.scrollHeight - (chat_box.scrollTop + chat_box.clientHeight)) <= 500) {
            chat_box.scrollTop = chat_box.scrollHeight;
        }
    } else if (command == 'tell') {
        chat_box.scrollTop = chat_box.scrollHeight;
    }
}

function set_thread_id(uuid1, uuid2) {
    uuid1 > uuid2 ? thread_id = uuid1 + '-' + uuid2 : thread_id = uuid2 + '-' + uuid1;
    return thread_id;
}

function who_sent(from, current_uuid) {
    from == current_uuid ? sender = 'from_me' : sender = 'from_them';
    return sender;
}

function format_fs_tstamp(tstamp) {
    return moment(tstamp.toDate()).format("M/D/YY • h:mm a");
}

// ==============================
// match_info
// ==============================

// ==============================
// profile_form
// ==============================

const stat_name = document.querySelector('#stat_name');
const stat_location = document.querySelector('#stat_location');
const stat_age = document.querySelector('#stat_age');
const stat_looking_for = document.querySelector('#stat_looking_for');
const stat_gender = document.querySelector('#stat_gender');

function init_profile_form(uuid, current_uuid) {
    title.innerText = '';
    profile_button.style.display = 'none';
    load_back_button('profile_form');

    if (uuid === current_uuid) { // My profile
        // Add edit button
    } else { // Match Profile
        // Do something match related...
    }

    // Display data
    const docRef = db.collection('users').doc(uuid);
    docRef.get()
        .then(function (doc) {
            const name = doc.data().first_name + ' ' + doc.data().last_name;
            const age = doc.data().age;
            const gender = doc.data().gender;
            const location = doc.data().location;
            const looking_for = doc.data().looking_for;

            stat_name.innerText = name,
                stat_age.innerText = age,
                stat_gender.innerText = gender,
                stat_location.innerText = location,
                stat_looking_for.innerText = looking_for

        })
        .catch(function (error) {
            console.log('Error getting documents: ', error);
        })
}