import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/axios';
import styles from '../styles/DevDashboard.module.css';

interface Task {
    id: number;
    description: string;
    status: string;
    project_title: string;
    created_at: string;
}

const DevDashboard = () => {
    const { user, clearAuth } = useAuth();
    const [tasks, setTasks] = useState<Task[]>([]);
    const [error, setError] = useState('');

    const fetchTasks = useCallback(async () => {
        if (!user?.id) return;
        try {
            const response = await api.get(`/dev/tasks/${user.id}`);
            setTasks(response.data);
        } catch (err) {
            console.error("Failed to load tasks", err);
            setError('Could not load your assigned tasks.');
        }
    }, [user?.id]);

    useEffect(() => {
        fetchTasks();
    }, [fetchTasks]);

    const handleCompleteTask = async (taskId: number) => {
        try {
            await api.patch(`/dev/tasks/${taskId}/complete`);
            fetchTasks(); 
        } catch (err) {
            console.error("Failed to update task", err);
            setError('Could not update task status.');
        }
    };

    return (
        <div className={styles.devContainer}>
            <div className={styles.devHeader}>
                <div>
                    <h2>Developer Dashboard</h2>
                    <p className={styles.devSubtitle}>Welcome back, {user?.name}</p>
                </div>
                <button onClick={clearAuth} className={styles.btnLogout}>
                    Logout
                </button>
            </div>

            {error && <div className={styles.msgError}>{error}</div>}

            <h3>Your Task Backlog</h3>
            
            {tasks.length === 0 ? (
                <p className={styles.emptyState}>
                    No tasks currently assigned to you.
                </p>
            ) : (
                <div className={styles.taskList}>
                    {tasks.map((task) => (
                        <div 
                            key={task.id} 
                            className={`${styles.taskItem} ${task.status === 'COMPLETED' ? styles.taskItemCompleted : ''}`}
                        >
                            <div className={styles.taskInfo}>
                                <h4>{task.description}</h4>
                                <small className={styles.taskProject}>Project: {task.project_title}</small>
                            </div>
                            
                            <div className={styles.taskActions}>
                                <div className={task.status === 'COMPLETED' ? styles.statusCompleted : styles.statusPending}>
                                    {task.status}
                                </div>
                                {task.status !== 'COMPLETED' && (
                                    <button 
                                        onClick={() => handleCompleteTask(task.id)}
                                        className={styles.btnComplete}
                                    >
                                        Mark as Done
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default DevDashboard;