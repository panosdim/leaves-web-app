import AddIcon from '@mui/icons-material/Add';
import { Fab, Grid, Stack } from '@mui/material';
import React, { useState } from 'react';
import * as Realm from 'realm-web';
import { LeavesTable, UserInfo } from '.';
import { LeaveEntity } from '../model';
import { LeaveForm } from './leaveForm';

type LeavesProps = {
    user: Realm.User;
};
export function Leaves({ user }: LeavesProps) {
    const [selectedYear, setSelectedYear] = useState(-1);
    const [refresh, setRefresh] = useState(false);
    const [selectedItem, setSelectedItem] = useState<LeaveEntity | undefined>();
    const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);

    const onSelectedYearChange = (year: number) => {
        setSelectedYear(year);
    };

    const onClose = () => {
        setRefresh(!refresh);
        setSelectedItem(undefined);
        setIsLeaveModalOpen(false);
    };

    const createNewLeave = () => {
        setSelectedItem(undefined);
        setIsLeaveModalOpen(true);
    };

    const onSelectedRowChanged = (item: LeaveEntity | undefined) => {
        setSelectedItem(item);
        setIsLeaveModalOpen(true);
    };

    return (
        <>
            <Fab
                sx={{ position: 'absolute', bottom: 16, right: 16 }}
                variant='extended'
                color='primary'
                onClick={createNewLeave}
                aria-label='New Entry'
            >
                <AddIcon sx={{ mr: 1 }} />
                New Entry
            </Fab>
            <Grid
                sx={{
                    width: '100%',
                    padding: 2,
                }}
                container
                spacing={3}
                justifyContent='space-around'
            >
                <Grid item xs={4}>
                    <UserInfo
                        user={user}
                        refresh={refresh}
                        selectedYear={selectedYear}
                        onSelectedYearChange={onSelectedYearChange}
                    />
                </Grid>
                <Grid item xs={8}>
                    <Stack spacing={2}>
                        <LeavesTable
                            user={user}
                            selectedYear={selectedYear}
                            refresh={refresh}
                            onSelectionChange={onSelectedRowChanged}
                        />
                        <LeaveForm
                            user={user}
                            open={isLeaveModalOpen}
                            selectedYear={selectedYear}
                            leaveItem={selectedItem}
                            onClose={onClose}
                        />
                    </Stack>
                </Grid>
            </Grid>
        </>
    );
}
