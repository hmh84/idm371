// ==============================
// Get Login Data
// ==============================

var hashParams = {};
var e, r = /([^&;=]+)=?([^&;]*)/g,
    q = window.location.hash.substring(1);
while (e = r.exec(q)) {
    hashParams[e[1]] = decodeURIComponent(e[2]);
}

const spotify_id = hashParams.s_id;
const new_user = hashParams.new_user;

// ==============================
// General Functions
// ==============================

const docQ = document.querySelector.bind(document),
    docQA = document.querySelectorAll.bind(document);

function timestamp() { // Returns the current timestamp, Usage: 'console.log(timestamp());'
    return firebase.firestore.Timestamp.fromDate(new Date());
}

function no() {
    // do nothing
}

function toggle_page(new_form) { // Hides all forms except the form pass to 'new_form' argument
    if (new_form == 'login_form') {
        init_login_form();
        profile_button.style.display = 'none';
    } else if (new_form == 'sign_up_form') {
        init_sign_up_form();
        profile_button.style.display = 'none';
    } else if (new_form == 'match_form') {
        init_match_form(spotify_id);
        profile_button.style.display = 'flex';
    }

    load_back_button(new_form);

    const new_form_obj = docQ(`form#${new_form}`);

    all_forms = docQA('form');
    all_forms.forEach(form => {
        form.reset();
        form == new_form_obj ? form.style.display = 'flex' : form.style.display = 'none';
    });
}

const back_button = docQ('#back_button'),
    nav_title = docQ('#nav_title'),
    chat_box = docQ('#chat_box'),
    match_input = docQ('#match_input'),
    modal = docQ('#modal'),
    modal_close_button = docQ('#modal_close_button');

modal_close_button.addEventListener('click', (e) => {
    e.preventDefault();
    modal.style.display = 'none';
})

