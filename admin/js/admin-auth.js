const loginForm = document.getElementById('login-form');
const statusDiv = document.getElementById('status');

const ADMIN_DASHBOARD_URL = '/html/admin-dashboard.html';

function checkAdminAuthorization(user){
    statusDiv.textContent = "Verifying security claims....";
    user.getIdTokenResult(true)
    .then(idTokenResult => {
        if(idTokenResult.claims.admin === true){
            statusDiv.textContent = "ACCESS GRANTED. Redirecting...";
            //redirecting to the dashboard
            window.location.href = ADMIN_DASHBOARD_URL;

        }

        else{
            statusDiv.textContent = "ACCESS DENIED: Insufficient privilages.";
            statusDiv.style.color = 'var(--color-error)';
            auth.signOut();
        }
    })

    .catch(error => {
        statusDiv.textContent = `Error: ${error.message}`;
        statusDiv.style.color = 'var(--color-error)';
    })
}

function handleLogin(e){
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    statusDiv.textContent = "Authenticating...";
    statusDiv.style.color = 'var(--color-text)';

    auth.signInWithEmailAndPassword(email, password)
    .then((userCredential) => {
        checkAdminAuthorization(userCredential.user);
    })
    .catch(error => {
        statusDiv.textContent = `LOGIN FAILED: ${error.message.split('(')[0]}`;
        statusDiv.style.color = 'var(--color-error)';
    });
}

if(loginForm){
    loginForm.addEventListener('submit', handleLogin);
}