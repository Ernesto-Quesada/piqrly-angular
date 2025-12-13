import { QrViewResponse } from '../../models/qr-read-response';

export const initialDataState: QrViewResponse = JSON.parse(
  localStorage.getItem('appState') || '{}'
)?.landingData ?? {
  pictures: [],
  qr: '',
  price: { small: 0, full: 0 },
  user: {},
};
