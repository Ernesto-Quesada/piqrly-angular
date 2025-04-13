import { provideState, provideStore } from '@ngrx/store';
import { provideStoreDevtools } from '@ngrx/store-devtools';
import { provideEffects } from '@ngrx/effects';
import { localStorageMetaReducer } from './meta-reducers/local-storage.metareducer';
import { shopCartReducer } from './reducers/shopcart.reducer';
import { ShopCartEffects } from './effects/shopcart.effects';
import { landingDataReducer } from './reducers/landingData.reducer';
import { LandingDataEffects } from './effects/landingData.effects';
export const appStoreProviders = [
  provideStore(
    { landingData: landingDataReducer, shopCart: shopCartReducer },
    { metaReducers: [localStorageMetaReducer] }
  ),
  provideEffects([ShopCartEffects, LandingDataEffects]),

  provideStoreDevtools({
    maxAge: 25, // Retains last 25 states
  }),
];
