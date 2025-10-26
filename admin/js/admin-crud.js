const POST_STATUS = document.getElementById('post-status');
const POST_FORM = document.getElementById('post-form');
const ACHIEVEMENT_FORM = document.getElementById('achievement-form');
const ACHIEVEMENT_STATUS = document.getElementById('achievement-status');

// ================================================
// NOTIFICATION SYSTEM
// ================================================
function showNotification(title, message, type = 'info') {
    const container = document.getElementById('notification-container');
    
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    
    const icons = {
        success: '✓',
        error: '✕',
        warning: '⚠',
        info: 'ℹ'
    };
    
    notification.innerHTML = `
        <span class="notification-icon">${icons[type] || icons.info}</span>
        <div class="notification-content">
            <div class="notification-title">${title}</div>
            <p class="notification-message">${message}</p>
        </div>
        <button class="notification-close" onclick="this.parentElement.remove()">×</button>
    `;
    
    container.appendChild(notification);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease-out forwards';
        setTimeout(() => notification.remove(), 300);
    }, 5000);
}

// Add slideOut animation
const style = document.createElement('style');
style.textContent = `
    @keyframes slideOut {
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// ================================================
// CONFIRMATION MODAL
// ================================================
function showConfirmation(title, message) {
    return new Promise((resolve) => {
        const modal = document.getElementById('confirmation-modal');
        const modalTitle = document.getElementById('modal-title');
        const modalMessage = document.getElementById('modal-message');
        const confirmBtn = document.getElementById('modal-confirm');
        const cancelBtn = document.getElementById('modal-cancel');
        
        modalTitle.textContent = title;
        modalMessage.textContent = message;
        modal.classList.add('active');
        
        const handleConfirm = () => {
            modal.classList.remove('active');
            confirmBtn.removeEventListener('click', handleConfirm);
            cancelBtn.removeEventListener('click', handleCancel);
            resolve(true);
        };
        
        const handleCancel = () => {
            modal.classList.remove('active');
            confirmBtn.removeEventListener('click', handleConfirm);
            cancelBtn.removeEventListener('click', handleCancel);
            resolve(false);
        };
        
        confirmBtn.addEventListener('click', handleConfirm);
        cancelBtn.addEventListener('click', handleCancel);
        
        // Close on overlay click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) handleCancel();
        });
    });
}

// ================================================
// ERROR HANDLER - Specific Messages
// ================================================
function getSpecificErrorMessage(error) {
    const errorCode = error.code;
    const errorMessage = error.message.toLowerCase();
    
    // Firebase Auth Errors
    if (errorCode === 'auth/wrong-password' || errorMessage.includes('wrong-password')) {
        return 'Incorrect password. Please try again.';
    }
    if (errorCode === 'auth/user-not-found' || errorMessage.includes('user-not-found')) {
        return 'No account found with this email address.';
    }
    if (errorCode === 'auth/invalid-email' || errorMessage.includes('invalid-email')) {
        return 'Invalid email format. Please check your email address.';
    }
    if (errorCode === 'auth/too-many-requests' || errorMessage.includes('too-many-requests')) {
        return 'Too many failed attempts. Please try again later.';
    }
    if (errorCode === 'auth/network-request-failed' || errorMessage.includes('network')) {
        return 'Network error. Please check your internet connection.';
    }
    
    // Firestore Errors
    if (errorCode === 'permission-denied' || errorMessage.includes('permission')) {
        return 'Access denied. You do not have permission to perform this action.';
    }
    if (errorCode === 'not-found' || errorMessage.includes('not found')) {
        return 'The requested item was not found.';
    }
    if (errorMessage.includes('offline') || errorMessage.includes('unavailable')) {
        return 'Unable to connect to the server. Please check your connection.';
    }
    
    // Storage/Upload Errors
    if (errorMessage.includes('file') || errorMessage.includes('upload')) {
        return 'File upload failed. Please ensure the file is a valid image (JPG, PNG, GIF).';
    }
    if (errorMessage.includes('size') || errorMessage.includes('large')) {
        return 'File is too large. Please use an image smaller than 5MB.';
    }
    
    // Generic fallback
    return error.message || 'An unexpected error occurred. Please try again.';
}

document.addEventListener("DOMContentLoaded", () => {
    // browser script (remove any Node-specific requires)
    const LOGOUT_BTN = document.getElementById('logout-btn');
    // from admin/html/admin-dashboard.html the login file is one level up in the admin folder
    const LOGIN_URL = '/index.html';

    //adding event listeners for submitting the form and logging out (guarded)
    if(POST_FORM){
        POST_FORM.addEventListener('submit', handlePostSubmission);
    }

    if(ACHIEVEMENT_FORM){
        ACHIEVEMENT_FORM.addEventListener('submit', handleAchievementSubmission);
    }

    if(LOGOUT_BTN){
        LOGOUT_BTN.addEventListener('click', async () => {
            await auth.signOut();
            window.location.href = LOGIN_URL;
        });
    }

    //running the authorization immediately
    setupAuthGuard();

    // Initialize tab navigation
    initializeTabs();

});

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
async function uploadImage(file, urlStatusId = 'image-url-status', statusElement = POST_STATUS) {
    // Validate file
    if (!file) {
        throw new Error('No file selected. Please choose an image to upload.');
    }
    
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
        throw new Error('Invalid file type. Please upload a JPG, PNG, GIF, or WebP image.');
    }
    
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
        throw new Error('File is too large. Maximum size is 5MB. Please compress your image.');
    }

    statusElement.textContent = "External host: Converting image....";

    //converting the image to Base64
    const base64Image = await fileToBase64(file);

    //preparing the API request
    const formData = new FormData();
    formData.append('image', base64Image);

    statusElement.textContent = "External host: Uploading image via API....";

    const response = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, {
        method: 'POST',
        body: formData,
    });

    if (!response.ok) {
        throw new Error(`Image upload failed: Server returned ${response.status}. Please try again.`);
    }

    const result = await response.json();

    if(result.success){
        //getting the direct URL
        const imageUrl = result.data.url;
        const urlStatusElement = document.getElementById(urlStatusId);
        if(urlStatusElement) {
            urlStatusElement.textContent = `Image URL: ${imageUrl}`;
        }
        return imageUrl;

    }
    else{
        console.error("ImgBB API Error:", result);
        throw new Error(result.error?.message || 'Image upload failed. Please try again or use a different image.');

    }
}

//Updating to no longer require
async function handlePostSubmission(e) {
    e.preventDefault();

    const title = document.getElementById('post-title').value.trim();
    const summary = document.getElementById('post-summary').value.trim();
    const content = document.getElementById('post-content').value.trim();
    const imageFile = document.getElementById('post-image').files[0];

    if(!title || !content || !imageFile){
        POST_STATUS.textContent = "ERROR: Please fill all fields.";
        POST_STATUS.style.color = 'var(--color-error)';
        showNotification('Missing Information', 'Please fill in all required fields (title, content, and image).', 'warning');
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

        showNotification('Success!', `News post "${title}" has been published successfully.`, 'success');

        POST_FORM.reset(); //this clears the form after success
    }
    catch(error){
        const specificError = getSpecificErrorMessage(error);
        POST_STATUS.textContent = `Failed: ${specificError}`;
        POST_STATUS.style.color = 'var(--color-error)';
        showNotification('Upload Failed', specificError, 'error');
        console.error("Post error:", error);
    }
}

// ================================================
// TAB NAVIGATION SYSTEM
// ================================================
function initializeTabs() {
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetTab = btn.getAttribute('data-tab');

            // Remove active class from all tabs and contents
            tabBtns.forEach(b => b.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));

            // Add active class to clicked tab and corresponding content
            btn.classList.add('active');
            document.getElementById(`${targetTab}-section`).classList.add('active');

            // Load data based on which tab was clicked
            if(targetTab === 'uploads') {
                loadNewsPosts();
            } else if(targetTab === 'achievements') {
                loadAchievements();
            }
        });
    });
}

// ================================================
// MANAGE NEWS POSTS (UPLOADS SECTION)
// ================================================
async function loadNewsPosts() {
    const uploadsStatus = document.getElementById('uploads-status');
    const newsList = document.getElementById('news-list');

    try {
        uploadsStatus.textContent = 'Loading news posts...';
        uploadsStatus.style.color = 'var(--color-secondary)';
        newsList.innerHTML = '';

        const snapshot = await db.collection('news_posts').orderBy('date', 'desc').get();

        if(snapshot.empty) {
            uploadsStatus.textContent = 'No news posts found.';
            uploadsStatus.style.color = 'var(--color-text)';
            newsList.innerHTML = '<p style="text-align: center; color: #999; padding: 40px;">No news posts yet. Create your first post in the "POST NEWS" tab.</p>';
            return;
        }

        uploadsStatus.textContent = `Found ${snapshot.size} post(s)`;
        uploadsStatus.style.color = 'var(--color-primary)';

        snapshot.forEach(doc => {
            const post = doc.data();
            const postId = doc.id;

            const postCard = document.createElement('div');
            postCard.className = 'upload-item';
            postCard.innerHTML = `
                <img src="${post.imageUrl}" alt="${post.title}" class="upload-item-image">
                <div class="upload-item-content">
                    <h3 class="upload-item-title">${post.title}</h3>
                    <p class="upload-item-date">${post.date ? new Date(post.date.toDate()).toLocaleDateString() : 'Unknown date'}</p>
                    <p class="upload-item-summary">${post.summary}</p>
                    <button class="btn-delete" onclick="deleteNewsPost('${postId}')">DELETE POST</button>
                </div>
            `;

            newsList.appendChild(postCard);
        });

    } catch(error) {
        const specificError = getSpecificErrorMessage(error);
        uploadsStatus.textContent = `Error: ${specificError}`;
        uploadsStatus.style.color = 'var(--color-error)';
        showNotification('Load Failed', specificError, 'error');
        console.error('Load error:', error);
    }
}

async function deleteNewsPost(postId) {
    const confirmed = await showConfirmation(
        'Delete News Post?',
        'Are you sure you want to delete this news post? This action cannot be undone and the post will be permanently removed.'
    );
    
    if (!confirmed) {
        showNotification('Cancelled', 'News post deletion was cancelled.', 'info');
        return;
    }

    const uploadsStatus = document.getElementById('uploads-status');

    try {
        uploadsStatus.textContent = 'Deleting post...';
        uploadsStatus.style.color = 'var(--color-secondary)';

        await db.collection('news_posts').doc(postId).delete();

        uploadsStatus.textContent = 'Post deleted successfully!';
        uploadsStatus.style.color = 'var(--color-primary)';

        showNotification('Deleted Successfully', 'The news post has been permanently removed.', 'success');

        // Reload the posts list
        setTimeout(() => loadNewsPosts(), 1000);

    } catch(error) {
        const specificError = getSpecificErrorMessage(error);
        uploadsStatus.textContent = `Error: ${specificError}`;
        uploadsStatus.style.color = 'var(--color-error)';
        showNotification('Delete Failed', specificError, 'error');
        console.error('Delete error:', error);
    }
}

// Make deleteNewsPost available globally
window.deleteNewsPost = deleteNewsPost;

// ================================================
// ACHIEVEMENTS SECTION
// ================================================
async function handleAchievementSubmission(e) {
    e.preventDefault();

    const caption = document.getElementById('achievement-caption').value.trim();
    const imageFile = document.getElementById('achievement-image').files[0];

    if(!caption || !imageFile){
        ACHIEVEMENT_STATUS.textContent = "ERROR: Please fill all fields.";
        ACHIEVEMENT_STATUS.style.color = 'var(--color-error)';
        showNotification('Missing Information', 'Please provide both a caption and an image.', 'warning');
        return;
    }

    try{
        ACHIEVEMENT_STATUS.textContent = "PROCESSING.....";
        ACHIEVEMENT_STATUS.style.color = 'var(--color-secondary)';

        //Uploading the image
        const imageUrl = await uploadImage(imageFile, 'achievement-url-status', ACHIEVEMENT_STATUS);

        //preparing and saving the data to firestore
        const achievementData = {
            caption: caption,
            imageUrl: imageUrl,
            date: firebase.firestore.FieldValue.serverTimestamp(),
            authorUid: auth.currentUser.uid
        };

        await db.collection('achievements').add(achievementData);

        ACHIEVEMENT_STATUS.textContent = "Achievement Uploaded Successfully!";
        ACHIEVEMENT_STATUS.style.color = 'var(--color-primary)';
        document.getElementById('achievement-url-status').textContent = `Image URL: (Last Upload: ${imageUrl.substring(0, 40)}...)`

        showNotification('Success!', 'Achievement has been added to the gallery.', 'success');

        ACHIEVEMENT_FORM.reset(); //this clears the form after success

        // Reload achievements list
        setTimeout(() => loadAchievements(), 1000);
    }
    catch(error){
        const specificError = getSpecificErrorMessage(error);
        ACHIEVEMENT_STATUS.textContent = `Failed: ${specificError}`;
        ACHIEVEMENT_STATUS.style.color = 'var(--color-error)';
        showNotification('Upload Failed', specificError, 'error');
        console.error("Achievement error:", error);
    }
}

async function loadAchievements() {
    const achievementsStatus = document.getElementById('achievements-list-status');
    const achievementsList = document.getElementById('achievements-list');

    try {
        achievementsStatus.textContent = 'Loading achievements...';
        achievementsStatus.style.color = 'var(--color-secondary)';
        achievementsList.innerHTML = '';

        const snapshot = await db.collection('achievements').orderBy('date', 'desc').get();

        if(snapshot.empty) {
            achievementsStatus.textContent = 'No achievements found.';
            achievementsStatus.style.color = 'var(--color-text)';
            achievementsList.innerHTML = '<p style="text-align: center; color: #999; padding: 40px;">No achievements yet. Add your first achievement above.</p>';
            return;
        }

        achievementsStatus.textContent = `Found ${snapshot.size} achievement(s)`;
        achievementsStatus.style.color = 'var(--color-primary)';

        snapshot.forEach(doc => {
            const achievement = doc.data();
            const achievementId = doc.id;

            const achievementCard = document.createElement('div');
            achievementCard.className = 'upload-item';
            achievementCard.innerHTML = `
                <img src="${achievement.imageUrl}" alt="${achievement.caption}" class="upload-item-image">
                <div class="upload-item-content">
                    <p class="upload-item-caption">${achievement.caption}</p>
                    <p class="upload-item-date">${achievement.date ? new Date(achievement.date.toDate()).toLocaleDateString() : 'Unknown date'}</p>
                    <button class="btn-delete" onclick="deleteAchievement('${achievementId}')">DELETE</button>
                </div>
            `;

            achievementsList.appendChild(achievementCard);
        });

    } catch(error) {
        const specificError = getSpecificErrorMessage(error);
        achievementsStatus.textContent = `Error: ${specificError}`;
        achievementsStatus.style.color = 'var(--color-error)';
        showNotification('Load Failed', specificError, 'error');
        console.error('Load error:', error);
    }
}

async function deleteAchievement(achievementId) {
    const confirmed = await showConfirmation(
        'Delete Achievement?',
        'Are you sure you want to delete this achievement? It will be removed from the public gallery immediately.'
    );
    
    if (!confirmed) {
        showNotification('Cancelled', 'Achievement deletion was cancelled.', 'info');
        return;
    }

    const achievementsStatus = document.getElementById('achievements-list-status');

    try {
        achievementsStatus.textContent = 'Deleting achievement...';
        achievementsStatus.style.color = 'var(--color-secondary)';

        await db.collection('achievements').doc(achievementId).delete();

        achievementsStatus.textContent = 'Achievement deleted successfully!';
        achievementsStatus.style.color = 'var(--color-primary)';

        showNotification('Deleted Successfully', 'The achievement has been removed from the gallery.', 'success');

        // Reload the achievements list
        setTimeout(() => loadAchievements(), 1000);

    } catch(error) {
        const specificError = getSpecificErrorMessage(error);
        achievementsStatus.textContent = `Error: ${specificError}`;
        achievementsStatus.style.color = 'var(--color-error)';
        showNotification('Delete Failed', specificError, 'error');
        console.error('Delete error:', error);
    }
}

// Make deleteAchievement available globally
window.deleteAchievement = deleteAchievement;
