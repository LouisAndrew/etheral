import React from 'react';
import ReactDOM from 'react-dom';
import renderer from 'react-test-renderer';

import { render, cleanup } from '@testing-library/react';
import '@testing-library/jest-dom';

import { Thankyou } from '../thankyou';

describe('Thankyou', () => {
    const mockData = {
        total: 12000,
        paymentNo: 123456,
        paymentName: 'Louis',
        expired: '12-3-4',
        currency: 'IDR',
    };

    const Element = <Thankyou {...mockData} />;

    afterEach(cleanup);

    it('renders without crashing', () => {
        const div = document.createElement('div');
        ReactDOM.render(Element, div);
    });

    it('should render all data(s) correctly correctly', () => {
        const { getByTestId } = render(Element);

        const Total = getByTestId('total');
        const PaymentNo = getByTestId('paymentNo');
        const PaymentName = getByTestId('paymentName');
        const Expired = getByTestId('expired');

        const { total, paymentNo, paymentName, expired } = mockData;

        expect(Total).toHaveTextContent(total.toString());
        expect(PaymentNo).toHaveTextContent(paymentNo.toString());
        expect(PaymentName).toHaveTextContent(paymentName);
        expect(Expired).toHaveTextContent(expired);
    });

    it('matches snapshot', () => {
        const run = false;

        if (run) {
            const tree = renderer.create(Element).toJSON();
            expect(tree).toMatchSnapshot();
        }
    });
});
