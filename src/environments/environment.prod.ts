import { initializeApp } from 'firebase/app';
import { getAnalytics } from 'firebase/analytics';

export const environment = {
  production: true,
  apiBaseUrl: 'https://api.piqrly.com',
  webBaseUrl: 'https://piqrly.com',
  cloudfrontBaseUrl: 'https://d1z4r9m5dhahdu.cloudfront.net',
  stripePublishableKey:
    'pk_test_51RCXTD4Je26dbkiYQmhsN66oK2Z4LQF2owx1Ybscen0YJnnRV0YuIzCr2HySJHJHE4bGm6BcBXqPuuFIVsnBYLtu00ffGSM70m',
  // Import the functions you need from the SDKs you need

  // TODO: Add SDKs for Firebase products that you want to use
  // https://firebase.google.com/docs/web/setup#available-libraries

  // Your web app's Firebase configuration
  // For Firebase JS SDK v7.20.0 and later, measurementId is optional
  firebaseConfig: {
    apiKey: 'AIzaSyAONyGU5q5Qg03-enf5euPlHAPExtmh7ME',
    authDomain: 'piqrly-dev.firebaseapp.com',
    projectId: 'piqrly-dev',
    storageBucket: 'piqrly-dev.firebasestorage.app',
    messagingSenderId: '653787285225',
    appId: '1:653787285225:web:038a7404985a9a8c9ed278',
    measurementId: 'G-4VESB08E6C',
  },
};
