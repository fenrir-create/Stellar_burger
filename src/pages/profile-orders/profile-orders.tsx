import { ProfileOrdersUI } from '@ui-pages';
import { TOrder } from '@utils-types';
import { FC, useEffect } from 'react';
import { useSelector, useDispatch } from '@store';
import {
  getOrdersAll,
  getUserState
} from '../../services/slices/userSlice/userSlice';
import { getFeeds } from '../../services/slices/feedSlice/feedSlice';
import { Preloader } from '@ui';

export const ProfileOrders: FC = () => {
  const { userOrders, isLoading } = useSelector(getUserState);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(getOrdersAll());
    dispatch(getFeeds());
  }, []);

  if (isLoading === true) {
    return <Preloader />;
  }

  return <ProfileOrdersUI orders={userOrders} />;
};
