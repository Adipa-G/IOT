import { render, fireEvent, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom';
import '@testing-library/jest-dom'

import Routes from './../routes';
import Layout from './Layout';

describe('UI', () => {
    test('renders the header', async () => {
        render(<MemoryRouter initialEntries={Routes}>
            <Layout />
        </MemoryRouter>);

        const header = screen.getByTestId('navbar');
        expect(header).toBeVisible();
    });
})