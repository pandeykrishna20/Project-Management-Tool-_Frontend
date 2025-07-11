import React from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';

export type TaskFormData = {
  title: string;
  description?: string;
  status: 'todo' | 'in-progress' | 'done';
  dueDate: string;
};

// Get tomorrow's date in YYYY-MM-DD format
const getTomorrowDate = (): string => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return tomorrow.toISOString().split('T')[0];
};

const schema: yup.ObjectSchema<TaskFormData> = yup.object({
  title: yup.string().required('Title is required'),
  description: yup.string().optional(),
  status: yup
    .mixed<'todo' | 'in-progress' | 'done'>()
    .oneOf(['todo', 'in-progress', 'done'], 'Invalid status')
    .required('Status is required'),
  dueDate: yup.string().required('Due date is required'),
});

interface Props {
  initialValues?: TaskFormData | null;
  onSubmit: (data: TaskFormData) => void;
  onCancel: () => void;
}

const TaskForm: React.FC<Props> = ({ initialValues, onSubmit, onCancel }) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<TaskFormData>({
    resolver: yupResolver(schema),
    defaultValues: initialValues || {
      title: '',
      description: '',
      status: 'todo',
      dueDate: getTomorrowDate(), // default to tomorrow
    },
  });

  React.useEffect(() => {
    if (initialValues) {
      reset(initialValues);
    }
  }, [initialValues, reset]);

  const onFormSubmit: SubmitHandler<TaskFormData> = (data) => {
    onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="mt-3 border-top pt-3">
      <div className="mb-2">
        <input
          type="text"
          placeholder="Task Title"
          className={`form-control ${errors.title ? 'is-invalid' : ''}`}
          {...register('title')}
        />
        {errors.title && <div className="invalid-feedback">{errors.title.message}</div>}
      </div>

      <div className="mb-2">
        <textarea
          placeholder="Description"
          className="form-control"
          {...register('description')}
        />
      </div>

      <div className="mb-2">
        <select
          className={`form-select ${errors.status ? 'is-invalid' : ''}`}
          {...register('status')}
        >
          <option value="todo">Todo</option>
          <option value="in-progress">In Progress</option>
          <option value="done">Done</option>
        </select>
        {errors.status && <div className="invalid-feedback">{errors.status.message}</div>}
      </div>

      <div className="mb-2">
        <input
          type="date"
          className={`form-control ${errors.dueDate ? 'is-invalid' : ''}`}
          {...register('dueDate')}
        />
        {errors.dueDate && <div className="invalid-feedback">{errors.dueDate.message}</div>}
      </div>

      <div className="d-flex justify-content-end gap-2">
        <button type="submit" className="btn btn-success">
          {initialValues ? 'Update Task' : 'Add Task'}
        </button>
        <button type="button" onClick={onCancel} className="btn btn-secondary">
          Cancel
        </button>
      </div>
    </form>
  );
};

export default TaskForm;
