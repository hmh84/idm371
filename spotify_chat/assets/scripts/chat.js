// ==============================
// General Functions
// ==============================

function timestamp() { // Returns the current timestamp, Usage: "console.log(timestamp());"
    return firebase.firestore.Timestamp.fromDate(new Date());
}

function toggle_page(new_form) { // Hides all forms except the form pass to 'new_form' argument
    if (new_form == 'login_form') {
        init_login_form();
        profile_button.style.display = 'none';
    } else if (new_form == 'sign_up_form') {
        init_sign_up_form();
        profile_button.style.display = 'none';
    } else if (new_form == 'match_form') {
        profile_button.style.display = 'flex';
    }

    load_back_button(new_form);

    const new_form_obj = document.querySelector(`form#${new_form}`);

    all_forms = document.querySelectorAll('form');
    all_forms.forEach(form => {
        form.reset();
        form == new_form_obj ? form.style.display = 'flex' : form.style.display = 'none';
    });
}

const back_button = document.querySelector('#back_button');
const title = document.querySelector('#title');
const chat_box = document.querySelector('#chat_box');
const match_input = document.querySelector('#match_input');

back_button.addEventListener('click', (e) => {
    e.preventDefault();
    stop_players();
    title.innerText = '';
    chat_box.innerText = '';
    status.style.color = 'unset';
    toggle_page(back_button.dataset.value);
})

function load_back_button(this_form) { // Adds correct link to back button
    if (this_form == 'sign_up_form' || this_form == 'match_form') {
        back_button.dataset.value = 'login_form';
    } else if (this_form == 'chat_form' || this_form == 'profile_form') {
        back_button.dataset.value = 'match_form';
    }
}

function decipher_uuid(uuid) { // Turns UUID strings into first_name
    const docRef = db.collection('users').doc(uuid);
    return docRef.get()
        .then(doc => doc.data().first_name)
        .catch(error => console.log(error));
}

function stop_players() { // Stops all iframe OR video players
    var videos = document.querySelectorAll('iframe, video');
    Array.prototype.forEach.call(videos, function (video) {
        if (video.tagName.toLowerCase() === 'video') {
            video.pause();
        } else {
            var src = video.src;
            video.src = src;
        }
    });
};

const checkbox_spans = document.querySelectorAll('.checkboxes span');
checkbox_spans.forEach(span => { // Clicking on checkbox containers will select the checkbox input. There's also a CSS reference for pointer-events: none;
    span.addEventListener('click', () => {
        span.getElementsByTagName("input")[0].click();
    });
});

// ==============================
// login_form
// ==============================

const uuid_input = document.querySelector('#uuid_input');
const login_button = document.querySelector('#login_button');
const sign_up_button = document.querySelector('#sign_up_button');
const profile_button = document.querySelector('#profile_button');

const status = document.querySelector('#status');

function init() { // Initialize the login form, reset login status
    init_login_form();
    console.log('Initializing App');

    if (node_mode === false) {
        toggle_page('login_form');

        login_button.addEventListener('click', (e) => {
            e.preventDefault();
            // Check form validity
            if (document.querySelector('#login_form').checkValidity() === true) {
                login_shuffle(uuid_input.value);
            } else {
                status.innerText = 'Enter a username.';
                status.style.color = 'red';
            }
        })

        sign_up_button.addEventListener('click', (e) => {
            e.preventDefault();
            toggle_page('sign_up_form');
            init_sign_up_form();
        })
    } else if (node_mode == true) {
        // if ((user_exist(spotify_id) === true) && (user_new(spotify_id) === false)) { // If user exists & is not new
        if (user_exist(spotify_id) === true) { // If user exists & is not new
            if (user_new(uuid) === false) {
                login_shuffle(spotify_id);
                console.log('Logging in as ' + spotify_id);
            }
        } else {
            toggle_page('sign_up_form');
            // I wanna setup user
            console.log('I wanna setup user');
        }
    }
}

function user_exist(uuid) {
    const docRef = db.collection('users').doc(uuid);
    docRef.get().then(function (doc) {
        if (doc.exists) {
            // Is already a user...
            return true;
        } else {
            // Not already a user...
            return false;
        }
    }).catch(function (error) {
        console.log(error);
    });
}

function user_new(uuid) {
    console.log('yep');
    const docRef = db.collection('users').doc(uuid);
    docRef.get().then(function (doc) {
        if (doc.data().new_user === true) {
            console.log('User is new');
            return true;
        } else {
            console.log('User is NOT new');
            return false;
        }
    }).catch(function (error) {
        console.log(error);
    });
}

