import { useState, useEffect, useCallback } from 'react';
import { api } from '../api/axios';
import { useAuth } from '../context/AuthContext';
import styles from '../styles/AdminDashboard.module.css';

interface ProjectManager { id: number; name: string; email: string; }
interface ProjectOverview { id: number; title: string; pm_name: string; created_at: string; }
interface TaskOverview { id: number; description: string; status: string; dev_name: string; project_title: string; pm_name: string; }

const AdminDashboard = () => {
    const { clearAuth, accessToken } = useAuth();
    
    // Existing State
    const [pms, setPms] = useState<ProjectManager[]>([]);
    const [projects, setProjects] = useState<ProjectOverview[]>([]);
    const [tasks, setTasks] = useState<TaskOverview[]>([]);
    
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [selectedPm, setSelectedPm] = useState('');
    const [message, setMessage] = useState('');

    // User Creation State
    const [createName, setCreateName] = useState('');
    const [createEmail, setCreateEmail] = useState('');
    const [createPassword, setCreatePassword] = useState('');
    const [createRole, setCreateRole] = useState('DEVELOPER'); 
    const [userMessage, setUserMessage] = useState('');
    const [userError, setUserError] = useState('');

    const fetchData = useCallback(async () => {
        try {
            const [pmsRes, overviewRes] = await Promise.all([
                api.get('/admin/pms'),
                api.get('/admin/overview')
            ]);
            setPms(pmsRes.data);
            setProjects(overviewRes.data.projects);
            setTasks(overviewRes.data.tasks);
        } catch (err) {
            console.error("Failed to load dashboard data");
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleCreateUser = async (e: React.FormEvent) => {
        e.preventDefault();
        setUserMessage('');
        setUserError('');

        try {
            await api.post('/admin/create-user', 
                { name: createName, email: createEmail, password: createPassword, role: createRole },
                { headers: { Authorization: `Bearer ${accessToken}` } }
            );
            
            setUserMessage(`${createRole} created successfully!`);
            setCreateName('');
            setCreateEmail('');
            setCreatePassword('');
            setCreateRole('DEVELOPER');
            
            if (createRole === 'PROJECT_MANAGER') {
                fetchData(); 
            }
        } catch (err: any) {
            setUserError(err.response?.data?.message || 'Failed to create team member.');
        }
    };

    const handleCreateProject = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage('');
        try {
            await api.post('/admin/projects', { title, description, pmId: selectedPm });
            setMessage('Project assigned successfully!');
            setTitle(''); setDescription(''); setSelectedPm('');
            fetchData();
        } catch (err) {
            console.error(err);
        }
    };

    const handleDeleteProject = async (projectId: number) => {
        if (!window.confirm('Are you sure? This will delete the project and ALL associated tasks.')) return;
        
        try {
            await api.delete(`/admin/projects/${projectId}`, {
                headers: { Authorization: `Bearer ${accessToken}` }
            });
            fetchData(); 
        } catch (err) {
            console.error('Failed to delete project', err);
            alert('Failed to delete project');
        }
    };

    const handleDeleteTask = async (taskId: number) => {
        if (!window.confirm('Are you sure you want to delete this task?')) return;
        
        try {
            await api.delete(`/admin/tasks/${taskId}`, {
                headers: { Authorization: `Bearer ${accessToken}` }
            });
            fetchData(); 
        } catch (err) {
            console.error('Failed to delete task', err);
            alert('Failed to delete task');
        }
    };

    return (
        <div className={styles.adminContainer}>
            <div className={styles.adminHeader}>
                <h2>Admin Global Dashboard</h2>
                <button onClick={clearAuth} className={styles.btnLogout}>Logout</button>
            </div>

            <div className={styles.adminGrid}>
                {/* Form: Create Team Member */}
                <div className={styles.formCard}>
                    <h3>Create Team Member</h3>
                    {userMessage && <div className={styles.msgSuccess}>{userMessage}</div>}
                    {userError && <div className={styles.msgError}>{userError}</div>}
                    
                    <form onSubmit={handleCreateUser} className={styles.adminForm}>
                        <input type="text" value={createName} onChange={(e) => setCreateName(e.target.value)} placeholder="Full Name" required className={styles.formInput}/>
                        <input type="email" value={createEmail} onChange={(e) => setCreateEmail(e.target.value)} placeholder="Email Address" required className={styles.formInput}/>
                        <input type="password" value={createPassword} onChange={(e) => setCreatePassword(e.target.value)} placeholder="Temporary Password" required className={styles.formInput}/>
                        
                        <select value={createRole} onChange={(e) => setCreateRole(e.target.value)} required className={styles.formInput}>
                            <option value="DEVELOPER">Developer</option>
                            <option value="PROJECT_MANAGER">Project Manager</option>
                        </select>
                        
                        <button type="submit" className={styles.btnSubmitSuccess}>
                            Create User
                        </button>
                    </form>
                </div>

                {/* Form: Assign Project */}
                <div className={styles.formCardAlt}>
                    <h3>Assign New Project</h3>
                    {message && <div className={styles.msgSuccess}>{message}</div>}
                    
                    <form onSubmit={handleCreateProject} className={styles.adminForm}>
                        <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Project Title (e.g. Adolescent Diet Tracker)" required className={styles.formInput}/>
                        <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Project Description (Optional)" rows={2} className={styles.formInput}/>
                        
                        <select value={selectedPm} onChange={(e) => setSelectedPm(e.target.value)} required className={styles.formInput}>
                            <option value="" disabled>Select a PM...</option>
                            {pms.map(pm => <option key={pm.id} value={pm.id}>{pm.name}</option>)}
                        </select>
                        
                        <button type="submit" className={styles.btnSubmitPrimary}>
                            Assign Project
                        </button>
                    </form>
                </div>
            </div>

            <div className={styles.adminGrid}>
                {/* Project List */}
                <div>
                    <h3>All Assigned Projects</h3>
                    {projects.map(p => (
                        <div key={p.id} className={styles.listItem}>
                            <div>
                                <strong>{p.title}</strong>
                                <small className={styles.listItemMeta}>Assigned to: {p.pm_name}</small>
                            </div>
                            <button onClick={() => handleDeleteProject(p.id)} className={styles.btnDelete}>
                                Delete
                            </button>
                        </div>
                    ))}
                </div>

                {/* Task List */}
                <div>
                    <h3>Global Dev Tasks</h3>
                    {tasks.map(t => (
                        <div key={t.id} className={styles.listItem}>
                            <div>
                                <strong>{t.description}</strong> ({t.status})
                                <small className={styles.listItemMeta}>Dev: {t.dev_name} | PM: {t.pm_name}</small>
                                <small className={styles.listItemMeta}>Project: {t.project_title}</small>
                            </div>
                            <button onClick={() => handleDeleteTask(t.id)} className={styles.btnDelete}>
                                Delete
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;