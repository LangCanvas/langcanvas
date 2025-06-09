
// Version utility to get application version information
export const getAppVersion = () => {
  // Simulate a realistic version number with Major.Minor.Patch.Build format
  const major = 3;
  const minor = 4;
  const patch = 203;
  const build = 42343;
  
  return `v${major}.${minor}.${patch}.${build}`;
};

export const getVersionInfo = () => {
  return {
    version: getAppVersion(),
    buildDate: new Date().toISOString().split('T')[0], // Current date as build date
  };
};
