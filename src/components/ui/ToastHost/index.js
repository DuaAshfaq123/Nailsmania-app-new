import React from 'react';
import {useToastContext, useToastState} from '../../../context/ToastContext';
import Toast from '../Toast';


const ToastHost = () => {
  const toast = useToastState();
  const {hide} = useToastContext();

  return <Toast toast={toast} onDismiss={hide} />;
};

export default ToastHost;
