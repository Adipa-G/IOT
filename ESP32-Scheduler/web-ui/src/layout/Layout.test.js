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

    /*test('select game link is present', () => {
        renderComponent();

        const selectGameLink = screen.getByTestId('game-select');
        expect(selectGameLink).toBeInTheDocument();
    });

    it("navigates to select game screen when clicked on the link", () => {
        renderComponent();

        const selectGameLink = screen.getByText(/Select Game/i);
        selectGameLink.dispatchEvent(new MouseEvent("click", { bubbles: true }));

        const gameSelectComponent = screen.getByTestId('game-select');
        expect(gameSelectComponent).toBeInTheDocument();
    });*/
})