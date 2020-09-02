import React, { useState } from 'react';
import { Flex, Box } from 'rebass';
import Navigation from './navigation';

type Props = {
    logout: () => void;
};

export enum StateViews {
    ORDERS,
    ADMINS,
    LINKS,
    NONE,
}

const Dashboard: React.FC<Props> = ({ logout }) => {
    const [view, setView] = useState<StateViews>(StateViews.NONE);

    const changeView = (viewName: StateViews) => {
        setView(viewName);
    };

    // eslint-disable-next-line immutable/no-let, @typescript-eslint/tslint/config
    let toRender;
    switch (view) {
        case StateViews.ORDERS:
            toRender = <h1>Orders</h1>;
            break;
        case StateViews.ADMINS:
            toRender = <h1>Admins</h1>;
            break;
        case StateViews.LINKS:
            toRender = <h1>Links</h1>;
            break;
        case StateViews.NONE:
            toRender = <h1>None</h1>;
            break;
        default:
            toRender = <h1>None</h1>;
            break;
    }

    return (
        <Flex data-testid="dashboard" min-height="100vh">
            {/* Navigation */}
            <Box position="sticky">
                <Navigation
                    logout={logout}
                    changeView={changeView}
                    inView={view}
                />
            </Box>
            <Box>{toRender}</Box>
        </Flex>
    );
};

export { Dashboard };