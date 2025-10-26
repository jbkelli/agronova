const loginForm = document.getElementById('login-form');
const statusDiv = document.getElementById('status');

const ADMIN_DASHBOARD_URL = '/html/admin-dashboard.html';

// Specific error message handler
function getAuthErrorMessage(error) {
    const errorCode = error.code;
    
    switch(errorCode) {
        case 'auth/wrong-password':
            return 'Incorrect password. Please try again.';
        case 'auth/user-not-found':
            return 'No account found with this email address.';
        case 'auth/invalid-email':
            return 'Invalid email format. Please check your email address.';
        case 'auth/user-disabled':
            return 'This account has been disabled. Contact the administrator.';
        case 'auth/too-many-requests':
            return 'Too many failed login attempts. Please try again later or reset your password.';
        case 'auth/network-request-failed':
            return 'Network error. Please check your internet connection and try again.';
        case 'auth/invalid-credential':
            return 'Invalid email or password. Please check your credentials.';
        default:
            return error.message || 'Login failed. Please try again.';
    }
}

function checkAdminAuthorization(user){
    statusDiv.textContent = "Verifying security claims....";
    statusDiv.style.color = 'var(--color-text)';
    
    user.getIdTokenResult(true)
    .then(idTokenResult => {
        if(idTokenResult.claims.admin === true){
            statusDiv.textContent = "ACCESS GRANTED. Redirecting...";
            statusDiv.style.color = 'var(--color-primary)';
            //redirecting to the dashboard
            window.location.href = ADMIN_DASHBOARD_URL;

        }

        else{
            statusDiv.textContent = "ACCESS DENIED: You do not have admin privileges for this account.";
            statusDiv.style.color = 'var(--color-error)';
            auth.signOut();
        }
    })

    .catch(error => {
        statusDiv.textContent = `Authorization error: ${getAuthErrorMessage(error)}`;
        statusDiv.style.color = 'var(--color-error)';
    })
}

function handleLogin(e){
    e.preventDefault();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;

    if (!email || !password) {
        statusDiv.textContent = "Please enter both email and password.";
        statusDiv.style.color = 'var(--color-error)';
        return;
    }

    statusDiv.textContent = "Authenticating...";
    statusDiv.style.color = 'var(--color-text)';

    auth.signInWithEmailAndPassword(email, password)
    .then((userCredential) => {
        checkAdminAuthorization(userCredential.user);
    })
    .catch(error => {
        const specificError = getAuthErrorMessage(error);
        statusDiv.textContent = `LOGIN FAILED: ${specificError}`;
        statusDiv.style.color = 'var(--color-error)';
        console.error('Login error:', error);
    });
}

if(loginForm){
    loginForm.addEventListener('submit', handleLogin);
}