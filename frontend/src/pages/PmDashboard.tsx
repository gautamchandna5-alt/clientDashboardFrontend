import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/axios';
import styles from '../styles/PmDashboard.module.css';

interface Project { id: number; title: string; description: string; }
interface Developer { id: number; name: string; email: string; }
interface AssignedTask { id: number; description: string; status: string; dev_name: string; project_title: string; }

const PmDashboard = () => {
    const { user, clearAuth } = useAuth();
    
    const [projects, setProjects] = useState<Project[]>([]);
    const [developers, setDevelopers] = useState<Developer[]>([]);
    const [assignedTasks, setAssignedTasks] = useState<AssignedTask[]>([]);
    
    const [selectedProjectId, setSelectedProjectId] = useState('');
    const [selectedDevId, setSelectedDevId] = useState('');
    const [taskDescription, setTaskDescription] = useState('');
    const [message, setMessage] = useState('');

    const fetchData = useCallback(async () => {
        if (!user?.id) return;
        try {
            const [projectsRes, devsRes, tasksRes] = await Promise.all([
                api.get(`/pm/projects/${user.id}`),
                api.get('/pm/developers'),
                api.get(`/pm/assigned-tasks/${user.id}`)
            ]);
            setProjects(projectsRes.data);
            setDevelopers(devsRes.data);
            setAssignedTasks(tasksRes.data);
        } catch (err) {
            console.error("Failed to load dashboard data");
        }
    }, [user?.id]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleAssignTask = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage('');
        try {
            await api.post('/pm/tasks', { projectId: selectedProjectId, devId: selectedDevId, description: taskDescription });
            setMessage('Task assigned successfully!');
            setSelectedProjectId(''); setSelectedDevId(''); setTaskDescription('');
            fetchData(); 
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className={styles.pmContainer}>
            <div className={styles.pmHeader}>
                <div>
                    <h2>Project Manager Dashboard</h2>
                    <p className={styles.pmSubtitle}>Welcome back, {user?.name}</p>
                </div>
                <button onClick={clearAuth} className={styles.btnLogout}>Logout</button>
            </div>

            <div className={styles.pmGrid}>
                {/* Left Column: Assignment Form */}
                <div>
                    <div className={styles.formCard}>
                        <h3>Assign Task to Dev</h3>
                        {message && <div className={styles.msgSuccess}>{message}</div>}
                        <form onSubmit={handleAssignTask} className={styles.pmForm}>
                            <select value={selectedProjectId} onChange={(e) => setSelectedProjectId(e.target.value)} required className={styles.formInput}>
                                <option value="" disabled>Choose a project...</option>
                                {projects.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
                            </select>
                            
                            <select value={selectedDevId} onChange={(e) => setSelectedDevId(e.target.value)} required className={styles.formInput}>
                                <option value="" disabled>Choose a developer...</option>
                                {developers.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                            </select>
                            
                            <textarea value={taskDescription} onChange={(e) => setTaskDescription(e.target.value)} required rows={3} placeholder="Task description..." className={styles.formInput} />
                            
                            <button type="submit" className={styles.btnSubmit}>Assign</button>
                        </form>
                    </div>
                </div>

                {/* Right Column: Assigned Tasks Track Record */}
                <div>
                    <h3>Tasks You Have Assigned</h3>
                    {assignedTasks.length === 0 ? (
                        <p className={styles.emptyState}>No tasks assigned yet.</p>
                    ) : (
                        <div className={styles.taskList}>
                            {assignedTasks.map(t => (
                                <div key={t.id} className={styles.taskItem}>
                                    <h4>{t.description}</h4>
                                    <div className={styles.taskMeta}>
                                        <strong>Dev:</strong> {t.dev_name} <br/>
                                        <strong>Project:</strong> {t.project_title} <br/>
                                        <strong>Status:</strong> <span className={t.status === 'PENDING' ? styles.statusPending : styles.statusCompleted}>
                                            {t.status}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PmDashboard;