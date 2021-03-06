
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
var currDateArr = [];
var currDate;
var editor;
var currContainerId;

$(init);

function init()
{
	
	initEditor();
	initBtn();
	initData();
}

function initEditor()
{
	ClassicEditor
	    .create( document.querySelector( '#editor' ), {
	        toolbar: [
	            'heading', 'bulletedList', 'numberedList', 'undo', 'redo'
	        ]
	    })
	    .then( newEditor => {
	        editor = newEditor;
	    } )
	    .catch( error => {
	        console.error( error );
	    } );
}

function initBtn()
{

	$('#btn-login').click(function() {
		var provider = new firebase.auth.GoogleAuthProvider();
		provider.setCustomParameters({
		  'login_hint': 'user@example.com'
		});
		firebase.auth().signInWithPopup(provider).then(function(result) {
			$('#btn-logout').removeClass("hidden");
			$('#btn-login').addClass('hidden');
			// This gives you a Google Access Token. You can use it to access the Google API.
			var token = result.credential.accessToken;
			// The signed-in user info.
			var user = result.user;

			db.collection("users").doc(user.email).get().then(function(doc) {
			    if (doc.exists) {
			        console.log("Document data:", doc.data());
			        let userObj = doc.data();
			        if(userObj.role == 1)
			        {
			        	openEditMode();
			        }
			        else
			        {
			        	closeEditMode();
			        }

			    } else {
			        // doc.data() will be undefined in this case
			        console.log("No such document!");

			        closeEditMode();
			    }
			}).catch(function(error) {
			    console.log("Error getting document:", error);
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
			$('#btn-logout').addClass("hidden");
			$('#btn-login').removeClass('hidden');
		}).catch(function(error) {
			// An error happened.
		});
	});

	$(".selector-version").change(function() {
		currDate = $(this).val();
		loadContentData();
	});

	$(".btn-edit").click(function() {
		//$(this).addClass("hidden");
		let parent = $(this).closest(".text-container");
		currContainerId = $(parent).attr('id');
		$(parent.find(".btn-confirm")).removeClass("hidden");
		let html = $(parent.find('.text-content')).html();
		editor.setData(html);
		$(".editor-popup").removeClass("hidden");
		$(".text-container-list").addClass("hidden");
	});

	$(".btn-editor-confirm").click(function() {
		let parent = $("#"+currContainerId);
		let btnEdit = $(parent.find(".btn-edit"));
		let parentId = $(parent).attr('id');
		let textContent = $(parent.find('.text-content'));
		let text = editor.getData();
		db.collection(currDate).doc(parentId).set({
		    text: text,
		})
		.then(function() {
		    console.log("Document successfully written!");
		    //$(btnConfirm).addClass("hidden");
		    //$(textContent).attr("contenteditable", false);
		    //$(btnEdit).removeClass("hidden");
		    $(".editor-popup").addClass("hidden");
		    $(".text-container-list").removeClass("hidden");
		    loadContentData();
		})
		.catch(function(error) {
		    console.error("Error writing document: ", error);
		});
	});
}

function initData()
{
	currDateArr = [];
	$(".selector-version").empty();
	db.collection("meta").get().then(querySnapshot => {
		querySnapshot.forEach((doc) => {
			let metaObj = doc.data();
			if(metaObj.visible)
			{
				currDateArr.push(doc.id);
				$(".selector-version").append(new Option(doc.id, doc.id));
			}
		});
		currDate = maxInDateArr(currDateArr);
		$(".selector-version").val(currDate);
		loadContentData()
	});
}

function loadContentData()
{
	$(".text-content").empty();
	db.collection(currDate).get().then((querySnapshot) => {
	    querySnapshot.forEach((doc) => {
	        let contentObj = doc.data();
	        let containerId = doc.id;
	        let text = contentObj.text;
	        console.log(containerId);
	        let container = $("#"+containerId);
	        $(container.find(".text-content")).html(text);
	    });
	});
}

function openEditMode()
{
	editMode = true;
	$(".btn-edit-container").removeClass("hidden");
	$(".btn-add").removeClass("hidden");
}
function closeEditMode()
{
	editMode = false;
	$(".btn-edit-container").addClass("hidden");
}

function maxInDateArr(dateArr){
	let dataTimeArr = [];

	dateArr.forEach((dateStr) => {
		let dateTime = new Date(dateStr).getTime();
		dataTimeArr.push(dateTime);
	});
	let maxDateTime = dataTimeArr.sort((a,b) => {return b-a;})[0];
	let date = new Date();
	date.setTime(maxDateTime);
    let year = date.getFullYear();
    let month = date.getMonth();
   	
	return year+month +'';
}