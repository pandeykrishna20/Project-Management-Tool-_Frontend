import React, { useState } from 'react';
import { useGetTasksByProjectQuery } from './taskApi';
import { Task } from './types';

interface ProjectTasksProps {
  projectId: string;
  onEditTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
  refreshTrigger?: number;
}

const ProjectTasks: React.FC<ProjectTasksProps> = ({
  projectId,
  onEditTask,
  onDeleteTask,
  refreshTrigger,
}) => {
  const { data: tasks = [], isLoading, isError, refetch } = useGetTasksByProjectQuery(projectId);
  const [filter, setFilter] = useState<'all' | 'todo' | 'in-progress' | 'done'>('all');

  React.useEffect(() => {
    if (refreshTrigger) refetch();
  }, [refreshTrigger, refetch]);

  const filteredTasks = tasks.filter((task) => {
    if (filter === 'all') return true;
    return task.status === filter;
  });

  if (isLoading) return <p>Loading tasks...</p>;
  if (isError) return <p className="text-danger">Failed to load tasks.</p>;

  return (
    <div className="mt-3">
      <div className="d-flex mb-2">
        <strong className="me-2">Tasks:</strong>
        <select
          className="form-select form-select-sm w-auto"
          value={filter}
          onChange={(e) => setFilter(e.target.value as any)}
        >
          <option value="all">All</option>
          <option value="todo">To Do</option>
          <option value="in-progress">In Progress</option>
          <option value="done">Done</option>
        </select>
      </div>

      {/* Show when no tasks exist at all */}
      {tasks.length === 0 ? (
        <p className="text-muted">Task not available for this project.</p>
      ) : filteredTasks.length === 0 ? (
        <p className="text-muted">No tasks match the selected filter.</p>
      ) : (
        <ul className="list-group">
          {filteredTasks.map((task) => (
            <li
              key={task._id}
              className="list-group-item d-flex justify-content-between align-items-start"
            >
              <div>
                <strong>{task.title}</strong> <small className="text-muted">({task.status})</small>
                <p className="mb-0 small">{task.description}</p>
              </div>
              <div>
                <button className="btn btn-sm btn-warning me-2" onClick={() => onEditTask(task)}>
                  Edit
                </button>
                <button className="btn btn-sm btn-danger" onClick={() => onDeleteTask(task._id)}>
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ProjectTasks;
