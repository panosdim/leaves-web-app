import { ThemeProvider } from '@emotion/react';
import { createTheme, responsiveFontSizes } from '@mui/material';
import * as React from 'react';
import * as Realm from 'realm-web';
import { Header, Leaves } from '../components';

type MainProps = {
    user: Realm.User;
    setUser: (user: Realm.User | null) => void;
};
export const Main = ({ user, setUser }: MainProps) => {
    let theme = createTheme();
    theme = responsiveFontSizes(theme);

    return (
        <ThemeProvider theme={theme}>
            <Header user={user} setUser={setUser} />
            <Leaves user={user} />
        </ThemeProvider>
    );
};
