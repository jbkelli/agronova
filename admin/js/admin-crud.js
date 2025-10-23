// browser script (remove any Node-specific requires)
const POST_STATUS = document.getElementById('post-status');
const LOGOUT_BTN = document.getElementById('logout-btn');
const POST_FORM = document.getElementById('post-form');
// from admin/html/admin-dashboard.html the login file is one level up in the admin folder
const LOGIN_URL = '/index.html';

//Protection using authorized checkin
function setupAuthGuard() {
    auth.onAuthStateChanged(async (user) => {
        if(!user){
            window.location.href = LOGIN_URL;
            return;
        }

        //checking if the logged in user had the claim 'admin : true'
        const idTokenResult = await user.getIdTokenResult();
        if(idTokenResult.claims.admin !== true){
            await auth.signOut();
            window.location.href = LOGIN_URL;
        }
        //If the stage passes, the content will be displayed
    });
}

//allowing the crud operations
const IMGBB_API_KEY = 'dd213a9f638850674999a0f4cf2c853a';

//converting the file object to base64 string for IMGBB API
function fileToBase64(file){
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result.split(',')[1]); //we only need the base64 part
        reader.onerror = error => reject(error);
    });
}

//uploading the image to the imgbb
async function uploadImage(file) {
    POST_STATUS.textContent = "External host: Converting image....";

    //converting the image to Base64
    const base64Image = await fileToBase64(file);

    //preparing the API request
    const formData = new FormData();
    formData.append('image', base64Image);

    POST_STATUS.textContent = "External host: Uploading image via API....";

    const response = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, {
        method: 'POST',
        body: formData,
    });

    const result = await response.json();

    if(result.success){
        //getting the direct URL
        const imageUrl = result.data.url;
        document.getElementById('image-url-status').textContent = `Image URL: ${imageUrl}`;
        return imageUrl;

    }
    else{
        console.error("ImgBB API Error:", result);
        throw new Error(`External Image Upload Failed: ${result.status_code || 'Unknown error'}`);

    }
}

//Updating to no longer require
async function handlePostSubmission(e) {
    e.preventDefault();

    const title = document.getElementById('post-title').value;
    const summary = document.getElementById('post-summary').value;
    const content = document.getElementById('post-content').value;
    const imageFile = document.getElementById('post-image').files[0];

    if(!title || !content || !imageFile){
        POST_STATUS.textContent = "ERROR: Please fill all fields.";
        POST_STATUS.style.color = 'var(--color-error)';
        return;
    }

    try{
        POST_STATUS.textContent = "PROCESSING.....";
        POST_STATUS.style.color = 'var(--color-secondary)';

        //Uploading the image
        const imageUrl = await uploadImage(imageFile);

        //preparing and saving the data to firestore
        const postData = {
            title: title,
            summary: summary,
            content: content,
            imageUrl: imageUrl,
            date: firebase.firestore.FieldValue.serverTimestamp(),
            authorUid: auth.currentUser.uid
        };

        await db.collection('news_posts').add(postData);

        POST_STATUS.textContent = "Event Published Successfully!";
        POST_STATUS.style.color = 'var(--color-primary)';
        document.getElementById('image-url-status').textContent = `Image URL: (Last Post: ${imageUrl.substring(0, 40)}))`

        POST_FORM.reset(); //this clears the form after success
    }
    catch(error){
        POST_STATUS.textContent = `Failed to upload post: ${error.message.split('(')[0]}`;
        POST_STATUS.style.color = 'var(--color-error)';
        console.error("Post error:", error);
    }
}

//adding event listeners for submitting the form and logging out (guarded)
if(POST_FORM){
    POST_FORM.addEventListener('submit', handlePostSubmission);
}

if(LOGOUT_BTN){
    LOGOUT_BTN.addEventListener('click', async () => {
        await auth.signOut();
        window.location.href = LOGIN_URL;
    });
}

//running the authorization immediately
setupAuthGuard();