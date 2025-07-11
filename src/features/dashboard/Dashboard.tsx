
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useSelector } from 'react-redux';
import { RootState } from '../../app/store';
import { useNavigate } from 'react-router-dom';

import {
  useGetProjectsQuery,
  useCreateProjectMutation,
  useUpdateProjectMutation,
  useDeleteProjectMutation,
} from './projectApi';

type ProjectFormData = {
  title: string;
  description?: string;
  status: 'active' | 'completed';
};

const Dashboard: React.FC = () => {
  const email = useSelector((state: RootState) => state.auth.email);
  const { data: projectData = [], isLoading } = useGetProjectsQuery();
  const [createProject] = useCreateProjectMutation();
  const [updateProject] = useUpdateProjectMutation();
  const [deleteProject] = useDeleteProjectMutation();

  const [editProjectId, setEditProjectId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'completed'>('all');
  const [showForm, setShowForm] = useState(false);

  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProjectFormData>({ defaultValues: { status: 'active' } });

  const handleProjectSubmit = async (data: ProjectFormData) => {
    try {
      if (editProjectId) {
        await updateProject({ id: editProjectId, data }).unwrap();
        setEditProjectId(null);
      } else {
        await createProject(data).unwrap();
      }
      reset();
      setShowForm(false);
    } catch (err) {
      console.error('Project Save Error:', err);
    }
  };

  const handleEditProject = (project: any) => {
    reset({
      title: project.title,
      description: project.description,
      status: project.status,
    });
    setEditProjectId(project._id);
    setShowForm(true);
  };

  const projects = Array.isArray(projectData)
    ? projectData
    : (projectData as any)?.projects ?? [];

  const filteredProjects = projects.filter((project: any) => {
    const matchesTitle = project.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || project.status === filterStatus;
    return matchesTitle && matchesStatus;
  });

  return (
    <div className="container py-5">
      <div className="mb-4">
        <h2 className="text-primary">Welcome, {email || 'Guest'}</h2>
        <div className="d-flex justify-content-between align-items-center">
          <h4 className="mb-0">Your Projects</h4>
          <button className="btn btn-outline-success" onClick={() => {
            reset({ title: '', description: '', status: 'active' });
            setEditProjectId(null);
            setShowForm(true);
          }}>
            + New Project
          </button>
        </div>
      </div>

      {/* Project Form */}
      {showForm && (
        <div className="card mb-4 shadow-sm border-0">
          <div className="card-body">
            <h5 className="mb-3">{editProjectId ? 'Edit Project' : 'Create New Project'}</h5>
            <form onSubmit={handleSubmit(handleProjectSubmit)}>
              <div className="mb-3">
                <input
                  className={`form-control ${errors.title ? 'is-invalid' : ''}`}
                  placeholder="Project Title"
                  {...register('title', { required: 'Title is required' })}
                />
                {errors.title && (
                  <div className="invalid-feedback">{errors.title.message}</div>
                )}
              </div>

              <div className="mb-3">
                <textarea
                  className="form-control"
                  placeholder="Project Description"
                  {...register('description')}
                />
              </div>

              <div className="mb-3">
                <select className="form-select" {...register('status')}>
                  <option value="active">Active</option>
                  <option value="completed">Completed</option>
                </select>
              </div>

              <div className="d-flex justify-content-end">
                <button type="button" className="btn btn-secondary me-2" onClick={() => {
                  setShowForm(false);
                  setEditProjectId(null);
                  reset();
                }}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editProjectId ? 'Update Project' : 'Create Project'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="row mb-4">
        <div className="col-md-6 mb-2">
          <input
            className="form-control"
            placeholder="Search by title..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="col-md-6 mb-2">
          <select
            className="form-select"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="completed">Completed</option>
          </select>
        </div>
      </div>

      {/* Projects List */}
      {isLoading ? (
        <p>Loading projects...</p>
      ) : filteredProjects.length === 0 ? (
        <p className="text-muted">No projects found.</p>
      ) : (
        <div className="row">
          {filteredProjects.map((proj: any) => (
            <div key={proj._id} className="col-md-6 col-lg-4 mb-4">
              <div className="card shadow-sm border-0 h-100">
                <div className="card-body d-flex flex-column justify-content-between">
                  <div>
                    <h5
                      className="card-title text-primary cursor-pointer"
                      style={{ cursor: 'pointer' }}
                      onClick={() => navigate(`/project/${proj._id}`)}
                    >
                      {proj.title}
                    </h5>
                    <p className="card-text">{proj.description}</p>
                    <span className={`badge bg-${proj.status === 'active' ? 'success' : 'secondary'}`}>
                      {proj.status}
                    </span>
                  </div>
                  <div className="mt-3">
                    <button
                      className="btn btn-sm btn-outline-primary me-2"
                      onClick={() => navigate(`/project/${proj._id}`)}
                    >
                      View Details
                    </button>
                    <button
                      className="btn btn-sm btn-outline-warning me-2"
                      onClick={() => handleEditProject(proj)}
                    >
                      Edit
                    </button>
                    <button
                      className="btn btn-sm btn-outline-danger"
                      onClick={() => deleteProject(proj._id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Dashboard;

