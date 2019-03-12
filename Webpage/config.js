module.exports = {
  projectId: 'swt-mu',
  keyFilename: './key.json',
  email: 'smartwashertracker@gmail.com',
  emailPassword: '...@......_washer',
  cookieSecret: 'D738BAC55117DD662673C85A94854',//256-bit WEP Keys
  oauth2: {
    clientId: '301016823163-0o66dnc9m5o7octpa5ims3p5cborifsr.apps.googleusercontent.com',
    clientSecret: 'JwHwmnsZr3F0pIZdpFKkVnSI',
    redirectUrl: process.env.REDIRECT_URL || 'https://8080-dot-4671983-dot-devshell.appspot.com/oauth2callback',
    redirectUrlForAddDevice: 'https://8080-dot-4671983-dot-devshell.appspot.com/oauth2callbackAddDevice'
  }
};
