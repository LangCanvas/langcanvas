
// Version utility to get application version information
export const getAppVersion = () => {
  const major = 0;
  const minor = 0;
  
  // Get patch version from environment variable (set during build)
  // or fall back to a development default
  const commitCount = import.meta.env.VITE_COMMIT_COUNT;
  const patch = commitCount ? parseInt(commitCount, 10) : 1;
  
  return `v${major}.${minor}.${patch}`;
};

export const getVersionInfo = () => {
  return {
    version: getAppVersion(),
    buildDate: new Date().toISOString().split('T')[0], // Current date as build date
  };
};
