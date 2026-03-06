import { eventLandingDataLoad } from './actions/event.actions';
import { provideState, provideStore } from '@ngrx/store';
import { provideStoreDevtools } from '@ngrx/store-devtools';
import { provideEffects } from '@ngrx/effects';
import { localStorageMetaReducer } from './meta-reducers/local-storage.metareducer';
import { shopCartReducer } from './reducers/shopcart.reducer';
import { ShopCartEffects } from './effects/shopcart.effects';
import { landingDataReducer } from './reducers/landingData.reducer';
import { LandingDataEffects } from './effects/landingData.effects';
import { EventDataEffects } from './effects/events.effects';
import { eventLandingDataReducer } from './reducers/event.reducer';
import { GalleryEffects } from './effects/gallery.effects';
export const appStoreProviders = [
  provideStore(
    {
      landingData: landingDataReducer,
      shopCart: shopCartReducer,
      eventLandingDataLoad: eventLandingDataReducer,
    },
    { metaReducers: [localStorageMetaReducer] },
  ),
  provideEffects([
    ShopCartEffects,
    LandingDataEffects,
    EventDataEffects,
    GalleryEffects,
  ]),

  provideStoreDevtools({
    maxAge: 25, // Retains last 25 states
  }),
];