function init_login_form() {
    stop_players();
    match_input.innerText = '';
    back_button.style.display = 'none';
    title.innerText = '';
    chat_box.innerText = '';
    status.innerText = 'Logged out';
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

// ==============================
// sign_up_form
// ==============================

const sign_up_form = document.querySelector('#sign_up_form');
const add_account_button = document.querySelector('#add_account_button');
const school_input = document.querySelector('#school_input');
const anthem_id_input = document.querySelector('#anthem_id_input');

function init_sign_up_form() { // Initialize the login form, show back button
    back_button.style.display = 'unset';
    add_account_button.addEventListener('click', (e) => {
        e.preventDefault();
        // Check form validity
        if (document.querySelector('#sign_up_form').checkValidity() === true) {
            create_user(spotify_id);
        } else {
            status.innerText = 'Form is incomplete.';
            status.style.color = 'red';
        }
    })
    collages.forEach(collage => {
        const element = `
            <option value="${collage}">${collage}</option>
        `
        school_input.innerHTML += element;
    });
}

function create_user() { // Create a user
    // Generate data variable
    const data = {
        first_name: first_name_input.value,
        last_name: last_name_input.value,
        age: age_input.value,
        gender: gender_input.value,
        location: 'Philadelphia, PA',
        school: school_input.value,
        anthem_id: anthem_id_input.value,
        looking_for: merge_checkboxes('lf_checkbox'),
        new_user: false,
        account_created: timestamp()
    };

    // Push data to FireStore
    function push_new_user_data(id_to_use) {
        db.collection('users').doc(id_to_use).set(data).then(function () {
            alert(`This uuid = ${id_to_use}`);
            console.log('Account Created!');
            sign_up_form.reset(); // Clear input(s)
            login_shuffle(spotify_id);
        }).catch(function (error) {
            console.error(error);
        });
    }

    if (node_mode) {
        // Use API user id
        const id_to_use = spotify_id;
        push_new_user_data(id_to_use);
    } else {
        // Generate unique id
        var autoID = db.collection('users').doc().id;
        id_to_use = autoID;
        push_new_user_data(id_to_use);
    }
}

function merge_checkboxes(category) { // [Reusable] Combines values of checkboxes by category
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

function init_match_form(current_uuid) { // Initialize match chat selection form
    stop_players();
    back_button.style.display = 'flex';
    list_users(current_uuid);
    pick_match_button.addEventListener('click', (e) => {
        e.preventDefault();
        const match_uuid = match_input.value;
        toggle_page('chat_form');
        const thread_id = set_thread_id(current_uuid, match_uuid);
        init_chat_form(current_uuid, match_uuid);
        recall_chat(current_uuid, match_uuid, thread_id);
        message_input.focus();
    })

    // User profile button
    // profile_button.removeEventListener('click', toggle_page);
    // profile_button.removeEventListener('click', init_profile_form);
    $('#profile_button').unbind();
    profile_button.addEventListener('click', (e) => {
        e.preventDefault();
        toggle_page('profile_form');
        init_profile_form(current_uuid, current_uuid);
    })
}

function list_users(current_uuid) { // Populates SELECT form with matches
    const doc = db.collection('users');
    doc.onSnapshot(docSnapshot => { // Observer
        doc.get()
            .then(function (querySnapshot) {
                match_input.innerHTML = '';
                querySnapshot.forEach(function (doc) {
                    // Decipher uuid's
                    // if (!doc.id === current_uuid) { // Don't list your own user
                    decipher_uuid(doc.id).then((name) => {
                        const element = `
                                <option value="${doc.id}">${name}</option>
                            `
                        match_input.innerHTML += element;
                    });
                    // }
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

function init_chat_form(current_uuid, match_uuid) { // Initializes the chat form
    send_button.addEventListener('click', (e) => {
        e.preventDefault();
        send_message(current_uuid, match_uuid);
    });

    // User profile button
    profile_button.style.display = 'flex';
    // profile_button.removeEventListener('click', toggle_page);
    // profile_button.removeEventListener('click', init_profile_form);
    $('#profile_button').unbind();
    profile_button.addEventListener('click', (e) => {
        e.preventDefault();
        toggle_page('profile_form');
        init_profile_form(match_uuid, current_uuid, 'from_chat');
    })
}

function send_message(current_uuid, match_uuid) { // Sends a message from chat form message input
    if (message_input.value) {
        const data = {
            content: message_input.value,
            from: current_uuid,
            to: match_uuid,
            when: timestamp()
        };
        db.collection('chats').doc('thread-' + thread_id).collection('messages').doc().set(data).then(function () {
            chat_form.reset(); // Clear input(s)
            status.style.color = 'unset';
            status.innerText = 'Message Sent!';
        }).catch(function (error) {
            console.error(error);
        });
    } else {
        status.innerText = 'Type a message.';
        status.style.color = 'red';
    }
}

function recall_chat(current_uuid, match_uuid, thread_id) { // Gets entire chat history when entering chat with a match
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

function observe_chat(current_uuid, match_uuid, doc) { // [!!!Does not stop listening per instance!!!] Sets up event listener for the thread you and your match are on
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

const message_tone = new Audio('assets/sounds/message-tone.mp3');
function play_tone() { // Plays message tone when receiving a message from match
    const last_message = document.querySelector('.message:last-of-type');
    if (last_message) {
        if (last_message.classList.contains('from_them')) {
            message_tone.play();
        }
    }
}

function scroll_to_bottom(command) { // Scroll to the bottom if scroll height is not too far up (to prevent annoyance)
    if (command == 'ask') {
        if ((chat_box.scrollHeight - (chat_box.scrollTop + chat_box.clientHeight)) <= 500) {
            chat_box.scrollTop = chat_box.scrollHeight;
        }
    } else if (command == 'tell') {
        chat_box.scrollTop = chat_box.scrollHeight;
    }
}

function set_thread_id(uuid1, uuid2) { // Determines what the thread_id will be based on current_uuid and match_uuid
    uuid1 > uuid2 ? thread_id = uuid1 + '-' + uuid2 : thread_id = uuid2 + '-' + uuid1;
    return thread_id;
}

function who_sent(from, current_uuid) { // Determines who sent the message, returns a class name to add to the message bubble
    from == current_uuid ? sender = 'from_me' : sender = 'from_them';
    return sender;
}

function format_fs_tstamp(tstamp) { // Formats moment.js timestamp into cleaner format
    return moment(tstamp.toDate()).format("M/D/YY • h:mm a");
}

// ==============================
// profile_form
// ==============================

const stats = document.querySelectorAll('.stat');
const stat_location_space = document.querySelector('#stat_location_space');

const stat_name = document.querySelector('#stat_name');
const stat_location = document.querySelector('#stat_location');
const stat_school = document.querySelector('#stat_school');
const stat_age = document.querySelector('#stat_age');
const stat_looking_for = document.querySelector('#stat_looking_for');
const stat_gender = document.querySelector('#stat_gender');

const anthem_wrap = document.querySelector('#anthem_wrap');
const stat_anthem_label = document.querySelector('#stat_anthem_label');
const stat_anthem = document.querySelector('#stat_anthem');

function init_profile_form(uuid, current_uuid) { // Initializes profile page
    title.innerText = '';
    profile_button.style.display = 'none';
    console.log('init profile form');

    if (uuid === current_uuid) { // If it's current_uuid profile
        // Add edit button
        console.log('my profile');
    } else { // If it's the matches profile
        console.log('their profile');
        // Do something match related...?
    }

    // Display data
    const docRef = db.collection('users').doc(uuid);
    docRef.get()
        .then(function (doc) {
            const result = doc.data(); // Make doc.data() a variable for convenience
            load_profile_stats(result);
        })
        .catch(function (error) {
            console.log('Error getting documents: ', error);
        })
}

function load_profile_stats(result) {
    // Required
    const first_name = result.first_name;
    const last_name = result.last_name;

    // Optional
    const age = result.age;
    const gender = result.gender;
    const location = result.location;
    const school = result.school;
    const looking_for = result.looking_for;
    const anthem_id = result.anthem_id;

    // Check fields
    age == '' || age === undefined ? stat_age.dataset.status = 'empty' : stat_age.removeAttribute('data-status');
    gender == '' || gender === undefined ? stat_gender.dataset.status = 'empty' : stat_gender.removeAttribute('data-status');
    location == '' || location === undefined ? stat_location.dataset.status = 'empty' : stat_location.removeAttribute('data-status');
    school == '' || school === undefined ? stat_school.dataset.status = 'empty' : stat_school.removeAttribute('data-status');
    looking_for == '' || looking_for === undefined ? stat_looking_for.dataset.status = 'empty' : stat_looking_for.removeAttribute('data-status');

    for (var i = 0, len = stats.length; i < len; i++) {
        if (stats[i].dataset.status == 'empty') {
            stats[i].parentElement.style.display = 'none';
        } else {
            stats[i].parentElement.style.display = 'flex';
        }
    };

    // === Inject field content ===

    // Required
    stat_name.innerText = first_name + ' ' + last_name;

    // Optional
    stat_age.innerText = age;
    stat_gender.innerText = gender;
    stat_location.innerText = location;
    stat_school.innerText = school;
    stat_looking_for.innerText = looking_for;

    if (anthem_id === '' || anthem_id === undefined) {
        anthem_wrap.style.display = 'none';
    } else {
        stat_anthem_label.innerText = `${first_name}'s Anthem`;
        stat_anthem.src = `https://open.spotify.com/embed/track/${anthem_id}`;
    }
}

init(); // First Function

// ==============================
// TASKS
// ==============================

// Priority tasks

// 1. Fix function duplication, might have to do with callback
// 2. Correctly route login or setup profile if user is new
// 3. Fix profile form page not showing correct profile. (Re-initialize the match form every time you enter it (to reset match_id for profile views)), maybe event listeners are piling up
// 4. Only show profiles that are not new & are not yourself
// 5. Edit profile after creation
// 6. Merge in search for anthem song

// Scope Creep Tasks

// 1. Embedded chat messages for links, music. (Try to get meta to appear)
// 2. Offline chat storage
// 3. Delete messages, appear as 'Message Deleted'