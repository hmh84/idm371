// ==============================
// Get Login Data
// ==============================

var hashParams = {};
var e, r = /([^&;=]+)=?([^&;]*)/g,
    q = window.location.hash.substring(1);
while (e = r.exec(q)) {
    hashParams[e[1]] = decodeURIComponent(e[2]);
}

let spotify_id = hashParams.user_id,
    new_user = hashParams.new_user,
    access_token = hashParams.access_token,
    refresh_token = hashParams.refresh_token;

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
    // Used for naggy shorthand if statements
}

function toggle_page(new_form) { // Hides all forms except the form pass to 'new_form' argument, lodes back button
    chat_box.innerText = '';
    profile_button.style.display = 'none';
    toggle_modal('close');
    if (new_form == 'login_form') {
        init_login_form();
    } else if (new_form == 'sign_up_form') {
        // this init happens once only, therefore its in init()
    } else if (new_form == 'browse_users_form') {
        init_browse_users_form(spotify_id);
    } else if (new_form == 'profile_view_form') {
        profile_options_button.style.display = 'flex';
    } else if (new_form == 'profile_cms_form') {
        init_profile_cms_form(spotify_id);
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
    browse_profiles_list = docQ('#browse_profiles_list'),
    modal = docQ('#modal'),
    all_modals = docQA('.modal_common'),
    modal_close_button = docQA('.modal_close_button'),
    modal_match_options = docQ('#modal_match_options'),
    modal_profile_options = docQ('#modal_profile_options');

back_button.addEventListener('click', (e) => {
    e.preventDefault();
    stop_players();

    nav_title.innerText = '';
    chat_box.innerText = '';
    broadcast('', 'unset'); // Reset status

    toggle_page(back_button.dataset.value);
})

function load_back_button(this_form) { // Adds correct link to back button
    if (this_form == 'sign_up_form' || this_form == 'browse_users_form') {
        back_button.dataset.value = 'login_form';
    } else if (this_form == 'chat_form' || this_form == 'profile_view_form') {
        back_button.dataset.value = 'browse_users_form';
    } else if (this_form == 'profile_cms_form') {
        back_button.dataset.value = 'profile_view_form';
    } else if (this_form == 'add_anthem') {
        back_button.dataset.value = 'none';
    }
}

function toggle_modal(new_modal) {
    // document.body.classList.add('noscroll');
    modal.style.display = 'flex';
    all_modals.forEach(modal => {
        modal.style.display = 'none';
    });
    if (new_modal == 'close') {
        modal.style.display = 'none';
        // document.body.classList.remove('noscroll');
    } else {
        docQ(`#${new_modal}`).style.display = 'flex';
    }
};

modal_close_button.forEach(button => {
    button.addEventListener('click', (e) => {
        e.preventDefault();
        toggle_modal('close');
    });
});

function decipher_uuid(uuid) { // Turns UUID strings into first_name
    const docRef = db.collection('users').doc(uuid);
    return docRef.get()
        .then(doc => doc.data().first_name)
        .catch(error => console.log(error));
}

function user_new(uuid) { // Checks if target user is new
    const docRef = db.collection('users').doc(uuid);
    docRef.get().then(function (doc) {
        return doc.data().new_user;
    }).catch(function (error) {
        console.log(error);
    });
}

function stop_players() {
    if (stat_anthem.src) {
        const src = stat_anthem.src;
        stat_anthem.src = src;
    }
}

function rm_events(object, hard_rm) {
    // hard_rm param should be false for JQuery events, true for Vanilla JS events
    // Always try using false first, if event duplicates, try a JQuery event, if still duping, try true
    $(object).off('click');
    $(object).unbind('click');
    $(object).unbind('change');
    if (hard_rm) { // If hard_rm === true
        // This physically replaces the object to force remove all events
        const old_e = docQ(object);
        const new_e = old_e.cloneNode(true);
        old_e.parentNode.replaceChild(new_e, old_e);
    }
}

const checkbox_spans = docQA('.checkboxes span');
checkbox_spans.forEach(span => { // Clicking on checkbox containers will select the checkbox input. There's also a CSS reference for pointer-events: none;
    span.addEventListener('click', () => {
        span.getElementsByTagName('input')[0].click();
    });
});

function broadcast(message, color) { // Sends a feedback message to the user
    status.innerText = message;
    status.style.color = color;
    status.style.opacity = '1';
    setTimeout(function () { // Show for 5000ms (5s)
        status.style.opacity = '0';
        setTimeout(function () { // Clear message text after 500ms (0.5s)
            status.innerText = '';
        }, 500);
    }, 5000);
}

function disable_autofill() {
    const all_text_inputs = docQA('input');
    console.log(all_text_inputs);
    all_text_inputs.forEach(input => {
        input.setAttribute('autocomplete', 'off');
    });
}

disable_autofill(); // Init

// ==============================
// Init Shuffle App
// ==============================

const profile_button = docQ('#profile_button'),
    status = docQ('#status');

function init() {
    console.log('Initializing App');
    route_user(spotify_id);
    init_nav(spotify_id);
}

function route_user(uuid) { // Check user validity then route to login or sign up
    const docRef = db.collection('users').doc(uuid);
    docRef.get().then(function (doc) {
        doc.exists && doc.data().new_user ? init_sign_up_form(uuid) : login_shuffle(uuid);
    }).catch(function (error) {
        console.log('Error getting document:', error);
    });
}

const nav_profile_button = docQ('#nav_profile_button'),
    nav_chat_button = docQ('#nav_chat_button'),
    nav_browse_button = docQ('#nav_browse_button');

function init_nav(current_uuid) {
    nav_profile_button.addEventListener('click', () => {
        toggle_page('profile_view_form');
        init_profile_view_form(current_uuid, current_uuid);
    });
    nav_chat_button.addEventListener('click', () => {
        toggle_page('recent_chat_form');
        init_recent_chat_form(current_uuid);
    });
    nav_browse_button.addEventListener('click', () => {
        toggle_page('browse_users_form');
    });
}

// ==============================
// login_form
// ==============================

function init_login_form() {
    stop_players();
    browse_profiles_list.innerText = '';
    back_button.style.display = 'none';
    nav_title.innerText = '';
    chat_box.innerText = '';
    broadcast('Logged out', 'unset');
}

function login_shuffle(current_uuid) { // Logs user into shuffle. 1 param: (the uuid).
    const docRef = db.collection('users').doc(current_uuid);
    docRef.get().then(function (doc) {
        if (doc.exists) {
            decipher_uuid(current_uuid).then((name) => {
                broadcast(`Logged in as: '${name}'`, 'unset');
            })

            toggle_page('browse_users_form');
        } else {
            broadcast(`'${current_uuid}' is not a user!`, 'var(--red)');
        }
    }).catch(function (error) {
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
    pronouns_input = docQ('#pronouns_input'),
    bio_input = docQ('#bio_input');

function init_sign_up_form(id_to_use) { // Initialize the login form, show back button
    toggle_page('sign_up_form');
    back_button.style.display = 'unset';
    rm_events('#add_account_button', false);
    $('#add_account_button').on('click', (e) => {
        e.preventDefault();
        // Check form validity
        if (docQ('#sign_up_form').checkValidity() === true) {
            create_user(id_to_use);
        } else {
            create_user(id_to_use); //TEMPORARILY DISABLED CHECK FOR SEARCH DEV
            //broadcast('Form is incomplete.', 'var(--red)');
        }
    })
    philly_collages.forEach(collage => {
        school_input.innerHTML += `
            <option value="${collage}">${collage}</option>
        `;
    });
}

function create_user(id_to_use) { // Create a user
    // Generate data variable
    const data = {
        first_name: first_name_input.value,
        last_name: last_name_input.value,
        age: age_input.value,
        gender: gender_input.value,
        pronouns: pronouns_input.value,
        location: 'Philadelphia, PA',
        school: school_input.value,
        anthem_id: anthem_id_input.dataset.anthem,
        looking_for: merge_checkboxes('looking_for'),
        bio: bio_input.value,
        new_user: false, // Signifies completed profile
        join_date: timestamp(),
    };

    // Push data to FireStore
    db.collection('users').doc(id_to_use).set(data).then(function () {
        console.log('Account Created!');
        login_shuffle(id_to_use);
    }).catch(function (error) {
        console.error(error);
    });
}

function merge_checkboxes(category) { // [Reusable]
    // Combines values of checkboxes by data-category value, returns a string
    const boxes = docQA(`[data-category="${category}"]`),
        checked = [];
    for (var i = 0; boxes[i]; ++i) {
        boxes[i].checked && checked.push(boxes[i].value);
    }
    return checked.join(', '); // Return as string, separated by comma
}

// ==============================
// search_anthem
// ==============================

const search_anthem_button = docQ('#search_anthem_button');

search_anthem_button.addEventListener('click', () => {
    const query = anthem_id_input.value, //what the user searches for
        search_results = docQ('#search_results');

    search_results.innerHTML = ''; //clear out previous results

    $.ajax({  //send info to server - GET request
        url: '/search',
        data: {
            'access_token': access_token,
            'refresh_token': refresh_token,
            'query': query
        }
    }).done(function (results) { //receive info, populate html, add event listeners to tracks to add as anthem
        // Add tracks to page in search results
        results.forEach(result => {
            if (result.id) { // Skip the empty results (Idk why Spotify returns those...)
                const id = result.id,
                    thumb = result.thumb,
                    title = result.title,
                    artist = result.artist,
                    album = result.album;

                const track_element = document.createElement('div'); // Create a div element (Better to do it this way for adding event listener later)
                track_element.classList.add('track'); // Add the class 'track'

                // Then add the content
                track_element.innerHTML += `
                    <img src="${thumb}" id="track_thumbnail">
                    <div class="track_info">
                        <h3 class="track_title">${title}</h3>
                        <h5 class="track_artist">${artist} - ${album}</h5>
                    </div>
                `;

                // Add the track element to the DOM
                search_results.appendChild(track_element);
                // Add an event listener to it
                track_element.addEventListener('click', () => {
                    // Add a data attribute called anthem to the anthem id input for when user completes sign up
                    anthem_id_input.dataset.anthem = id;
                    search_results.innerHTML = ''; //clear out previous results
                    broadcast('Anthem Added!', 'var(--green)');
                });
            }
        });
    });
}, false);

// ==============================
// select_anthem
// ==============================

//WORKING EXAMPLE: USE AJAX - GET REFRESH TOKEN - IGNORE FOR NOW - todo
//document.getElementById('search_anthem').addEventListener('click', function() {
//
//$.ajax({
//  url: '/refresh_token',
//  data: {
//	 'refresh_token': refresh_token
//  }
//}).done(function(data) {
//  access_token_refresh = data.access_token;
//  console.log(access_token_refresh);
//});
//}, false);

// ==============================
// browse_users_form
// ==============================

const browse_users_form = docQ('#browse_users_form');

function init_browse_users_form(current_uuid) { // Initialize match chat selection form
    unsub_all();
    nav_title.innerText = 'Browse Users';
    profile_options_button.style.display = 'none';
    profile_button.style.display = 'none';
    back_button.style.display = 'none'; // While no logout
    stop_players();
    list_users(current_uuid);
}

function load_profile_button(target, current_uuid) {
    profile_button.style.display = 'flex';

    rm_events('#profile_button', false);
    $('#profile_button').one('click', (e) => {
        e.preventDefault();
        toggle_page('profile_view_form');
        init_profile_view_form(target, current_uuid);
    });
}

function list_users(current_uuid) { // Populates SELECT form with matches
    const docRef = db.collection('users').where('new_user', '==', false); // Where users are new
    docRef.get().then(function (doc) {
        browse_profiles_list.innerHTML = '';
        doc.forEach(function (doc) {
            const result = doc.data();
            // if (!(doc.id === current_uuid) && (!user_blocked(doc.id, current_uuid))) { // NOT WORKING
            if (!(doc.id === current_uuid)) { // Don't show your own profile
                decipher_uuid(doc.id).then((name) => {
                    const pp = result.pp || 'assets/graphics/placeholder.png',
                        user_element = document.createElement('div');
                    user_element.classList.add('user');
                    browse_profiles_list.appendChild(user_element);

                    user_element.innerHTML += `
                        <div class="user_top" style="background-image: url(${pp})">
                            <p class="user_name">${name}</p>
                            <p class="user_age">${result.age}</p>
                        </div>
                        <div class="user_btm">
                        <iframe ${result.anthem_id ? 'src=' + 'https://open.spotify.com/embed/track/' + result.anthem_id : 'style="display: none;"'} id="stat_anthem" frameborder="0" allowtransparency="true" allow="encrypted-media"></iframe>
                        </div>
                        `;
                    // ${result.anthem_id && '<p class="anthem_label">' + name + "'s Favorite Song</p>"}

                    user_element.addEventListener('click', () => {
                        const match_uuid = doc.id,
                            thread_id = set_thread_id(current_uuid, match_uuid);
                        toggle_page('chat_form');
                        init_chat_form(current_uuid, match_uuid);
                        recall_chat_history(current_uuid, match_uuid, thread_id);
                    });
                });
                user_blocked(doc.id, current_uuid); // TEMP FIX
            }
        });
    })
        .catch(function (error) {
            console.log('Error getting documents: ', error);
        })
}

function user_blocked(target, current_uuid) { // Checks if target user is blocked by current user
    unblock_user_input.innerText = ''; // Clear out blocked users from CMS
    const docRef1 = db.collection('users').doc(current_uuid).collection('blocked').doc(target);
    docRef1.get().then(function (doc) {
        if (doc.exists && doc.data().blocked) { // Found a block on query 1
            rm_bocked_user();
            add_blocked_user_to_cms(target);
            blocked_users_wrap.style.display = 'flex';
            return true;
        } else {
            const docRef2 = db.collection('users').doc(target).collection('blocked').doc(current_uuid);
            docRef2.get().then(function (doc) {
                if (doc.exists && doc.data().blocked) { // Found a block on query 2
                    rm_bocked_user();
                    add_blocked_user_to_cms(target);
                    return true;
                } else { // No blocked users
                    return false;
                }
            }).catch(function (error) {
                console.log('Error getting document:', error);
            });
        }

    }).catch(function (error) {
        console.log('Error getting document:', error);
    });
}

function rm_bocked_user() { // Temp fix for removing blocked users from user list
    docQ('.user:last-of-type').remove();
    console.log('Last user is blocked, removing from list (THIS IS A TEMP FIX...)');
}

// ==============================
// recent_chat_form
// ==============================

function theID(x) {
    console.log('first class: ' + ('uuid' + x))
    return 'uuid' + x;
}

const recent_chat_list = docQ('#recent_chat_list');

function init_recent_chat_form(current_uuid) {
    nav_title.innerText = 'Recent Chats';
    recent_chat_list.innerHTML = '';
    const docRef = db.collection('chats');
    for (i = 1; i < 3; i++) {
        docRef.where(`uuid${i}`, '==', current_uuid)
            .orderBy('last_activity', 'desc')
            .get().then(function (doc) {
                doc.forEach(function (doc) {
                    const thread_array = (doc.id).split('-');
                    var match_uuid;
                    thread_array[1] === current_uuid ? match_uuid = thread_array[2] : match_uuid = thread_array[1];
                    decipher_uuid(match_uuid).then((name) => {
                        // Year int converter

                        db.collection('users').doc(match_uuid).get()
                            .then(function (doc) {
                                const result = doc.data(),
                                    pp = result.pp || 'assets/graphics/placeholder.png',
                                    user_element = document.createElement('div');

                                user_element.classList.add('user');
                                recent_chat_list.appendChild(user_element);

                                user_element.innerHTML += `
                                <p class="user_name">${name}</p>
                                <img src="${pp}" class="user_thumb">
                            `;

                                user_element.addEventListener('click', () => {
                                    const match_uuid = doc.id,
                                        thread_id = set_thread_id(current_uuid, match_uuid);
                                    toggle_page('chat_form');
                                    init_chat_form(current_uuid, match_uuid);
                                    recall_chat_history(current_uuid, match_uuid, thread_id);
                                });
                            })
                            .catch(function (error) {
                                console.log('Error getting documents: ', error);
                            });
                    });
                    // end stuff
                });
            })
    }
}

// ==============================
// chat_form
// ==============================

const message_input = docQ('#message_input'),
    send_button = docQ('#send_button');

function init_chat_form(current_uuid, match_uuid) { // Initializes the chat form
    back_button.style.display = 'flex';

    const thread_id = set_thread_id(current_uuid, match_uuid);

    rm_events('#send_button', false);
    $('#send_button').on('click', function (e) {
        e.preventDefault();
        send_message(current_uuid, match_uuid, thread_id);
    });
    message_input.focus();

    // User profile button
    load_profile_button(match_uuid, current_uuid);
}

function send_message(current_uuid, match_uuid, thread_id) { // Sends a message from chat form message input
    if (message_input.value) {
        // 1. Set uuid's & last active
        const data = {
            uuid1: current_uuid,
            uuid2: match_uuid,
            last_activity: timestamp(),
        };
        db.collection('chats').doc('thread-' + thread_id).set(data).then(function () {
            // 2. Send the message.
            const data = {
                content: message_input.value,
                from: current_uuid,
                to: match_uuid,
                when: timestamp()
            };
            db.collection('chats').doc('thread-' + thread_id).collection('messages').doc().set(data).then(function () {
                broadcast('Message Sent!', 'var(--green)');
                message_input.value = '';
            }).catch(function (error) {
                console.error(error);
            });
        }).catch(function (error) {
            console.error(error);
        });
    } else {
        broadcast('Type a message to send.', 'var(--red)');
    }
}

function recall_chat_history(current_uuid, match_uuid, thread_id) { // Gets entire chat history when entering chat with a match
    // Decipher match uuid
    decipher_uuid(match_uuid).then((name) => {
        broadcast(`Chatting with: ${name}`, 'unset');
    });

    const docRef = db.collection('chats').doc('thread-' + thread_id).collection('messages');

    docRef.orderBy('when', 'asc') // Index Collection ID: 'chats'
        .get()
        .then(function (querySnapshot) {
            // Decipher ID
            dl_message(querySnapshot, current_uuid, match_uuid);
            scroll_to_bottom('tell');
            observe_chat(current_uuid, match_uuid, docRef);
        })
        .catch(function (error) {
            console.log('Error getting documents: ', error);
        });
}

let subscriptions = [];

function observe_chat(current_uuid, match_uuid, docRef) { // [!!!Does not stop listening per instance!!!] Sets up event listener for the thread you and your match are on
    var sub = docRef.onSnapshot(docSnapshot => { // Observer
        docRef.orderBy('when', 'asc') // Index Collection ID: 'chats'
            .get()
            .then(function (querySnapshot) {
                dl_message(querySnapshot, current_uuid, match_uuid);
                play_tone();
                scroll_to_bottom('ask');
            })
            .catch(function (error) {
                console.log('Error getting documents: ', error);
            });
        subscriptions.push(sub);
    }, err => {
        console.log(`Encountered error: ${err}`);
    });
}

function dl_message(querySnapshot, current_uuid, match_uuid) { // Reusable function for downloading a single message
    // Decipher uuid
    decipher_uuid(match_uuid).then((name) => {
        nav_title.innerText = name;
    });

    chat_box.innerHTML = '';
    querySnapshot.forEach(function (doc) {
        const content = (doc.id, ' => ', doc.data().content),
            from = (doc.id, ' => ', doc.data().from),
            time = (doc.id, ' => ', format_fs_tstamp(doc.data().when));

        chat_box.innerHTML += `
    <li class="message ${who_sent(from, current_uuid)}">
        <p class="name">${content}</p>
        <p class="time">${time}</p>
    </li>
    `;
    });
}

const message_tone = new Audio('assets/sounds/message-tone.mp3');

function play_tone() { // Plays message tone when receiving a message from match
    const last_message = docQ('.message:last-of-type');
    if (last_message) {
        last_message.classList.contains('from_them') && message_tone.play(); // If last message is from them, play
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

function set_thread_id(uuid1, uuid2) { // param uuid1 = current, param uuid2 = match
    // Determines what the thread_id will be based on current_uuid and match_uuid
    let thread_id;
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

function unsub_all() {
    subscriptions.forEach(sub => {
        sub();
    });
}

// ==============================
// profile_view_form
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
    stat_bio = docQ('#stat_bio'),
    stat_join_date = docQ('#stat_join_date'),
    anthem_wrap = docQ('#anthem_wrap'),
    stat_anthem_label = docQ('#stat_anthem_label'),
    stat_anthem = docQ('#stat_anthem'),
    profile_options_button = docQ('#profile_options_button'),
    delete_user_button = docQ('#delete_user_button'),
    blocked_users_button = docQ('#blocked_users_button'),
    report_user_button = docQ('#report_user'),
    block_user_button = docQ('#block_user');

function init_profile_view_form(target, current_uuid) { // Initializes profile page
    console.log('init_profile_view_form');
    nav_title.innerText = 'My Profile';
    profile_button.style.display = 'none';
    back_button.style.display = 'flex';
    rm_events('#profile_options_button', false);

    if (target === current_uuid) { // If it's current_uuid profile
        // Add edit button
        profile_options_button.getElementsByTagName('i')[0].classList.remove('fa-ellipsis-h');
        profile_options_button.getElementsByTagName('i')[0].classList.add('fa-pen');

        rm_events('#profile_options_button', false);
        $('#profile_options_button').on('click', function (e) {
            e.preventDefault();
            toggle_page('profile_cms_form');
        });
    } else { // If it's the matches profile
        // Add match options button
        profile_options_button.getElementsByTagName('i')[0].classList.remove('fa-pen');
        profile_options_button.getElementsByTagName('i')[0].classList.add('fa-ellipsis-h');

        rm_events('#profile_options_button', false);
        $('#profile_options_button').on('click', (e) => {
            e.preventDefault();
            toggle_modal('modal_match_options');
        })
        rm_events('#block_user_button', false);
        $('#block_user_button').one('click', (e) => {
            e.preventDefault();
            toggle_user_block(target, current_uuid, true);
        });
    }

    // Display data
    const docRef = db.collection('users').doc(target);
    docRef.get()
        .then(function (doc) {
            const result = doc.data(); // Make doc.data() a variable for convenience
            display_profile_stats(result);
        })
        .catch(function (error) {
            console.log('Error getting documents: ', error);
        })
}

function display_profile_stats(result) {
    // === Get Field Contents ===

    // Required Stats
    const first_name = result.first_name,
        last_name = result.last_name,
        join_date = result.join_date;

    // Optional Stats
    const age = result.age || false,
        gender = result.gender || false,
        pronouns = result.pronouns || false,
        location = result.location || false,
        bio = result.bio || false,
        school = result.school || false,
        looking_for = result.looking_for || false,
        anthem_id = result.anthem_id || false,
        pp = result.pp || false;

    // ===== Hide Empty Fields =====

    stat_age.parentElement.hidden = !age;
    stat_gender.parentElement.hidden = !gender;
    stat_pronouns.parentElement.hidden = !pronouns;
    stat_bio.parentElement.hidden = !bio;
    stat_location.parentElement.hidden = !location;
    stat_school.parentElement.hidden = !school;
    stat_looking_for.parentElement.hidden = !looking_for;

    // ===== Inject Field Content =====

    // Required
    stat_name.innerText = first_name + ' ' + last_name;
    stat_join_date.innerText = moment(join_date.toDate()).format('M/D/YY');

    // Optional
    stat_age.innerText = age;
    stat_gender.innerText = gender;
    stat_pronouns.innerText = pronouns;
    stat_bio.innerText = bio;
    stat_location.innerText = location;
    stat_school.innerText = school;
    stat_looking_for.innerText = looking_for;

    // ===== Custom Field Handlers =====

    // Handler for Anthems
    if (anthem_id) { // Anthem is set
        stat_anthem_label.innerText = `${first_name}'s Anthem`;
        stat_anthem.src = `https://open.spotify.com/embed/track/${anthem_id}`;
    } else { // Anthem isn't set
        anthem_wrap.style.display = 'none';
    }

    // Handler for Profile Pics
    if (pp) {
        profile_pic_placeholder.style.display = 'none';
        stat_pp.src = pp; // Insert source
    } else {
        profile_pic_placeholder.style.display = 'block';
        stat_pp.src = ''; // Insert source
    }
}

function toggle_user_block(target, current_uuid, command) {
    docRef = db.collection('users').doc(current_uuid).collection('blocked').doc(target);

    const data = { // Create data
        blocked: command,
    };

    docRef.set(data).then(function () { // Push data to DB
        // do stuff after
        decipher_uuid(target).then((name) => {
            console.log(`Toggling block on ${name}...`);
        });
        toggle_page('browse_users_form'); // Back out
    }).catch(function (error) {
        console.error(error);
    });
}

const stat_pp = docQ('#stat_pp'),
    profile_pic_placeholder = docQ('#profile_pic_placeholder');

// ==============================
// profile_cms_form
// ==============================

const unblock_user_input = docQ('#unblock_user_input'),
    unblock_user_button = docQ('#unblock_user_button'),
    blocked_users_wrap = docQ('#blocked_users_wrap');

function init_profile_cms_form(current_uuid) {
    nav_title.innerText = 'Edit Profile';
    profile_options_button.style.display = 'none';

    rm_events('#unblock_user_button', false);
    $('#unblock_user_button').on('click', (e) => { // Set up unblock button
        e.preventDefault();
        toggle_user_block(unblock_user_input.value, current_uuid, false); // Unblocks the user w/ false param
    });
    rm_events('#delete_user_button', false);
    $('#delete_user_button').on('click', (e) => {
        e.preventDefault();
        delete_user(current_uuid);
    });
    prep_photo_input(current_uuid);
}

const pp_input = docQ('#pp_input'),
    pp_thumb = docQ('#pp_thumb'),
    pp_upload = docQ('#pp_upload'),
    pp_change_button = docQ('#pp_change_button');

pp_change_button.addEventListener('click', (e) => {
    e.preventDefault();
    pp_input.click();
})

function prep_photo_input(current_uuid) { // Prepares the input and upload functions for a profile pic
    rm_events('#pp_input', false);
    rm_events('#pp_upload', false);

    upload_unready(); // Do this first

    function upload_unready() {
        pp_thumb.src = '';
        pp_thumb.hidden = true;
        docQ('#pp_upload').setAttribute('disabled', true);
    }
    function upload_ready() {
        pp_thumb.hidden = false;
        docQ('#pp_upload').removeAttribute('disabled');
    }

    let files = [];

    $('#pp_input').on('change', function (e) {
        e.preventDefault();
        // Do stuff
        files = e.target.files;
        if (typeof files[0] === 'object') { // File attached
            // If there's a file
            var reader = new FileReader();
            reader.onload = function () {
                pp_thumb.src = reader.result;
                reader = null;
            }
            reader.readAsDataURL(files[0]);
            upload_ready(); // Styles
        } else { // No file attached
            upload_unready(); // Styles
        }
    });

    $('#pp_upload').on('click', function (e) {
        e.preventDefault();
        // Upload the file
        var upload_task = firebase.storage().ref(`profile_pics/${current_uuid}/1.jpeg`).put(files[0]);
        upload_task.snapshot.ref.getDownloadURL().then(function (url) {
            // Set the file reference in the user
            const docRef = db.collection('users').doc(current_uuid);
            const data = { // Create data
                pp: url,
            };
            docRef.update(data).then(function () { // Push data to DB
                // do stuff after
                broadcast('Upload complete', 'var(--green)');
                upload_unready() // Styles
            }).catch(function (error) {
                console.error(error);
            });
        });
    });
}

function add_blocked_user_to_cms(target) { // Adds all blocked users unblock form
    blocked_users_wrap.style.display = 'flex';
    decipher_uuid(target).then((name) => {
        unblock_user_input.innerHTML += `
        <option value="${target}">${name}</option>
        `;
    });
}

unblock_user_input.addEventListener('change', () => { // Only enable button while option is selected
    unblock_user_button.disabled = !unblock_user_input.value;
});

function delete_user(current_uuid) {
    // ===== 1. Delete Blocked Documents =====

    var docRef = db.collection('users').doc(current_uuid).collection('blocked');

    docRef.get().then(function (doc) {
        browse_profiles_list.innerHTML = '';
        doc.forEach(function (doc) {
            docRef.doc(doc.id).delete();
        });

        // ===== 2. Delete User Chat Threads =====

        var docRef = db.collection('chats');

        for (var i = 1; i <= 2; i++) { // 2 because there's only ever 2 participants in one thread
            docRef.where(`uuid${i}`, '==', current_uuid).get().then(function (doc) {
                doc.forEach(function (doc) {
                    var thread_id = doc.id;
                    docRef.doc(thread_id).delete();
                    // Recursive message delete
                    docRef.doc(thread_id).collection('messages').get().then(function (doc) {
                        doc.forEach(function (doc) {
                            docRef.doc(thread_id).collection('messages').doc(doc.id).delete();
                        });
                    })
                        .catch(function (error) {
                            console.log('Error getting documents: ', error);
                        })
                    // End of recursive
                });

                // ===== 3. Delete User Profile Pics =====

                const ref = firebase.storage().ref(`profile_pics/${current_uuid}`);
                ref.listAll()
                    .then(dir => {
                        dir.items.forEach(fileRef => {
                            deleteFile(ref.fullPath, fileRef.name);
                        });
                        dir.prefixes.forEach(folderRef => {
                            deleteFolderContents(folderRef.fullPath);
                        })
                    })
                    .catch(error => {
                        console.log(error);
                    });

                function deleteFile(pathToFile, fileName) {
                    const ref = firebase.storage().ref(pathToFile);
                    const childRef = ref.child(fileName);
                    childRef.delete();
                }
            })
                .catch(function (error) {
                    console.log('Error getting documents: ', error);
                })
        }
    })
        .catch(function (error) {
            console.log('Error getting documents: ', error);
        })
    // ===== 4. Delete the User Document Itself =====

    setTimeout(function () {
        // I am delayed
        db.collection('users').doc(current_uuid).delete();

        // window.location.replace('index.html'); // Exit page
    }, 1500);
}

init(); // First Function

// ==============================
// TASKS
// ==============================

// Completed This Week

// #1. Recent chat page, sorts by last activity
// #2. Made browse page like the UI prototype

// === Priority tasks...

// Ability to fully edit profile after creation
// Add user photos (on setup page)
// Add conditions to load_back_button() for the new pages
// Optimize :last-of-type JS queries
// Optimize profile pictures to be background images and combine show/hide if statement on profile view page
// Optimize the chat recall & observer

// === Scope Creep Tasks...

// #1. *Last active stat, query users only active in passed x days.
// #2. *Embedded chat messages for links, music. (Try to get meta to appear).
// #3. *Offline chat storage.
// #4. *Delete messages, appear as 'Message Deleted'.
// #5. *Limit browse user results and chat message results.