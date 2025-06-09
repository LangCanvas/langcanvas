
import React from 'react';
import { getAppVersion } from '../../utils/version';

const Footer: React.FC = () => {
  const version = getAppVersion();

  return (
    <footer className="bg-gray-50 border-t border-gray-200 px-4 py-2">
      <div className="flex justify-end">
        <span className="text-xs text-gray-400 font-normal">
          {version}
        </span>
      </div>
    </footer>
  );
};

export default Footer;
