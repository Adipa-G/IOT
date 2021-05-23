import { act, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from "react-router-dom";

import Menu from './Menu';
import Routes from './../routes';

const renderComponent = () => {
    render(
        <MemoryRouter initialEntries={Routes}>
            <Menu />
        </MemoryRouter>
    );
}

describe('when menu rendered', () => {
    beforeEach(() => {
    });

    test('shows all menus', async () => {
        await act(async () => { renderComponent(); });

        await waitFor(() => {
            expect(screen.queryByTestId('menu-admin')).toBeInTheDocument();
            expect(screen.queryByTestId('menu-dashboard')).toBeInTheDocument();
            expect(screen.queryByTestId('menu-pin-config')).toBeInTheDocument();
            expect(screen.queryByTestId('menu-power-config')).toBeInTheDocument();
            expect(screen.queryByTestId('menu-connect-to-wifi')).toBeInTheDocument();
        });
    });
})