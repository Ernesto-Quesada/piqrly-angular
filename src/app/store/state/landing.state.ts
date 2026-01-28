import { QrViewResponse } from '../../models/qr-read-response';

export const initialDataState: QrViewResponse = {
  pictures: [],
  owner: null,
  forSale: false,
  price: null,

  // ✅ event header defaults
  eventName: null,
  isPublic: null,
  qrCode: null,
  isOwner: null,
  isInvited: null,
};
