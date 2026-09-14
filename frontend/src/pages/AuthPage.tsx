import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/axios';
import styles from '../styles/AuthPage.module.css';

const AuthPage = () => {
    const { setAuth } = useAuth();
    
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        try {
            // Because registration is removed, we strictly execute the login flow
            const response = await api.post('/auth/login', { email, password });
            const { user, accessToken } = response.data;
            setAuth(user, accessToken); 
        } catch (err: any) {
            setError(err.response?.data?.message || 'Authentication failed. Please try again.');
        }
    };

    return (
        <div className={styles.authContainer}>
            <h2 className={styles.authTitle}>Agency Login</h2>
            
            {error && <div className={styles.msgError}>{error}</div>}

            <form onSubmit={handleSubmit} className={styles.authForm}>
                <div>
                    <label className={styles.formLabel}>Email</label>
                    <input 
                        type="email" 
                        value={email} 
                        onChange={(e) => setEmail(e.target.value)} 
                        required 
                        className={styles.formInput}
                    />
                </div>
                
                <div>
                    <label className={styles.formLabel}>Password</label>
                    <input 
                        type="password" 
                        value={password} 
                        onChange={(e) => setPassword(e.target.value)} 
                        required 
                        className={styles.formInput}
                    />
                </div>
                
                <button type="submit" className={styles.btnSubmit}>
                    Log In
                </button>
            </form>
        </div>
    );
};

export default AuthPage;