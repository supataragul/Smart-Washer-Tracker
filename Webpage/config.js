/*
   Copyright 2016, Google, Inc.
   Licensed under the Apache License, Version 2.0 (the "License");
   you may not use this file except in compliance with the License.
   You may obtain a copy of the License at
       http://www.apache.org/licenses/LICENSE-2.0
   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
*/

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
