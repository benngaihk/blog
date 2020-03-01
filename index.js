
// Your web app's Firebase configuration
var firebaseConfig = {
apiKey: "AIzaSyCcSfoCjlWXVeIWRg9bos1Vfe2Qi7Jjvug",
authDomain: "blog-e1804.firebaseapp.com",
databaseURL: "https://blog-e1804.firebaseio.com",
projectId: "blog-e1804",
storageBucket: "blog-e1804.appspot.com",
messagingSenderId: "787267457183",
appId: "1:787267457183:web:518a8e67c5c9fb39a4d2aa",
measurementId: "G-SLKHQBJ5TS"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

var db = firebase.firestore();

var editMode = false;

$(init);

function init()
{
	
	initBtn();
	initData();
}

function initBtn()
{

	$('#btn-login').click(function() {
		var provider = new firebase.auth.GoogleAuthProvider();
		provider.setCustomParameters({
		  'login_hint': 'user@example.com'
		});
		firebase.auth().signInWithPopup(provider).then(function(result) {
			$('.btn-logout').removeClass("hidden");
			$('.btn-login').addClass('hidden');
			// This gives you a Google Access Token. You can use it to access the Google API.
			var token = result.credential.accessToken;
			// The signed-in user info.
			var user = result.user;
			// ...
			console.log(user);

			db.collection("users").doc(user.email).get().then((querySnapshot) => {
			    querySnapshot.forEach((doc) => {
			        let userObj = doc.data();
			        if(userObj.role == 1)
			        {
			        	openEditMode();
			        }
			        else
			        {
			        	closeEditMode();
			        }
			    });
			});




		}).catch(function(error) {
			// Handle Errors here.
			var errorCode = error.code;
			var errorMessage = error.message;
			// The email of the user's account used.
			var email = error.email;``
			// The firebase.auth.AuthCredential type that was used.
			var credential = error.credential;
			// ...
			console.log(error);
		});
	});

	$('#btn-logout').click(function() {
		firebase.auth().signOut().then(function() {
			// Sign-out successful.
			$('.btn-logout').addClass("hidden");
			$('.btn-login').removeClass('hidden');
		}).catch(function(error) {
			// An error happened.
		});
	});

	$(".btn-edit").click(function() {
		$(this).addClass("hidden");
		let parent = $(this).closest(".text-container");
		$(parent.find(".btn-confirm")).removeClass("hidden");
		$(parent.find('.text-content')).attr("contenteditable", true);
	});

	$(".btn-confirm").click(function() {
		let btnConfirm = $(this);
		let parent = $(this).closest(".text-container");
		let btnEdit = $(parent.find(".btn-edit"));
		let parentId = $(parent).attr('id');
		let textContent = $(parent.find('.text-content'));
		let text = $(textContent).html();
		db.collection("content").doc(parentId).set({
			containerId: parentId,
		    text: text,
		})
		.then(function() {
		    console.log("Document successfully written!");
		    $(btnConfirm).addClass("hidden");
		    $(textContent).attr("contenteditable", false);
		    $(btnEdit).removeClass("hidden");
		})
		.catch(function(error) {
		    console.error("Error writing document: ", error);
		});
	});
}

function initData()
{
	db.collection("content").get().then((querySnapshot) => {
	    querySnapshot.forEach((doc) => {
	        let contentObj = doc.data();
	        let containerId = contentObj.containerId;
	        let text = contentObj.text;
	        let container = $("#"+containerId);
	        $(container.find(".text-content")).html(text);
	    });
	});
}

function openEditMode()
{
	editMode = true;
	$(".btn-edit-container").removeClass("hidden");
}
function closeEditMode()
{
	editMode = false;
	$(".btn-edit-container").addClass("hidden");
}
