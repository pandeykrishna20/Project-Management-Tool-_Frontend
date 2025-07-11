
import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../../app/store';
import { useGetProjectsQuery } from './projectApi';
import {
  useCreateTaskMutation,
  useDeleteTaskMutation,
  useUpdateTaskMutation,
  useGetTasksByProjectQuery,
} from './taskApi';
import TaskForm, { TaskFormData } from './TaskForm';
import 'bootstrap/dist/css/bootstrap.min.css';

const ProjectDetail: React.FC = () => {
  const { id: projectId } = useParams<{ id: string }>();
  const email = useSelector((state: RootState) => state.auth.email);
  const { data: projects } = useGetProjectsQuery();
  const project = projects?.find(p => p._id === projectId);

  const { data: tasks = [], refetch } = useGetTasksByProjectQuery(projectId!);
  const [createTask] = useCreateTaskMutation();
  const [updateTask] = useUpdateTaskMutation();
  const [deleteTask] = useDeleteTaskMutation();

  const [selectedTask, setSelectedTask] = useState<TaskFormData | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [filterStatus, setFilterStatus] = useState<'all' | 'todo' | 'in-progress' | 'done'>('all');

  const handleSubmit = async (taskData: TaskFormData) => {
    const data = {
      ...taskData,
      dueDate: new Date(taskData.dueDate).toISOString(),
    };

    if ((selectedTask as any)?._id) {
      await updateTask({ taskId: (selectedTask as any)._id, data });
    } else {
      await createTask({ projectId: projectId!, data });
    }

    setSelectedTask(null);
    setShowForm(false);
    refetch();
  };

  const filteredTasks = tasks.filter(task =>
    filterStatus === 'all' ? true : task.status === filterStatus
  );

  return (
    <div className="container py-5">
      <div className="card shadow-lg p-4 mb-4 border-0">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h2 className="text-primary">Project: {project?.title}</h2>
          <span className="badge bg-secondary fs-6">{project?.status}</span>
        </div>
        <p className="text-muted mb-1"><strong>Description:</strong> {project?.description}</p>
        <p className="text-muted mb-1"><strong>Managed By:</strong> {email}</p>
      </div>

      <div className="d-flex justify-content-between align-items-center mb-4">
        <button className="btn btn-outline-primary" onClick={() => setShowForm(true)}>
          + Add New Task
        </button>
        <select
          className="form-select w-auto"
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value as any)}
        >
          <option value="all">All Tasks</option>
          <option value="todo">To Do</option>
          <option value="in-progress">In Progress</option>
          <option value="done">Done</option>
        </select>
      </div>

      {showForm && (
        <div className="card mb-4 shadow-sm border-0">
          <div className="card-body">
            <TaskForm
              initialValues={selectedTask ?? undefined}
              onSubmit={handleSubmit}
              onCancel={() => {
                setShowForm(false);
                setSelectedTask(null);
              }}
            />
          </div>
        </div>
      )}

      <h4 className="mb-3">Task List</h4>
      <div className="row">
        {filteredTasks.map(task => (
          <div key={task._id} className="col-md-6 mb-4">
            <div className="card h-100 shadow-sm border-0">
              <div className="card-body d-flex flex-column justify-content-between">
                <div>
                  <h5 className="card-title">{task.title}</h5>
                  <span className="badge bg-info mb-2 text-dark">{task.status}</span>
                  <p className="card-text">{task.description}</p>
                  <p className="text-muted mb-1">
                    <small>Due: {new Date(task.dueDate).toLocaleDateString()}</small>
                  </p>
                </div>
                <div className="mt-3">
                  <button
                    className="btn btn-sm btn-outline-warning me-2"
                    onClick={() => {
                      setSelectedTask({ ...task, dueDate: task.dueDate.split('T')[0] });
                      setShowForm(true);
                    }}
                  >
                    Edit
                  </button>
                  <button
                    className="btn btn-sm btn-outline-danger"
                    onClick={async () => {
                      await deleteTask(task._id);
                      refetch();
                    }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
        {filteredTasks.length === 0 && (
          <p className="text-muted">No tasks available for the selected status.</p>
        )}
      </div>
    </div>
  );
};

export default ProjectDetail;




