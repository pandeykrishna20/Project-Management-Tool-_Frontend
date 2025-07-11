

import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../app/store';
import { useForm } from 'react-hook-form';
import {
  useGetProjectsQuery,
  useCreateProjectMutation,
  useUpdateProjectMutation,
  useDeleteProjectMutation,
} from './projectApi';
import {
  useCreateTaskMutation,
  useUpdateTaskMutation,
  useDeleteTaskMutation,
} from './taskApi';
import TaskForm, { TaskFormData } from './TaskForm';
import ProjectTasks from './ProjectTasks';
import 'bootstrap/dist/css/bootstrap.min.css';

type ProjectFormData = {
  title: string;
  description?: string;
  status: 'active' | 'completed';
};

const getTomorrowDate = (): string => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return tomorrow.toISOString().split('T')[0];
};

const Dashboard: React.FC = () => {
  const email = useSelector((state: RootState) => state.auth.email);
  const { data: projectData } = useGetProjectsQuery();
  const projects = Array.isArray(projectData)
    ? projectData
    : (projectData as any)?.projects ?? [];

  const [createProject] = useCreateProjectMutation();
  const [updateProject] = useUpdateProjectMutation();
  const [deleteProject] = useDeleteProjectMutation();
  const [createTask] = useCreateTaskMutation();
  const [updateTask] = useUpdateTaskMutation();
  const [deleteTask] = useDeleteTaskMutation();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProjectFormData>({ defaultValues: { status: 'active' } });

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'completed'>('all');
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [selectedTask, setSelectedTask] = useState<TaskFormData | null>(null);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [editProjectId, setEditProjectId] = useState<string | null>(null);
  const [taskRefreshTrigger, setTaskRefreshTrigger] = useState<number>(0);

  const handleProjectSubmit = async (data: ProjectFormData) => {
    if (editProjectId) {
      await updateProject({ id: editProjectId, data });
      setEditProjectId(null);
    } else {
      await createProject(data);
    }
    reset({ title: '', description: '', status: 'active' });
  };

  const handleEditProject = (project: any) => {
    reset({ title: project.title, description: project.description, status: project.status });
    setEditProjectId(project._id);
  };

  // const handleTaskSubmit = async (taskData: TaskFormData) => {
  //   if (!selectedProjectId) return;

  //   if (selectedTask && (selectedTask as any)._id) {
  //     await updateTask({ taskId: (selectedTask as any)._id, data: taskData });
  //   } else {
  //     await createTask({ projectId: selectedProjectId, data: taskData });
  //   }

  //   setSelectedTask(null);
  //   setShowTaskForm(false);
  //   setTaskRefreshTrigger(Date.now());
  // };



  const handleTaskSubmit = async (taskData: TaskFormData) => {
  if (!selectedProjectId) return;

  // Ensure dueDate is a valid ISO string
  const apiData = {
    title: taskData.title,
    description: taskData.description,
    status: taskData.status,
    dueDate: new Date(taskData.dueDate).toISOString(), // Ensure ISO format
  };

  try {
    if (selectedTask && (selectedTask as any)._id) {
      await updateTask({ taskId: (selectedTask as any)._id, data: apiData }).unwrap();
    } else {
      await createTask({ projectId: selectedProjectId, data: apiData }).unwrap();
    }

    setSelectedTask(null);
    setShowTaskForm(false);
    setTaskRefreshTrigger(Date.now());
  } catch (error) {
    console.error('Task submission error:', error);
    alert('Failed to save task');
  }
};

  const filteredProjects = projects.filter((proj: any) => {
    const matchesTitle = proj.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || proj.status === filterStatus;
    return matchesTitle && matchesStatus;
  });

  return (
    <div className="container-fluid">
      <div className="row">
        <div className="col-md-3 bg-light border-end p-3">
          <h5>Welcome,</h5>
          <p className="fw-bold text-primary">{email || 'Guest'}</p>
        </div>

        <div className="col-md-9 p-4">
          <h2 className="mb-4">Projects Dashboard</h2>

          {/* Project Form */}
          <form onSubmit={handleSubmit(handleProjectSubmit)} className="mb-4">
            <input
              type="text"
              className={`form-control mb-2 ${errors.title ? 'is-invalid' : ''}`}
              placeholder="Project Title"
              {...register('title', { required: true })}
            />
            {errors.title && <div className="invalid-feedback">Title is required</div>}
            <textarea
              className="form-control mb-2"
              placeholder="Description"
              {...register('description')}
            />
            <select className="form-select mb-2" {...register('status')}>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
            </select>
            <button className="btn btn-success">
              {editProjectId ? 'Update Project' : 'Add Project'}
            </button>
          </form>

          {/* Filters */}
          <div className="d-flex mb-3">
            <input
              className="form-control me-2"
              placeholder="Search by title..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <select
              className="form-select me-2"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
            >
              <option value="all">All</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          {/* Project List */}
          {filteredProjects.map((proj: any) => (
            <div key={proj._id} className="card mb-3">
              <div className="card-body">
                <h5>
                  {proj.title} <span className="badge bg-secondary ms-2">{proj.status}</span>
                </h5>
                <p>{proj.description}</p>
                <button
                  className="btn btn-sm btn-primary me-2"
                  onClick={() => {
                    setSelectedProjectId(proj._id);
                    setShowTaskForm(true);
                    setSelectedTask(null);
                  }}
                >
                  Add Task
                </button>
                <button
                  className="btn btn-sm btn-warning me-2"
                  onClick={() => handleEditProject(proj)}
                >
                  Edit
                </button>
                <button
                  className="btn btn-sm btn-danger"
                  onClick={() => deleteProject(proj._id)}
                >
                  Delete
                </button>

                <ProjectTasks
                  projectId={proj._id}
                  onEditTask={(task: any) => {
                    setSelectedProjectId(proj._id);
                    setSelectedTask({
                      ...task,
                      dueDate: task.dueDate || getTomorrowDate(),
                    });
                    setShowTaskForm(true);
                  }}
                  onDeleteTask={(taskId: string) => {
                    deleteTask(taskId).then(() => setTaskRefreshTrigger(Date.now()));
                  }}
                  refreshTrigger={taskRefreshTrigger}
                />

                {showTaskForm && selectedProjectId === proj._id && (
                  <TaskForm
                    initialValues={selectedTask ?? undefined}
                    onSubmit={handleTaskSubmit}
                    onCancel={() => {
                      setShowTaskForm(false);
                      setSelectedTask(null);
                    }}
                  />
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;


