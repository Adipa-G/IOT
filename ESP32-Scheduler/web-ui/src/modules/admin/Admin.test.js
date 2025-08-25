import { act, render, fireEvent, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router';
import '@testing-library/jest-dom'

import ApiService from '../../services/ApiService';

import Admin from './Admin'; 

describe('when reboot', () => {
    beforeEach(() => {
        jest.useFakeTimers();
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    test('show loading while health is waiting', async () => {
        jest.spyOn(ApiService, 'reboot').mockReturnValue(new Promise(() => { }));
        jest.spyOn(ApiService, 'getHealth').mockReturnValue(new Promise(() => { }));

        await act(async() => {render(<Admin/>)});

        await act(async() => {fireEvent.click(screen.getByTestId('reboot-button'))});

        await act(async() => {
            jest.advanceTimersByTime(11000);
            jest.clearAllTimers();
        });

        expect(screen.queryByTestId('admin-loading-state')).toBeInTheDocument();
        expect(screen.queryByTestId('reboot-button')).not.toBeInTheDocument();
    });

    test('show button once health returned a valid response', async () => {
        jest.spyOn(ApiService, 'reboot').mockReturnValue(new Promise(() => { }));
        jest.spyOn(ApiService, 'getHealth').mockReturnValue(Promise.resolve({}));

        await act(async() => {render(<Admin/>)});

        await act(async() => {fireEvent.click(screen.getByTestId('reboot-button'))});

        await act(async() => {
            jest.advanceTimersByTime(11000);
            jest.clearAllTimers();
        });

        expect(screen.queryByTestId('reboot-button')).toBeInTheDocument();
        expect(screen.queryByTestId('admin-loading-state')).not.toBeInTheDocument();
    });
})