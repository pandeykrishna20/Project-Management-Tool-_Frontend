import React from 'react';
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

  React.useEffect(() => {
    if (refreshTrigger !== undefined) {
      refetch();
    }
  }, [refreshTrigger, refetch]);

  if (isLoading) return <p>Loading tasks...</p>;
  if (isError) return <p className="text-danger">Failed to load tasks.</p>;

  return (
    <div className="mt-3 border-top pt-3">
      <h6>Tasks</h6>
      {tasks.length === 0 ? (
        <p>No tasks available.</p>
      ) : (
        <ul className="list-group">
          {tasks.map((task) => (
            <li
              key={task._id}
              className="list-group-item d-flex justify-content-between align-items-center"
            >
              <div>
                <strong>{task.title}</strong>{' '}
                <small className="text-muted">({task.status})</small>
                <p className="mb-0 small">
                  {task.description}
                  {task.dueDate && (
                    <>
                      <br />
                      <strong>Due:</strong> {new Date(task.dueDate).toLocaleDateString()}
                    </>
                  )}
                </p>
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

