// import { Image, QrViewResponse } from '../models/image';

// [
//   {
//     id: '13',
//     pictureId: 'wSYRiDDzUhVO',
//     qrCode: '8571bdc201e98a615a49fa12c072ca605fb6dadd4e2e7b5150bee9528b4c6e33',
//     imageUrl:
//       'https://mypicapp.s3.us-east-2.amazonaws.com/wSYRiDDzUhVO?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20250415T194934Z&X-Amz-SignedHeaders=host&X-Amz-Expires=518400&X-Amz-Credential=AKIAQQABDQUGJF7KMCEE%2F20250415%2Fus-east-2%2Fs3%2Faws4_request&X-Amz-Signature=b26484ae3d928dfc1a7609fe3838b090576fe4710bb0e98678eaa383ab605efa',
//     createdAt: '2025-04-15T15:49:35.535208',
//   },
//   {
//     id: '14',
//     pictureId: 'wSYRiDDzUhVO',
//     qrCode: '8571bdc201e98a615a49fa12c072ca605fb6dadd4e2e7b5150bee9528b4c6e33',
//     imageUrl:
//       'https://mypicapp.s3.us-east-2.amazonaws.com/wSYRiDDzUhVO?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20250415T202928Z&X-Amz-SignedHeaders=host&X-Amz-Expires=518400&X-Amz-Credential=AKIAQQABDQUGJF7KMCEE%2F20250415%2Fus-east-2%2Fs3%2Faws4_request&X-Amz-Signature=1ddb87ae4f2d6010cfa176ea51a437fd9e0fec15d06ed5619dfdf65fdf60d782',
//     createdAt: '2025-04-15T16:29:28.817305',
//   },
// ];

// const images: Image[] = [
//   {
//     pictureId: 'qbros',
//     QrViewResponse: './../../assets/images/Qbros.JPG',
//   },
//   {
//     pictureId: 'ninaperu',
//     url: './../../assets/images/ninaperu.JPG',
//   },
//   {
//     pictureId: 'astronaut_line',
//     url: './../../assets/images/astronaut_line.JPG',
//   },
//   { pictureId: 'granada', url: './../../assets/images/granada.JPG' },
//   { pictureId: 'lakekiki', url: './../../assets/images/lakekiki.JPG' },
//   { pictureId: 'machupichu', url: './../../assets/images/machupichu.JPG' },
//   { pictureId: 'anthonybike', url: './../../assets/images/anthonybike.JPG' },
//   { pictureId: 'kids3', url: './../../assets/images/kids3.JPG' },
//   { pictureId: 'kilimanj', url: './../../assets/images/kilimanj.JPG' },
//   { pictureId: 'shaving', url: './../../assets/images/shaving.JPG' },
//   { pictureId: 'ironman', url: './../../assets/images/ironman.JPG' },
// ];
// // export default images; // Export the array of images for use in other parts of the application

// const landingDataMock: QrViewResponse = {
//   pictures: images, // Array of images
//   qr: '12345', // QR code ID
//   price: { small: 1.3, full: 15 }, // Price object containing small and full prices
//   user: {
//     // User information
//     name: 'John Doe', // User's name
//     email: 'myphoto@mypics.com', // User's email
//     phone: '1234567890', // User's phone number
//     business: {
//       // Optional business information
//       companyName: 'My Company', // Name of the company
//       companyEmail: 'some@email.com', // Email of the company
//       companyAddress: '123 Main St', // Address of the company
//       companyPhone: '0987654321', // Phone number of the company
//       companyWebsite: 'www.mycompany.com', // Website of the company
//       companyLogo: './../../assets/images/logo.png', // Logo of the company
//     },
//   },
// };
// export default landingDataMock; // Export the landing data for use in other parts of the application
