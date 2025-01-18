import {
    auth,
    signOut,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    onAuthStateChanged
} from "./firebase-config.js";

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
        // Aquí puedes agregar lógica adicional al cerrar sesión, si es necesario.
    } catch (error) {
        console.error("Error al cerrar sesión:", error);
        // Manejo de errores al cerrar sesión.
    }
}

async function register(email, password) {
    console.log("Attempting to register user with email:", email);
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        console.log("Usuario registrado:", userCredential.user);
        return userCredential.user;
    } catch (error) {
        console.error("Error al registrarse:", error);
        throw error; // Re-lanza el error para que el componente que llama pueda manejarlo.
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
        throw error; // Re-lanza el error para que el componente que llama pueda manejarlo.
    }
}

export { auth, initializeAuth, logout, register, login };