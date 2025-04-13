import { Image, LandingData } from '../models/image';

const images: Image[] = [
  {
    pictureId: 'qbros',
    url: './../../assets/images/Qbros.JPG',
  },
  {
    pictureId: 'ninaperu',
    url: './../../assets/images/ninaperu.JPG',
  },
  {
    pictureId: 'astronaut_line',
    url: './../../assets/images/astronaut_line.JPG',
  },
  { pictureId: 'granada', url: './../../assets/images/granada.JPG' },
  { pictureId: 'lakekiki', url: './../../assets/images/lakekiki.JPG' },
  { pictureId: 'machupichu', url: './../../assets/images/machupichu.JPG' },
  { pictureId: 'anthonybike', url: './../../assets/images/anthonybike.JPG' },
  { pictureId: 'kids3', url: './../../assets/images/kids3.JPG' },
  { pictureId: 'kilimanj', url: './../../assets/images/kilimanj.JPG' },
  { pictureId: 'shaving', url: './../../assets/images/shaving.JPG' },
  { pictureId: 'ironman', url: './../../assets/images/ironman.JPG' },
];
// export default images; // Export the array of images for use in other parts of the application

const landingDataMock: LandingData = {
  pictures: images, // Array of images
  qr: '12345', // QR code ID
  price: { small: 10, full: 20 }, // Price object containing small and full prices
  user: {
    // User information
    name: 'John Doe', // User's name
    email: 'myphoto@mypics.com', // User's email
    phone: '1234567890', // User's phone number
    business: {
      // Optional business information
      companyName: 'My Company', // Name of the company
      companyEmail: 'some@email.com', // Email of the company
      companyAddress: '123 Main St', // Address of the company
      companyPhone: '0987654321', // Phone number of the company
      companyWebsite: 'www.mycompany.com', // Website of the company
      companyLogo: './../../assets/images/logo.png', // Logo of the company
    },
  },
};
export default landingDataMock; // Export the landing data for use in other parts of the application
