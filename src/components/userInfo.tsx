import {
    Box,
    Divider,
    FormControl,
    InputLabel,
    LinearProgress,
    LinearProgressProps,
    MenuItem,
    Paper,
    Select,
    SelectChangeEvent,
    Slider,
    Stack,
    Typography,
} from '@mui/material';
import { useSnackbar } from 'notistack';
import React, { useState } from 'react';
import * as Realm from 'realm-web';
import { TakenLeaves, YearsResults } from '../model';
import { CLUSTER_NAME, COLLECTION_NAME, DATABASE_NAME, LEAVE_MARKS } from '../utils';

const currentYear = new Date().getFullYear();

type LeavesProps = {
    user: Realm.User;
    selectedYear: number;
    refresh: boolean;
    onSelectedYearChange: (year: number) => void;
};
export function UserInfo({ user, selectedYear, refresh, onSelectedYearChange }: LeavesProps) {
    const [yearsOptions, setYearsOptions] = useState<number[]>([]);
    const [takenLeaves, setTakenLeaves] = useState<number>(0);
    const [totalLeaves, setTotalLeaves] = useState<number>(20);
    const { enqueueSnackbar } = useSnackbar();
    const mongo = user.mongoClient(CLUSTER_NAME);
    const items = mongo.db(DATABASE_NAME).collection(COLLECTION_NAME);

    React.useEffect(() => {
        items
            .aggregate([
                { $match: { year: selectedYear } },
                {
                    $group: {
                        _id: null,
                        takenLeaves: {
                            $sum: '$days',
                        },
                    },
                },
            ])
            .then((docs: TakenLeaves[]) => {
                if (docs.length > 0) {
                    setTakenLeaves(docs[0].takenLeaves);
                } else {
                    setTakenLeaves(0);
                }
            });

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedYear, refresh, totalLeaves]);

    React.useEffect(() => {
        user.refreshCustomData();
        setTotalLeaves(Number(user.customData.total_leaves));

        items.aggregate([{ $group: { _id: '$year' } }]).then((docs: YearsResults[]) => {
            const years = docs.map((item) => item._id);
            if (!years.includes(currentYear)) {
                years.push(currentYear);
            }
            years.sort();
            years.reverse();
            setYearsOptions(years);
            onSelectedYearChange(currentYear);
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleChangeYear = (event: SelectChangeEvent<number>) => {
        onSelectedYearChange(event.target.value as number);
    };

    const totalLeavesChange = (event: Event, value: number | Array<number>, _activeThumb: number) => {
        const userCustomData = mongo.db(DATABASE_NAME).collection('user');
        userCustomData
            .updateOne({ owner_id: user.id }, { $set: { total_leaves: value.toString() } })
            .then(() => {
                enqueueSnackbar('Total Leaves updated successfully.', { variant: 'success' });
                // Refresh the user's local customData property
                user.refreshCustomData();
                setTotalLeaves(value as number);
            })
            .catch((err) => {
                enqueueSnackbar('Error updating total leaves.', { variant: 'error' });
                console.error(`Failed to update item: ${err}`);
            });
    };

    function LinearProgressWithLabel(props: LinearProgressProps & { value: number }) {
        return (
            <Box sx={{ width: '100%', display: 'flex', alignItems: 'center' }}>
                <Box sx={{ width: '100%', mr: 1 }}>
                    <LinearProgress variant='determinate' {...props} />
                </Box>
                <Box sx={{ minWidth: 35 }}>
                    <Typography variant='body2' color='text.secondary'>{`${Math.round(props.value)}%`}</Typography>
                </Box>
            </Box>
        );
    }

    return (
        <Paper sx={{ padding: 2 }} elevation={3}>
            <Stack spacing={3}>
                <Typography component='h3' variant='h3' align='center'>
                    User Info
                </Typography>
                <Typography component='h4' variant='h4'>
                    Name
                </Typography>
                <Typography component='h5' variant='h5'>
                    {user.customData.name as string}
                </Typography>
                <Typography component='h4' variant='h4'>
                    Total Annual Leaves
                </Typography>
                <Slider
                    aria-label='Always visible'
                    value={totalLeaves}
                    onChange={totalLeavesChange}
                    step={null}
                    marks={LEAVE_MARKS}
                    min={LEAVE_MARKS.at(0)?.value}
                    max={LEAVE_MARKS.at(-1)?.value}
                    valueLabelDisplay='on'
                />
                <Typography component='h4' variant='h4'>
                    Remaining Annual Leaves
                </Typography>
                <Stack
                    direction='row'
                    spacing={2}
                    alignItems='center'
                    divider={<Divider orientation='vertical' flexItem />}
                >
                    <Typography component='h5' variant='h5'>
                        {totalLeaves - takenLeaves}
                    </Typography>
                    <LinearProgressWithLabel value={100 - (takenLeaves / totalLeaves) * 100} />
                </Stack>
                {selectedYear !== -1 && (
                    <FormControl fullWidth>
                        <InputLabel id='select-year-label'>Year</InputLabel>
                        <Select
                            labelId='select-year-label'
                            id='select-year'
                            value={selectedYear}
                            label='Year'
                            onChange={handleChangeYear}
                        >
                            {yearsOptions.map((year) => (
                                <MenuItem key={year} value={year}>
                                    {year}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                )}
            </Stack>
        </Paper>
    );
}
