import { useSelector } from 'react-redux';
import { RootState } from '../app/store';

export const useAuth = () => {
  const token = useSelector((state: RootState) => state.auth.token);
  const email = useSelector((state: RootState) => state.auth.email);

  return { token, email, isAuthenticated: !!token };
};