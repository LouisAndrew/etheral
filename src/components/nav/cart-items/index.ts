import { CartItems, Props } from './cart-items';

import { connect } from 'react-redux';

import { State as ReduxState } from 'state/createStore';
import { IState as ICurrencyState } from 'state/reducers/currency-reducer';

const mapStateToProps = (state: ReduxState) => ({
    currency: state.currencyReducer.currency,
});

export default connect<ICurrencyState, Props, {}, ReduxState>(mapStateToProps)(
    CartItems
);
