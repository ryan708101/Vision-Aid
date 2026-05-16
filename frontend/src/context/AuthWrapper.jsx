// components/AuthWrapper.jsx
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getUser } from '../redux/userSlice';


export const AuthWrapper = ({ children }) => {
    const dispatch = useDispatch();
    const token = useSelector(state => state.user.token);


    useEffect(() => {
        if (token) {
            dispatch(getUser(token));
        }
    }, [token, dispatch]);

    return children;
};