import { useEffect } from 'react';

import { initHomePage } from '@/lib/home';

const HomeController = () => {
  useEffect(() => {
    initHomePage();
  }, []);

  return null;
};

export default HomeController;
