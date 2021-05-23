import { act, render, screen } from '@testing-library/react';
import { MemoryRouter } from "react-router-dom";

import Routes from './../routes';
import Layout from './Layout';

const renderComponent = () => {
    render(
        <MemoryRouter initialEntries={Routes}>
            <Layout />
        </MemoryRouter>
    );
}

describe('UI', () => {
    test('renders the header', async () => {
        await act(async () => { renderComponent(); });

        const header = screen.getByTestId('navbar');
        expect(header).toBeVisible();
    });
})