import {createNavigationContainerRef} from '@react-navigation/native';

export const navigationRef = createNavigationContainerRef();


let pendingRoute = null;

export const navigateWhenReady = (name, params) => {
  if (navigationRef.isReady()) {
    navigationRef.navigate(name, params);
    return;
  }

  pendingRoute = {name, params};
};

export const flushPendingNavigation = () => {
  if (!pendingRoute || !navigationRef.isReady()) {
    return;
  }

  const {name, params} = pendingRoute;
  pendingRoute = null;
  navigationRef.navigate(name, params);
};
