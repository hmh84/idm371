var firebaseConfig = {
    apiKey: "AIzaSyBlBedJDEvem2r8myXJf4gmoHlHIY8cqGI",
    authDomain: "shuffle-devtest.firebaseapp.com",
    databaseURL: "https://shuffle-devtest.firebaseio.com",
    projectId: "shuffle-devtest",
    storageBucket: "shuffle-devtest.appspot.com",
    messagingSenderId: "540304405587",
    appId: "1:540304405587:web:c4dd45e44d7fe236f542a6"
};
firebase.initializeApp(firebaseConfig);
var db = firebase.firestore();