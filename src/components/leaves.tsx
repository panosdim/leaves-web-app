import { Grid, Stack, TextField } from '@mui/material';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import React, { useState } from 'react';
import * as Realm from 'realm-web';
import { LeavesTable, UserInfo } from '.';

type LeavesProps = {
    user: Realm.User;
};
export function Leaves({ user }: LeavesProps) {
    const [selectedYear, setSelectedYear] = useState(-1);
    const [value, setValue] = React.useState<Date | null>(null);

    const onSelectedYearChange = (year: number) => {
        setSelectedYear(year);
    };

    return (
        <>
            <Grid
                sx={{
                    width: '100%',
                    padding: 2,
                }}
                container
                spacing={3}
                justifyContent='space-around'
            >
                <Grid item xs={3}>
                    <UserInfo user={user} selectedYear={selectedYear} onSelectedYearChange={onSelectedYearChange} />
                </Grid>
                <Grid item xs={9}>
                    <Stack spacing={2}>
                        <LeavesTable user={user} selectedYear={selectedYear} />
                        <LocalizationProvider dateAdapter={AdapterDateFns}>
                            <DatePicker
                                label='Basic example'
                                value={value}
                                onChange={(newValue) => {
                                    setValue(newValue);
                                }}
                                renderInput={(params) => <TextField {...params} />}
                            />
                        </LocalizationProvider>
                    </Stack>
                </Grid>
            </Grid>
        </>
    );
}
