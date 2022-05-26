import { Box, Button, Grid, Paper, Typography, useMediaQuery, useTheme } from '@mui/material';
import * as Realm from 'realm-web';
import logo from '../images/logo.png';

type HeaderProps = {
    user: Realm.User;
    setUser: (user: Realm.User | null) => void;
};
export function Header({ user, setUser }: HeaderProps) {
    async function logout() {
        user && (await user.logOut());
        setUser(null);
    }

    const theme = useTheme();
    const isSmallScreen = useMediaQuery(theme.breakpoints.down('md'));

    return (
        <Grid
            sx={{
                padding: 2,
                paddingBottom: 4,
            }}
            container
            spacing={1}
            alignItems='center'
            justifyContent='space-between'
        >
            <Grid item xs={12}>
                <Paper sx={{ padding: 2 }} elevation={3}>
                    <Grid container spacing={1} alignItems='center' justifyContent='space-between'>
                        <Grid item>
                            <Box sx={{ display: 'flex', justifyContent: 'flex-start' }}>
                                <img style={{ borderRadius: '8px' }} src={logo} alt='logo' width='64' height='64' />
                            </Box>
                        </Grid>
                        {isSmallScreen ? null : (
                            <Grid item>
                                <Typography component='h3' variant='h3' align='center'>
                                    Annual Leaves
                                </Typography>
                            </Grid>
                        )}
                        <Grid item>
                            <Box
                                sx={{
                                    display: 'flex',
                                    justifyContent: 'flex-end',
                                }}
                            >
                                <Button variant='contained' onClick={logout}>
                                    Sign out
                                </Button>
                            </Box>
                        </Grid>
                    </Grid>
                </Paper>
            </Grid>
        </Grid>
    );
}
