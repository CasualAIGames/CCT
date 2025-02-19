// auth.js
import {
    auth,
    signOut,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    onAuthStateChanged,
    GoogleAuthProvider,
    signInWithPopup,
    sendPasswordResetEmail
} from "./firebase-config.js";

// Crear una instancia del proveedor de Google
const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
    prompt: 'select_account'
});

function initializeAuth(handleAuthStateChanged) {
    console.log("Initializing authentication state listener.");
    onAuthStateChanged(auth, (user) => {
        console.log("Authentication state changed. User:", user);
        handleAuthStateChanged(user);
    });
}

async function logout() {
    console.log("Attempting to log out user.");
    try {
        await signOut(auth);
        console.log("Sesión cerrada correctamente.");
    } catch (error) {
        console.error("Error al cerrar sesión:", error);
        throw error;
    }
}

async function register(email, password) {
    console.log("Attempting to register user with email:", email);
    try {
        // Si ya hay un usuario autenticado (por ejemplo, con Google), retornarlo directamente
        const currentUser = auth.currentUser;
        if (currentUser) {
            console.log("Usuario ya autenticado:", currentUser);
            return currentUser;
        }

        // Si no hay usuario autenticado, validar credenciales
        if (!email || !password) {
            throw new Error("El email y la contraseña son obligatorios");
        }
        if (password.length < 6) {
            throw new Error("La contraseña debe tener al menos 6 caracteres");
        }
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        console.log("Usuario registrado:", userCredential.user);
        return userCredential.user;
    } catch (error) {
        console.error("Error al registrarse:", error);
        throw error;
    }
}

async function login(email, password) {
    console.log("Attempting to log in user with email:", email);
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        console.log("Usuario autenticado:", userCredential.user);
        return userCredential.user;
    } catch (error) {
        console.error("Error al iniciar sesión:", error);
        throw error;
    }
}

async function loginWithGoogle() {
    console.log("Attempting to log in with Google");
    try {
        const result = await signInWithPopup(auth, googleProvider);
        console.log("Usuario autenticado con Google:", result.user);
        return result.user;
    } catch (error) {
        console.error("Error al iniciar sesión con Google:", error);
        throw error;
    }
}

async function resetPassword(email) {
    console.log("Attempting to send password reset email to:", email);
    try {
        await sendPasswordResetEmail(auth, email);
        console.log("Email de recuperación enviado");
    } catch (error) {
        console.error("Error al enviar email de recuperación:", error);
        throw error;
    }
}

function getCurrentUser() {
    return new Promise((resolve) => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            unsubscribe();
            resolve(user);
        });
    });
}

export { 
    auth, 
    initializeAuth, 
    logout, 
    register, 
    login, 
    loginWithGoogle, 
    resetPassword, 
    getCurrentUser 
};