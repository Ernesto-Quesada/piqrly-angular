import { LandingData } from '../../models/image';

export const initialDataState: LandingData = JSON.parse(
  localStorage.getItem('appState') || '{}'
)?.landingData ?? {
  pictures: [],
  qr: '',
  price: { small: 0, full: 0 },
  user: {},
};
