import { render, fireEvent, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom';
import '@testing-library/jest-dom'

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
    test('shows all menus', async () => {
        render(
            <MemoryRouter initialEntries={Routes}>
                <Menu />
            </MemoryRouter>
        );

        expect(screen.queryByTestId('menu-admin')).toBeInTheDocument();
        expect(screen.queryByTestId('menu-dashboard')).toBeInTheDocument();
        expect(screen.queryByTestId('menu-pin-config')).toBeInTheDocument();
        expect(screen.queryByTestId('menu-power-config')).toBeInTheDocument();
        expect(screen.queryByTestId('menu-connect-to-wifi')).toBeInTheDocument();
    });
})