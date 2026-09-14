import { useAuth } from './context/AuthContext';
import AuthPage from './pages/AuthPage';
import AdminDashboard from './pages/AdminDashboard';
import PmDashboard from './pages/PmDashboard';
import DevDashboard from './pages/DevDashboard'; // Import the Dev dashboard

const App = () => {
    const { user } = useAuth();

    if (!user) {
        return <AuthPage />;
    }

    if (user.role === 'ADMIN') {
        return <AdminDashboard />;
    }

    if (user.role === 'PROJECT_MANAGER') {
        return <PmDashboard />;
    }

    if (user.role === 'DEVELOPER') {
        return <DevDashboard />; // Route Developers here
    }

    // Ultimate fallback if a user has an invalid role
    return (
        <div style={{ textAlign: 'center', marginTop: '50px', fontFamily: 'sans-serif' }}>
            <h2>Error: Unrecognized User Role</h2>
            <button onClick={useAuth().clearAuth}>Logout</button>
        </div>
    );
};

export default App;