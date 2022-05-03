import {
    Divider,
    FormControl,
    InputLabel,
    LinearProgress,
    MenuItem,
    Paper,
    Select,
    SelectChangeEvent,
    Stack,
    Typography,
} from '@mui/material';
import React, { useState } from 'react';
import * as Realm from 'realm-web';
import { TakenLeaves, YearsResults } from '../model';
import { CLUSTER_NAME, COLLECTION_NAME, DATABASE_NAME } from '../utils';

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
    const mongo = user.mongoClient(CLUSTER_NAME);
    const items = mongo.db(DATABASE_NAME).collection(COLLECTION_NAME);

    const handleChangeYear = (event: SelectChangeEvent<number>) => {
        onSelectedYearChange(event.target.value as number);
    };

    React.useEffect(() => {
        user.refreshCustomData();

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
    }, [selectedYear, refresh]);

    React.useEffect(() => {
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

    return (
        <Paper sx={{ padding: 2 }} elevation={3}>
            <Stack spacing={2}>
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
                <Typography component='h5' variant='h5'>
                    {user.customData.total_leaves as number}
                </Typography>
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
                        {(user.customData.total_leaves as number) - takenLeaves}
                    </Typography>
                    <LinearProgress
                        sx={{ width: '100%' }}
                        variant='determinate'
                        value={100 - (takenLeaves / (user.customData.total_leaves as number)) * 100}
                    />
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
