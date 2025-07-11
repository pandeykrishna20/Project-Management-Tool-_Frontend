import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import * as Yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { useLoginMutation, useRegisterMutation } from './authApi';
import { useDispatch } from 'react-redux';
import { setCredentials } from './authSlice';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';

interface FormData {
  email: string;
  password: string;
  confirmPassword?: string;
}

// Validation Schemas
const loginSchema = Yup.object({
  email: Yup.string().email('Invalid email').required('Email is required'),
  password: Yup.string().min(6, 'Minimum 6 characters').required('Password is required'),
});

const registerSchema = Yup.object({
  email: Yup.string().email('Invalid email').required('Email is required'),
  password: Yup.string().min(6, 'Minimum 6 characters').required('Password is required'),
  confirmPassword: Yup.string()
    .required('Confirm Password is required')
    .oneOf([Yup.ref('password')], 'Passwords must match'),
});

const LoginRegister = () => {
  const [mode, setMode] = useState<'login' | 'register'>('login');

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [login] = useLoginMutation();
  const [registerUser] = useRegisterMutation();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: yupResolver(mode === 'login' ? loginSchema : registerSchema),
  });

  const onSubmit = async (data: FormData) => {
    try {
      const payload =
        mode === 'login'
          ? { email: data.email, password: data.password }
          : {
              email: data.email,
              password: data.password,
              confirmPassword: data.confirmPassword,
            };

      const response =
        mode === 'login'
          ? await login(payload).unwrap()
          : await registerUser(payload).unwrap();

      //  Use response.token directly — do not use response.data
      dispatch(setCredentials({
        token: response.token,
        email: data.email,
      }));

      navigate('/dashboard');
    } catch (err: any) {
      console.error('Authentication Error:', err);
      alert(err?.data?.message || 'Authentication failed');
    }
  };

  return (
    <div
      className="d-flex justify-content-center align-items-center vh-100"
      style={{ background: 'linear-gradient(to right, #667eea, #764ba2)' }}
    >
      <div className="card shadow p-4" style={{ width: 400 }}>
        <h2 className="text-center mb-4 text-primary">Project Management Tool</h2>
        <h4 className="text-center mb-3">
          {mode === 'login' ? 'Login' : 'Register'}
        </h4>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="mb-3">
            <input
              type="email"
              className={`form-control ${errors.email ? 'is-invalid' : ''}`}
              placeholder="Email"
              {...register('email')}
            />
            {errors.email && (
              <div className="invalid-feedback">{errors.email.message}</div>
            )}
          </div>

          <div className="mb-3">
            <input
              type="password"
              className={`form-control ${errors.password ? 'is-invalid' : ''}`}
              placeholder="Password"
              {...register('password')}
            />
            {errors.password && (
              <div className="invalid-feedback">{errors.password.message}</div>
            )}
          </div>

          {mode === 'register' && (
            <div className="mb-3">
              <input
                type="password"
                className={`form-control ${errors.confirmPassword ? 'is-invalid' : ''}`}
                placeholder="Confirm Password"
                {...register('confirmPassword')}
              />
              {errors.confirmPassword && (
                <div className="invalid-feedback">
                  {errors.confirmPassword.message}
                </div>
              )}
            </div>
          )}

          <button type="submit" className="btn btn-primary w-100">
            {mode === 'login' ? 'Login' : 'Register'}
          </button>
        </form>

        <div className="text-center mt-3">
          {mode === 'login' ? (
            <span>
              Don&apos;t have an account?{' '}
              <button
                className="btn btn-link p-0"
                onClick={() => {
                  setMode('register');
                  reset();
                }}
              >
                Register
              </button>
            </span>
          ) : (
            <span>
              Already have an account?{' '}
              <button
                className="btn btn-link p-0"
                onClick={() => {
                  setMode('login');
                  reset();
                }}
              >
                Login
              </button>
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoginRegister;