back_button.addEventListener('click', (e) => {
    e.preventDefault();

    match_options_button.style.display = 'none';
    modal.style.display = 'none';
    stop_players();
    nav_title.innerText = '';
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

function user_new(uuid) { // Checks if target user is new
    const docRef = db.collection('users').doc(uuid);
    docRef.get().then(function(doc) {
        return doc.data().new_user;
    }).catch(function(error) {
        console.log(error);
    });
}

function stop_players() { // Stops all iframe OR video players
    var videos = docQA('iframe, video');
    Array.prototype.forEach.call(videos, function(video) {
        if (video.tagName.toLowerCase() === 'video') {
            video.pause();
        } else {
            var src = video.src;
            video.src = src;
        }
    });
};

function rm_events(element) {
    $(element).off('click');
}

const checkbox_spans = docQA('.checkboxes span');
checkbox_spans.forEach(span => { // Clicking on checkbox containers will select the checkbox input. There's also a CSS reference for pointer-events: none;
    span.addEventListener('click', () => {
        span.getElementsByTagName('input')[0].click();
    });
});

// ==============================
// Init Shuffle App
// ==============================

const uuid_input = docQ('#uuid_input'),
    login_button = docQ('#login_button'),
    sign_up_button = docQ('#sign_up_button'),
    profile_button = docQ('#profile_button'),
    status = docQ('#status');

function init() {
    console.log('Initializing App');
    route_user(spotify_id);
}

function route_user(uuid) { // Check user validity then route to login or sign up
    const docRef = db.collection('users').doc(uuid);
    docRef.get().then(function(doc) {
        doc.exists && doc.data().new_user ? toggle_page('sign_up_form') : login_shuffle(uuid);
    }).catch(function(error) {
        console.log('Error getting document:', error);
    });
}

// ==============================
// login_form
// ==============================

function init_login_form() {
    stop_players();
    match_input.innerText = '';
    back_button.style.display = 'none';
    nav_title.innerText = '';
    chat_box.innerText = '';
    status.innerText = 'Logged out';
}

function login_shuffle(uuid) { // Logs user into shuffle. 1 param: (the uuid).
    const current_uuid = uuid;

    const docRef = db.collection('users').doc(current_uuid);
    docRef.get().then(function(doc) {
        if (doc.exists) {
            decipher_uuid(current_uuid).then((name) => {
                console.log(`Logged in as: '${name}'`);
                status.innerText = `Logged in as: '${name}'`;
            })

            status.style.color = 'unset';
            toggle_page('match_form');
        } else {
            status.innerText = `'${current_uuid}' is not a user!`;
            status.style.color = 'red';
        }
    }).catch(function(error) {
        console.log(error);
    });
}

// ==============================
// sign_up_form
// ==============================

const sign_up_form = docQ('#sign_up_form'),
    add_account_button = docQ('#add_account_button'),
    school_input = docQ('#school_input'),
    anthem_id_input = docQ('#anthem_id_input'),
    gender_input = docQ('#gender_input'),
    pronouns_input = docQ('#pronouns_input');

function init_sign_up_form() { // Initialize the login form, show back button
    back_button.style.display = 'unset';
    add_account_button.addEventListener('click', (e) => {
        e.preventDefault();
        // Check form validity
        if (docQ('#sign_up_form').checkValidity() === true) {
            create_user(spotify_id);
        } else {
            status.innerText = 'Form is incomplete.';
            status.style.color = 'red';
        }
    })
    philly_collages.forEach(collage => {
        school_input.innerHTML += `
            <option value="${collage}">${collage}</option>
        `;
    });
}

function create_user() { // Create a user
    // Generate data variable
    const data = {
        first_name: first_name_input.value,
        last_name: last_name_input.value,
        age: age_input.value,
        gender: gender_input.value,
        pronouns: pronouns_input.value,
        location: 'Philadelphia, PA',
        school: school_input.value,
        anthem_id: anthem_id_input.value,
        looking_for: merge_checkboxes('lf_checkbox'),
        new_user: false,
        account_created: timestamp()
    };

    // Push data to FireStore
    function push_new_user_data(id_to_use) {
        db.collection('users').doc(id_to_use).set(data).then(function() {
            // alert(`This uuid = ${id_to_use}`);
            console.log('Account Created!');
            sign_up_form.reset(); // Clear input(s)
            login_shuffle(spotify_id);
        }).catch(function(error) {
            console.error(error);
        });
    }
    // Use API user id
    const id_to_use = spotify_id;
    push_new_user_data(id_to_use);
}

function merge_checkboxes(category) { // [Reusable] Combines values of checkboxes by category
    const boxes = docQA(`.${category}`),
        checked = [];
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

const pick_match_button = docQ('#pick_match_button'),
    match_form = docQ('#match_form');

function init_match_form(current_uuid) { // Initialize match chat selection form
    back_button.style.display = 'none'; // While no logout
    stop_players();
    list_users(current_uuid);
    pick_match_button.addEventListener('click', (e) => {
        e.preventDefault();
        const match_uuid = match_input.value,
            thread_id = set_thread_id(current_uuid, match_uuid);
        toggle_page('chat_form');
        init_chat_form(current_uuid, match_uuid);
        recall_chat(current_uuid, match_uuid, thread_id);
        message_input.focus();
    })

    // User profile button
    load_profile_button(current_uuid, current_uuid);
}

function load_profile_button(target, current_uuid) {
    profile_button.style.display = 'flex';

    rm_events('#profile_button');
    $('#profile_button').one('click', function(e) {
        e.preventDefault();
        toggle_page('profile_form');
        init_profile_form(target, current_uuid);
    });
}

function list_users(current_uuid) { // Populates SELECT form with matches
    const docRef = db.collection('users').where('new_user', '==', false); // Where users are new
    docRef.get().then(function(doc) {
            match_input.innerHTML = '';
            doc.forEach(function(doc) {
                // if (!(doc.id === current_uuid) && (!user_blocked(current_uuid, doc.id))) { // NOT WORKING
                if (!(doc.id === current_uuid)) { // Don't show your own profile
                    decipher_uuid(doc.id).then((name) => {
                        match_input.innerHTML += `
                    <option value="${doc.id}">${name}</option>
                    `
                    });
                    user_blocked(current_uuid, doc.id); // TEMP FIX
                }
            });
        })
        .catch(function(error) {
            console.log('Error getting documents: ', error);
        })
}

function user_blocked(current_uuid, target) { // Checks if target user is blocked by current user
    const docRef1 = db.collection('users').doc(current_uuid).collection('blocked').doc(target);
    docRef1.get().then(function(doc) {;
        if (doc.exists && doc.data().blocked) {
            rm_listed_user(target);
            return true;
        } else {
            const docRef2 = db.collection('users').doc(target).collection('blocked').doc(current_uuid);
            docRef2.get().then(function(doc) {
                if (doc.exists && doc.data().blocked) {
                    rm_listed_user(target);
                    return true;
                } else {
                    return false;
                }
            }).catch(function(error) {
                console.log('Error getting document:', error);
            });
        }

    }).catch(function(error) {
        console.log('Error getting document:', error);
    });
}

function rm_listed_user(target) {
    docQ(`option[value="${target}"]`).remove();
    console.log(`${target} is blocked, removing from list (THIS IS A TEMP FIX...)`);
}

// ==============================
// chat_form
// ==============================

const message_input = docQ('#message_input'),
    send_button = docQ('#send_button');

function init_chat_form(current_uuid, match_uuid) { // Initializes the chat form
    back_button.style.display = 'flex';

    rm_events('#send_button');
    $('#send_button').one('click', function(e) {
        e.preventDefault();
        send_message(current_uuid, match_uuid);
    });

    // User profile button
    load_profile_button(match_uuid, current_uuid);
}

function send_message(current_uuid, match_uuid) { // Sends a message from chat form message input
    if (message_input.value) {
        const data = {
            content: message_input.value,
            from: current_uuid,
            to: match_uuid,
            when: timestamp()
        };
        db.collection('chats').doc('thread-' + thread_id).collection('messages').doc().set(data).then(function() {
            chat_form.reset(); // Clear input(s)
            status.style.color = 'unset';
            status.innerText = 'Message Sent!';
            console.log('Message Sent!');
        }).catch(function(error) {
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
        console.log(`Chatting with: ${name}`);
    });

    const docRef = db.collection('chats').doc('thread-' + thread_id).collection('messages');
    docRef.orderBy('when', 'asc') // Index Collection ID: 'chats'
        .get()
        .then(function(querySnapshot) {
            // Decipher ID
            decipher_uuid(match_uuid).then((name) => {
                nav_title.innerText = name;
            });

            chat_box.innerHTML = '';
            querySnapshot.forEach(function(doc) {
                const content = (doc.id, ' => ', doc.data().content),
                    from = (doc.id, ' => ', doc.data().from),
                    time = (doc.id, ' => ', format_fs_tstamp(doc.data().when)),

                    element = `
                    <li class="message ${who_sent(from, current_uuid)}">
                        <p class="name">${content}</p>
                        <p class="time">${time}</p>
                    </li>
                    `;
                chat_box.innerHTML += element;
            });
            scroll_to_bottom('tell');
            observe_chat(current_uuid, match_uuid, docRef);
        })
        .catch(function(error) {
            console.log('Error getting documents: ', error);
        });
}

function observe_chat(current_uuid, match_uuid, docRef) { // [!!!Does not stop listening per instance!!!] Sets up event listener for the thread you and your match are on
    docRef.onSnapshot(docSnapshot => { // Observer
        docRef.orderBy('when', 'asc') // Index Collection ID: 'chats'
            .get()
            .then(function(querySnapshot) {
                // Decipher uuid
                decipher_uuid(match_uuid).then((name) => {
                    nav_title.innerText = name;
                });

                chat_box.innerHTML = '';
                querySnapshot.forEach(function(doc) {
                    const content = (doc.id, ' => ', doc.data().content),
                        from = (doc.id, ' => ', doc.data().from),
                        time = (doc.id, ' => ', format_fs_tstamp(doc.data().when)),

                        element = `
                    <li class="message ${who_sent(from, current_uuid)}">
                        <p class="name">${content}</p>
                        <p class="time">${time}</p>
                    </li>
                    `;
                    chat_box.innerHTML += element;
                });
                play_tone();
                scroll_to_bottom('ask');
            })
            .catch(function(error) {
                console.log('Error getting documents: ', error);
            });
    }, err => {
        console.log(`Encountered error: ${err}`);
    });
}

const message_tone = new Audio('assets/sounds/message-tone.mp3');

function play_tone() { // Plays message tone when receiving a message from match
    const last_message = docQ('.message:last-of-type');
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

const stats = docQA('.stat'),
    stat_location_space = docQ('#stat_location_space'),
    stat_name = docQ('#stat_name'),
    stat_location = docQ('#stat_location'),
    stat_school = docQ('#stat_school'),
    stat_age = docQ('#stat_age'),
    stat_looking_for = docQ('#stat_looking_for'),
    stat_gender = docQ('#stat_gender'),
    stat_pronouns = docQ('#stat_pronouns'),
    stat_account_created = docQ('#stat_account_created'),
    anthem_wrap = docQ('#anthem_wrap'),
    stat_anthem_label = docQ('#stat_anthem_label'),
    stat_anthem = docQ('#stat_anthem'),
    modal_match_options = docQ('#modal_match_options'),
    match_options_button = docQ('#match_options_button'),
    report_user_button = docQ('#report_user'),
    block_user_button = docQ('#block_user');

function init_profile_form(target, current_uuid) { // Initializes profile page
    nav_title.innerText = '';
    profile_button.style.display = 'none';
    back_button.style.display = 'flex';

    if (target === current_uuid) { // If it's current_uuid profile
        // Add edit button
    } else { // If it's the matches profile
        // Add match options button
        match_options_button.style.display = 'flex';

        rm_events('#match_options_button');
        $('#match_options_button').one('click', function(e) {
            e.preventDefault();
            modal.style.display = 'flex';
            modal_match_options.style.display = 'flex';
        });
        rm_events('#block_user_button');
        $('#block_user_button').one('click', function(e) {
            e.preventDefault();
            block_user(target, current_uuid);
        });
    }

    // Display data
    const docRef = db.collection('users').doc(target);
    docRef.get()
        .then(function(doc) {
            const result = doc.data(); // Make doc.data() a variable for convenience
            load_profile_stats(result);
        })
        .catch(function(error) {
            console.log('Error getting documents: ', error);
        })
}

function load_profile_stats(result) {
    // === Get Field Contents ===

    // Required Stats
    const first_name = result.first_name,
        last_name = result.last_name,
        account_created = result.account_created;

    // Optional Stats
    let age = result.age || false,
        gender = result.gender || false,
        pronouns = result.pronouns || false,
        location = result.location || false,
        school = result.school || false,
        looking_for = result.looking_for || false,
        anthem_id = result.anthem_id || false;

    // Find & Classify Empty Fields
    age ? stat_age.removeAttribute('data-status') : stat_age.dataset.status = 'empty';
    gender ? stat_gender.removeAttribute('data-status') : stat_gender.dataset.status = 'empty';
    pronouns ? stat_pronouns.removeAttribute('data-status') : stat_pronouns.dataset.status = 'empty';
    location ? stat_location.removeAttribute('data-status') : stat_location.dataset.status = 'empty';
    school ? stat_school.removeAttribute('data-status') : stat_school.dataset.status = 'empty';
    looking_for ? stat_looking_for.removeAttribute('data-status') : stat_looking_for.dataset.status = 'empty';

    // Hide Empty Fields
    for (var i = 0, len = stats.length; i < len; i++) {
        if (stats[i].dataset.status == 'empty') {
            stats[i].parentElement.style.display = 'none';
        } else {
            stats[i].parentElement.style.display = 'flex';
        }
    };

    // Hide Anthem if Empty
    if (anthem_id) {
        stat_anthem_label.innerText = `${first_name}'s Anthem`;
        stat_anthem.src = `https://open.spotify.com/embed/track/${anthem_id}`;
    } else {
        anthem_wrap.style.display = 'none';
    }

    // === Inject Field Content ===

    // Required
    stat_name.innerText = first_name + ' ' + last_name;
    stat_account_created.innerText = moment(account_created.toDate()).format('M/D/YY');

    // Optional
    stat_age.innerText = age;
    stat_gender.innerText = gender;
    stat_pronouns.innerText = pronouns;
    stat_location.innerText = location;
    stat_school.innerText = school;
    stat_looking_for.innerText = looking_for;
}

function block_user(target, current_uuid) {
    docRef = db.collection('users').doc(current_uuid).collection('blocked').doc(target);

    const data = { // Create data
        blocked: true,
    };

    docRef.set(data).then(function() { // Push data to DB
        // do stuff after
        decipher_uuid(target).then((name) => {
            console.log(`Blocked ${name}...`);
        })
    }).catch(function(error) {
        console.error(error);
    });
}

init(); // First Function

// ==============================
// TASKS
// ==============================

// Completed This Week

// #1. *Gender drop-down for profile setup
// #2. *Pronoun drop-down for profile setup
// #3. *Fixed double init issue

// #Priority tasks

// #2. Merge search for anthem song (Gabby), cannot refresh page

// Test if one time event still piles on, it is...
// #3. Ability to block users.
// #4  Ability to delete account.
// #5. Delete chat history on account deletion.

// #6. Remove node_mode when gabby is done debugging

// Down the road

// #4. Edit profile after creation.

// Scope Creep Tasks

// #1. Guilty-Pleasure song
// #2. Last active stat, query users only active in passed x days
// #3. Embedded chat messages for links, music. (Try to get meta to appear)
// #4. Offline chat storage
// #5. Delete messages, appear as 'Message Deleted'