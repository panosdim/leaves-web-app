import LoadingButton from '@mui/lab/LoadingButton';
import { Avatar, Grid, Paper } from '@mui/material';
import Box from '@mui/material/Box';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useSnackbar } from 'notistack';
import * as React from 'react';
import { Controller, useForm } from 'react-hook-form';
import * as Realm from 'realm-web';
import backgroundImage from '../images/background.jpg';
import logo from '../images/logo.png';
import { app } from '../utils';

type LoginProps = {
    setUser: (user: Realm.User) => void;
};
export function Login({ setUser }: LoginProps) {
    const { enqueueSnackbar } = useSnackbar();
    const [isSubmitting, setIsSubmitting] = React.useState(false);

    async function loginEmailPassword(email: string, password: string) {
        const credentials = Realm.Credentials.emailPassword(email, password);
        try {
            // Authenticate the user
            const user = await app.logIn(credentials);
            setIsSubmitting(false);
            setUser(user);
        } catch (err) {
            setIsSubmitting(false);
            enqueueSnackbar('Login error. Please check your email or password.', { variant: 'error' });
        }
    }

    interface IFormInput {
        email: string;
        password: string;
    }

    const {
        control,
        formState: { errors },
        handleSubmit,
    } = useForm<IFormInput>({
        defaultValues: {
            email: '',
            password: '',
        },
    });

    const onSubmit = async (data: IFormInput) => {
        setIsSubmitting(true);
        await loginEmailPassword(data.email, data.password);
    };

    return (
        <Grid container component='main' sx={{ height: '100vh' }}>
            <CssBaseline />
            <Grid
                item
                xs={false}
                sm={4}
                md={7}
                sx={{
                    backgroundImage: `url(${backgroundImage})`,
                    backgroundRepeat: 'no-repeat',
                    backgroundColor: (t) => (t.palette.mode === 'light' ? t.palette.grey[50] : t.palette.grey[900]),
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                }}
            />
            <Grid item xs={12} sm={8} md={5} component={Paper} elevation={6} square>
                <Box
                    sx={{
                        my: 8,
                        mx: 4,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                    }}
                >
                    <Avatar sx={{ m: 1 }} src={logo} variant='rounded' />
                    <Typography component='h1' variant='h5'>
                        Sign in
                    </Typography>
                    <Box component='form' onSubmit={handleSubmit(onSubmit)} noValidate sx={{ mt: 1 }}>
                        <Controller
                            name='email'
                            control={control}
                            rules={{
                                required: 'This field is required',
                                pattern: {
                                    value: /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
                                    message: 'Please provide a valid mail',
                                },
                            }}
                            render={({ field }) => (
                                <TextField
                                    {...field}
                                    id='email'
                                    label='Email'
                                    fullWidth
                                    variant='outlined'
                                    type='email'
                                    required
                                    error={!!errors.email}
                                    helperText={errors?.email?.message}
                                    autoComplete='email'
                                    margin='normal'
                                />
                            )}
                        />

                        <Controller
                            name='password'
                            control={control}
                            rules={{
                                required: 'This field is required',
                            }}
                            render={({ field }) => (
                                <TextField
                                    {...field}
                                    id='password'
                                    label='Password'
                                    fullWidth
                                    required
                                    variant='outlined'
                                    type='password'
                                    autoComplete='current-password'
                                    error={!!errors.password}
                                    helperText={errors?.password?.message}
                                    margin='normal'
                                />
                            )}
                        />
                        <LoadingButton
                            loading={isSubmitting}
                            type='submit'
                            fullWidth
                            variant='contained'
                            sx={{ mt: 3, mb: 2 }}
                        >
                            Sign In
                        </LoadingButton>
                    </Box>
                </Box>
            </Grid>
        </Grid>
    );
}
