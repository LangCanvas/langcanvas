
import React from 'react';
import { getAppVersion } from '../../utils/version';

const Footer: React.FC = () => {
  const version = getAppVersion();

  return (
    <footer className="bg-gray-50 border-t border-gray-200 px-4 py-2">
      <div className="flex justify-center">
        <span className="text-sm text-gray-500 font-medium">
          {version}
        </span>
      </div>
    </footer>
  );
};

export default Footer;
