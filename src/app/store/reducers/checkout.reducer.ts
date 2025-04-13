import { createReducer, on } from '@ngrx/store';
import { cartTotalPricesAction} from '../actions/cart.actions';


import { initialCheckoutState } from '../state/checkout.state';
import { checkoutCartSuccess, setCheckoutData } from '../actions/checkout-cart.actions';
import { CheckoutCartPayload } from '../../models/shopCart';


export const checkoutReducer = createReducer<CheckoutCartPayload>(
    initialCheckoutState,
    on(cartTotalPricesAction, (state, { totalPrice  }) => ({
        ...state,
        totalPrice: totalPrice
    })),
    on(setCheckoutData, (state, { images, chosenSize, totalPrice }) => ({
        ...state,
        images,
        chosenSize,
        totalPrice
    })),


    on(checkoutCartSuccess, (state) => ({
    ...state,
    // Clear cart after successful checkout.
    selectedPictures: [],
    prices: { small: 0, full: 0 }, 
    chosenSize: null
    })),
    
  
  );
