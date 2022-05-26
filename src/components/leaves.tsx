import AddIcon from '@mui/icons-material/Add';
import { Box, Fab, Grid } from '@mui/material';
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
            <Box sx={{ display: 'flex' }}>
                <Fab
                    sx={{
                        position: { xl: 'absolute', xs: 'block' },
                        bottom: { xl: 16 },
                        right: { xl: 16 },
                        margin: { xs: '0 auto' },
                    }}
                    variant='extended'
                    color='primary'
                    onClick={createNewLeave}
                    aria-label='New Entry'
                >
                    <AddIcon sx={{ mr: 1 }} />
                    New Entry
                </Fab>
            </Box>
            <LeaveForm
                user={user}
                open={isLeaveModalOpen}
                selectedYear={selectedYear}
                leaveItem={selectedItem}
                onClose={onClose}
            />
            <Grid
                sx={{
                    padding: 2,
                }}
                container
                spacing={3}
                justifyContent='space-around'
            >
                <Grid item xs={12} lg={4}>
                    <UserInfo
                        user={user}
                        refresh={refresh}
                        selectedYear={selectedYear}
                        onSelectedYearChange={onSelectedYearChange}
                    />
                </Grid>
                <Grid item xs={12} lg={8}>
                    <LeavesTable
                        user={user}
                        selectedYear={selectedYear}
                        refresh={refresh}
                        onSelectionChange={onSelectedRowChanged}
                    />
                </Grid>
            </Grid>
        </>
    );
}
